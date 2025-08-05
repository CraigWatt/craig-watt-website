// app/api/trading212/route.ts
import { NextResponse } from 'next/server'
import {
  getAccountCashSafe,
  getPortfolioSafe,
  getPiesSafe,
  getPieDetailSafe,
  getUsdGbpRateSafe,
} from '../../trading212/lib/server'
import { transformForPublic } from '../../trading212/lib/transform'

let cachedPayload: ReturnType<typeof transformForPublic> | null = null
let lastFetched = 0
const TTL = 5 * 60 * 1000 // 10 minutes

export async function GET() {
  const now = Date.now()

  if (cachedPayload && now - lastFetched < TTL) {
    console.log(`[T212] Cache HIT at ${new Date().toISOString()}`)
    return NextResponse.json(cachedPayload, {
      headers: { 'Cache-Control': 'public, max-age=600' },
    })
  }

  console.log(`[T212] Cache MISS at ${new Date().toISOString()}`)

  const [cashRes, portRes, piesRes, fxRes] = await Promise.all([
    getAccountCashSafe(),
    getPortfolioSafe(),
    getPiesSafe(),
    getUsdGbpRateSafe(),
  ])

  if (!cashRes.ok || !portRes.ok || !piesRes.ok || !fxRes.ok) {
    console.warn('[T212] One or more upstream fetches failed')
    return NextResponse.json({ error: 'Upstream fetch failed' }, { status: 503 })
  }

  const pieDetails = []
  for (const p of piesRes.data ?? []) {
    const r = await getPieDetailSafe(p.id)
    if (r.ok && r.data) pieDetails.push(r.data)
  }

  const raw = {
    cash: cashRes.data!,
    portfolio: portRes.data!,
    pies: piesRes.data ?? [],
    pieDetails,
    fxRate: fxRes.data!,
  }

  const publicPayload = transformForPublic(raw)

  cachedPayload = publicPayload
  lastFetched = now

  return NextResponse.json(publicPayload, {
    headers: { 'Cache-Control': 'public, max-age=600' },
  })
}
