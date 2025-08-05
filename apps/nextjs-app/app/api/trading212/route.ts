// app/api/trading212/route.ts
import { NextResponse } from 'next/server'
import {
  getAccountCashSafe,
  getPortfolioSafe,
  getPiesSafe,
  getPieDetailSafe,
  getUsdGbpRateSafe,
} from '../../trading212/lib/server'

export async function GET() {
  const [cashRes, portRes, piesRes, fxRes] = await Promise.all([
    getAccountCashSafe(),
    getPortfolioSafe(),
    getPiesSafe(),
    getUsdGbpRateSafe(),
  ])

  // unwrap and safe‐default as you already do...
  // then fetch pie details _serially_ or with your pLimit(1):

  const pieDetails = []
  for (const p of piesRes.data ?? []) {
    const r = await getPieDetailSafe(p.id)
    if (r.ok && r.data) pieDetails.push(r.data)
  }

  return NextResponse.json(
    { cash: cashRes.data, portfolio: portRes.data, pies: piesRes.data, pieDetails, fx: fxRes.data },
    { headers: { 'Cache-Control': 'public, max-age=60' } }
  )
}
