// app/api/trading212/route.ts

import { startCacheWarmer } from '../../trading212/lib/cacheWarmer';

if (process.env.NODE_ENV === 'production') {
  console.log('[WARM] Triggering cache warmer on boot...');
  startCacheWarmer();
}

import { NextResponse } from 'next/server';
import {
  getAccountCashSafe,
  getPortfolioSafe,
  getPiesSafe,
  getPieDetailSafe,
  getUsdGbpRateSafe,
} from '../../trading212/lib/server';
import { transformForPublic } from '../../trading212/lib/transform';
import { performance } from 'perf_hooks';

let cachedPayload: ReturnType<typeof transformForPublic> | null = null;
let lastSuccessfulPayload: ReturnType<typeof transformForPublic> | null = null;
let lastFetched = 0;
const TTL = 7 * 60 * 1000;
const STALE_TTL = 30 * 60 * 1000;
const INFLIGHT_TIMEOUT = 90_000;

let inFlight: Promise<NextResponse> | null = null;
let inFlightStart = 0;
let inFlightCount = 0;

export async function GET() {
  const requestStart = performance.now();
  const now = Date.now();

  // === Serve Fresh Cache ===
  if (cachedPayload && now - lastFetched < TTL) {
    const age = ((now - lastFetched) / 1000).toFixed(1);
    console.log(`[T212] Cache HIT at ${new Date().toISOString()} (age: ${age}s)`);
    return NextResponse.json(cachedPayload, {
      headers: { 'Cache-Control': 'public, max-age=600' },
    });
  }

  // === Await In-Flight Fetch ===
  if (inFlight && now - inFlightStart < INFLIGHT_TIMEOUT) {
    inFlightCount = Math.min(inFlightCount + 1, 999);
    console.log(`[T212] Awaiting in-flight fetch (${inFlightCount}) at ${new Date().toISOString()}`);

    if (lastSuccessfulPayload && now - lastFetched < STALE_TTL) {
      const age = ((now - lastFetched) / 1000).toFixed(1);
      console.warn(`[T212] Serving stale cache (${age}s old) while fresh fetch is in-flight`);
      return NextResponse.json(
        { ...lastSuccessfulPayload, _meta: { stale: true } },
        { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
      );
    }

    try {
      const res = await inFlight;
      return res;
    } catch (err) {
      console.warn('[T212] In-flight fetch errored:', err);
      inFlight = null;
      inFlightCount = 0;
      throw err;
    }
  }

  // === Initiate New Fetch ===
  console.log(`[T212] Cache MISS at ${new Date().toISOString()}`);
  inFlightStart = now;
  inFlightCount = 1;

  inFlight = (async () => {
    try {
      const timers: Record<string, number> = {};
      const measure = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
        const start = performance.now();
        const result = await fn();
        timers[label] = performance.now() - start;
        return result;
      };

      const [cashRes, portRes, piesRes, fxRes] = await Promise.all([
        measure('accountCash', getAccountCashSafe),
        measure('portfolio', getPortfolioSafe),
        measure('pies', getPiesSafe),
        measure('fxRate', getUsdGbpRateSafe),
      ]);

      if (!cashRes.ok || !portRes.ok || !piesRes.ok || !fxRes.ok) {
        console.warn('[T212] One or more upstream fetches failed');
        if (lastSuccessfulPayload && now - lastFetched < STALE_TTL) {
          const age = ((now - lastFetched) / 1000).toFixed(1);
          console.warn(`[T212] Serving stale cache (${age}s old) due to upstream fetch failure`);
          return NextResponse.json(
            { ...lastSuccessfulPayload, _meta: { stale: true } },
            { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
          );
        }

        return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 503 });
      }

      const pieDetails = [];
      for (const p of piesRes.data ?? []) {
        const pieStart = performance.now();
        const r = await getPieDetailSafe(p.id);
        if (r.ok && r.data) pieDetails.push(r.data);
        timers[`pie:${p.id}`] = performance.now() - pieStart;
      }

      const raw = {
        cash: cashRes.data!,
        portfolio: portRes.data!,
        pies: piesRes.data ?? [],
        pieDetails,
        fxRate: fxRes.data!,
      };

      const transformStart = performance.now();
      const publicPayload = transformForPublic(raw);
      timers.transform = performance.now() - transformStart;

      cachedPayload = publicPayload;
      lastSuccessfulPayload = publicPayload;
      lastFetched = Date.now();

      const totalTime = performance.now() - requestStart;
      console.log(`[T212] Done — total time: ${totalTime.toFixed(1)}ms`);
      Object.entries(timers).forEach(([label, ms]) =>
        console.log(`[T212] ${label.padEnd(15)} ${ms.toFixed(1)}ms`)
      );

      const devMeta =
        process.env.NODE_ENV !== 'production'
          ? {
              _meta: {
                fetchedAt: new Date().toISOString(),
                durationMs: Number(totalTime.toFixed(1)),
                timings: Object.fromEntries(
                  Object.entries(timers).map(([k, v]) => [k, Number(v.toFixed(1))])
                ),
                inFlightCount,
              },
            }
          : {};

      return NextResponse.json(
        { ...publicPayload, ...devMeta },
        { headers: { 'Cache-Control': 'public, max-age=600' } }
      );
    } finally {
      inFlight = null;
      inFlightCount = 0;
    }
  })();

  const res = await inFlight;

  if (!(res instanceof NextResponse)) {
    throw new Error('[T212] In-flight result is not a NextResponse');
  }

  // === Fallback: rare race where payload wasn't set yet
  if (!cachedPayload && lastSuccessfulPayload && now - lastFetched < STALE_TTL) {
    const age = ((now - lastFetched) / 1000).toFixed(1);
    console.warn(`[T212] Late fallback — serving stale cache (${age}s old)`);
    return NextResponse.json(
      { ...lastSuccessfulPayload, _meta: { stale: true, lateFallback: true } },
      { headers: { 'Cache-Control': 'public, max-age=60, stale-while-revalidate=300' } }
    );
  }

  return res;
}
