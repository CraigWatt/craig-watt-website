// app/trading212/page.tsx
import { Metadata } from 'next'
import Dashboard from '../components/Dashboard'
import {
  getAccountCashSafe,
  getPortfolioSafe,
  getPiesSafe,
  getPieDetailSafe,
  getUsdGbpRate,
} from './lib/server'

function simplifyTicker(t: string) {
  return t.split('_')[0]
}

export const metadata: Metadata = {
  title: 'Trading 212 Dashboard',
}

export default async function Trading212Page() {
  const [ cash, portfolio, pies, fxRate ] = await Promise.all([
    getAccountCashSafe(),
    getPortfolioSafe(),
    getPiesSafe(),
    getUsdGbpRate(),
  ])

  const pieDetails = (
    await Promise.all(pies.map(p => getPieDetailSafe(p.id)))
  ).filter((d): d is NonNullable<typeof d> => !!d)

  // build lookup for slice‐value, slice‐P/L and slice‐invested (GBP)
  const sliceValueMap: Record<string, number> = {}
  const slicePplMap:   Record<string, number> = {}
  const sliceCostMap:  Record<string, number> = {}
  for (const pd of pieDetails) {
    for (const instr of pd.instruments) {
      sliceValueMap[instr.ticker]      = instr.result.priceAvgValue
      slicePplMap[instr.ticker]        = instr.result.priceAvgResult
      sliceCostMap[instr.ticker]       = instr.result.priceAvgInvestedValue
    }
  }

  type RawPos = {
    symbol:      string
    marketValue: number
    avgPrice:    number
    ppl:         number
    pct:         number
  }

  const rawPositions: RawPos[] = portfolio.flatMap(p => {
    const symbol = simplifyTicker(p.ticker)
    const isUsd  = p.ticker.endsWith('_US_EQ')
    const fx     = isUsd ? fxRate : 1

    const entries: RawPos[] = []
    // --- free shares
    const freeQty = p.quantity - p.pieQuantity
    if (freeQty > 0) {
      const costGBP  = p.averagePrice * freeQty * fx
      const valueGBP = p.currentPrice * freeQty * fx
      const pplGBP   = p.ppl * fx
      entries.push({
        symbol,
        marketValue: valueGBP,
        avgPrice:    costGBP / freeQty,
        ppl:         pplGBP,
        pct:         costGBP > 0 ? (pplGBP / costGBP) * 100 : 0,
      })
    }
    // --- pie‐held shares
    if (p.pieQuantity > 0) {
      const sliceVal = sliceValueMap[p.ticker]
      const slicePpl = slicePplMap[p.ticker] ?? 0
      const sliceCost = sliceCostMap[p.ticker] ?? (sliceVal - slicePpl)
      if (sliceVal !== undefined) {
        entries.push({
          symbol,
          marketValue: sliceVal,
          avgPrice:    sliceVal / p.pieQuantity,
          ppl:         slicePpl * fx,
          pct:         sliceCost > 0 ? (slicePpl * fx / sliceCost) * 100 : 0,
        })
      }
    }
    return entries
  })

  // merge duplicates, summing marketValue and ppl; pct is a weighted blend
  const merged: Record<string, RawPos> = {}
  for (const pos of rawPositions) {
    if (!merged[pos.symbol]) {
      merged[pos.symbol] = { ...pos }
    } else {
      const prev = merged[pos.symbol]
      // new weighted pct = (prev.ppl + pos.ppl) / (prevCost + posCost)
      const prevCost = prev.marketValue - prev.ppl
      const thisCost = pos.marketValue - pos.ppl
      const combinedPpl = prev.ppl + pos.ppl
      const combinedCost = prevCost + thisCost

      merged[pos.symbol] = {
        symbol:      pos.symbol,
        marketValue: prev.marketValue + pos.marketValue,
        avgPrice:    prev.avgPrice, // leave first
        ppl:         combinedPpl,
        pct:         combinedCost > 0 ? (combinedPpl / combinedCost) * 100 : 0,
      }
    }
  }

  const positions = Object.values(merged)
    .sort((a, b) => b.marketValue - a.marketValue)

  const totalValue    = cash.total
  const invested      = cash.invested
  const profitLoss       = cash.ppl ?? 0
  const profitLossPct    = invested > 0 ? (profitLoss / invested) * 100 : 0
  const simpleReturnPct  = invested > 0 ? ((totalValue - invested) / invested) * 100 : 0
    ? ((totalValue - invested) / invested) * 100
    : 0

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* <pre className="p-4 bg-gray-100 rounded overflow-auto">
        {JSON.stringify({ cash, portfolio, pies, pieDetails, fxRate }, null, 2)}
      </pre> */}

      <Dashboard
        data={{
          metrics: {
            totalValue,
            invested,
            freeCash: cash.free,
            profitLoss,
            profitLossPct,
            simpleReturnPct,
          },
          positions,
        }}
      />
    </main>
  )
}
