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

export async function GET() {
  const [ cashRes, portRes, piesRes, fxRes ] = await Promise.all([
    getAccountCashSafe(),
    getPortfolioSafe(),
    getPiesSafe(),
    getUsdGbpRateSafe(),
  ])

  // fetch pie details _serially_ (1/5s limit)
  const pieDetails = []
  for (const p of piesRes.data ?? []) {
    const r = await getPieDetailSafe(p.id)
    if (r.ok && r.data) pieDetails.push(r.data)
  }

  const raw = {
    cash:       cashRes.data!,
    portfolio:  portRes.data!,
    pies:       piesRes.data ?? [],
    pieDetails,
    fxRate:     fxRes.data!,
  }

  const publicPayload = transformForPublic(raw)

  return NextResponse.json(publicPayload, {
    headers: { 'Cache-Control': 'public, max-age=600' },
  })
}
