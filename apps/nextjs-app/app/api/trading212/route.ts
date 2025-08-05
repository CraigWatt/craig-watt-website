// app/api/trading212/route.ts
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
let lastFetched = 0;
const TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  const requestStart = performance.now();
  const now = Date.now();

  if (cachedPayload && now - lastFetched < TTL) {
    console.log(`[T212] Cache HIT at ${new Date().toISOString()}`);
    return NextResponse.json(cachedPayload, {
      headers: { 'Cache-Control': 'public, max-age=600' },
    });
  }

  console.log(`[T212] Cache MISS at ${new Date().toISOString()}`);

  const timers: Record<string, number> = {};
  const measure = async <T>(label: string, fn: () => Promise<T>): Promise<T> => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    timers[label] = end - start;
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
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 503 });
  }

  type PieDetail = {
    instruments: Array<{
      ticker: string;
      ownedQuantity: number;
      result: {
        priceAvgValue: number;
        priceAvgInvestedValue: number;
        priceAvgResult: number;
      };
    }>;
    settings: {
      name: string;
      id: number;
    };
  };

  const pieDetails: PieDetail[] = [];

  for (const p of piesRes.data ?? []) {
    const pieStart = performance.now();
    const r = await getPieDetailSafe(p.id);
    if (r.ok && r.data) pieDetails.push(r.data);
    timers[`pie:${p.id}`] = performance.now() - pieStart;
  }

  const transformStart = performance.now();
  const raw = {
    cash: cashRes.data!,
    portfolio: portRes.data!,
    pies: piesRes.data ?? [],
    pieDetails,
    fxRate: fxRes.data!,
  };
  const publicPayload = transformForPublic(raw);
  timers.transform = performance.now() - transformStart;

  cachedPayload = publicPayload;
  lastFetched = now;

  const totalTime = performance.now() - requestStart;
  console.log(`[T212] Done — total time: ${totalTime.toFixed(1)}ms`);
  Object.entries(timers).forEach(([label, ms]) =>
    console.log(`[T212] ${label.padEnd(15)} ${ms.toFixed(1)}ms`)
  );

  // Return timings as part of payload in dev only
  const devMeta =
    process.env.NODE_ENV !== 'production'
      ? {
          _meta: {
            fetchedAt: new Date().toISOString(),
            durationMs: Number(totalTime.toFixed(1)),
            timings: Object.fromEntries(
              Object.entries(timers).map(([k, v]) => [k, Number(v.toFixed(1))])
            ),
          },
        }
      : {};

  return NextResponse.json(
    {
      ...publicPayload,
      ...devMeta,
    },
    {
      headers: { 'Cache-Control': 'public, max-age=600' },
    }
  );
}
