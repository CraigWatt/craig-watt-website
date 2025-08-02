// app/trading212/page.tsx
import { Metadata } from 'next'
import Dashboard from '../components/Dashboard'
import {
  getAccountCashSafe,
  getPortfolioSafe,
  getPiesSafe,
  getPieDetailSafe,
  getUsdGbpRateSafe,
} from './lib/server'

import {
  Card,
  CardHeader,
  CardBody,
} from '@heroui/react'

// strip off anything after “_” so e.g. “AAPL_US_EQ” → “AAPL”
function simplifyTicker(t: string) {
  return t.split('_')[0]
}

export const metadata: Metadata = {
  title: 'Trading 212 Dashboard',
}

export default async function Trading212Page() {
  // 1) fetch everything in parallel (we now get { ok, data } for each)
  const [ cashRes, portfolioRes, piesRes, fxRes ] = await Promise.all([
    getAccountCashSafe(),
    getPortfolioSafe(),
    getPiesSafe(),
    getUsdGbpRateSafe(),
  ])

  // 2) compute boolean status purely from our “.ok” flags
  const apiStatus = {
    t212: cashRes.ok && portfolioRes.ok && piesRes.ok,
    //t212: false, // for testing
    fx:   fxRes.ok,
    //fx: false, // for testing
  }

  // 3) pull out actual data (or safe defaults)
  const cash      = cashRes.data      ?? { blocked:0, free:0, invested:0, pieCash:0, ppl:0, result:0, total:0 }
  const portfolio = portfolioRes.data ?? []
  const pies      = piesRes.data      ?? []
  const fxRate    = fxRes.data         ?? 1

  // 2) fetch each pie’s instruments
  const pieDetailResults = await Promise.all(
    pies.map(p => getPieDetailSafe(p.id))
  )

  // 2a) keep only the successes and unwrap .data
  const pieDetails = pieDetailResults
    .filter((r): r is { ok: true; data: NonNullable<typeof r.data> } =>
      r.ok && r.data != null
    )
    .map(r => r.data)

  // 2a) build lookups from ticker → slice market-value AND slice absolute P/L
  const sliceValueMap: Record<string, number> = {}
  const slicePplMap:   Record<string, number> = {}
  for (const pd of pieDetails) {
    for (const instr of pd.instruments) {
      sliceValueMap[instr.ticker] = instr.result.priceAvgValue
      slicePplMap[instr.ticker]   = instr.result.priceAvgResult
    }
  }

  // 3) flatten free vs in-pie shares into a RawPos[]
  type RawPos = {
    symbol:       string
    marketValue:  number
    avgPrice:     number
    pct:          number    // % P/L
    ppl:          number    // £ P/L
    purchaseDate: string
  }

  const rawPositions: RawPos[] = portfolio.flatMap(p => {
    const symbol = simplifyTicker(p.ticker)
    const isUsd  = p.ticker.endsWith('_US_EQ')
    const fxMult = isUsd ? fxRate : 1

    // total absolute P/L of this holding in GBP
    const totalPplGBP = (p.ppl ?? 0) * fxMult
    // overall % P/L across all shares
    const basePnlPct  = (p.ppl ?? 0) / (p.averagePrice * p.quantity) * 100

    const entries: RawPos[] = []

    // 3a) free shares
    const freeQty = p.quantity - p.pieQuantity
    if (freeQty > 0) {
      const freeQtyRatio = freeQty / p.quantity
      entries.push({
        symbol,
        marketValue:  p.currentPrice * freeQty * fxMult,
        avgPrice:     p.averagePrice * fxMult,
        pct:          basePnlPct,
        ppl:          totalPplGBP * freeQtyRatio,
        purchaseDate: p.initialFillDate,
      })
    }

    // 3b) shares inside pies
    if (p.pieQuantity > 0) {
      const sliceVal = sliceValueMap[p.ticker]
      if (sliceVal != null) {
        const slicePplGBP = (slicePplMap[p.ticker] ?? 0) * fxMult
        // reconstruct % P/L = pnl ÷ (invested amount)
        // invested amount = sliceVal - priceAvgResult
        const investedSlice = sliceVal - (slicePplMap[p.ticker] ?? 0)
        const slicePct = investedSlice > 0
          ? (slicePplMap[p.ticker]! / investedSlice) * 100
          : 0

        entries.push({
          symbol,
          marketValue:  sliceVal,
          avgPrice:     sliceVal / p.pieQuantity,
          pct:          slicePct,
          ppl:          slicePplGBP,
          purchaseDate: p.initialFillDate,
        })
      }
    }

    return entries
  })

  // 4) merge duplicates by symbol, summing marketValue & ppl
  const mergedMap: Record<string, RawPos> = {}
  for (const pos of rawPositions) {
    if (!mergedMap[pos.symbol]) {
      mergedMap[pos.symbol] = { ...pos }
    } else {
      mergedMap[pos.symbol].marketValue += pos.marketValue
      mergedMap[pos.symbol].ppl         += pos.ppl
      // we leave pct & purchaseDate from the first slice
    }
  }
  const mergedPositions = Object
    .values(mergedMap)
    .sort((a, b) => b.marketValue - a.marketValue)

  // 5) compute portfolio‐level metrics
  const totalValue    = cash.total
  const invested      = cash.invested
  const simpleReturnPct = invested > 0
    ? ((totalValue - invested) / invested) * 100
    : 0

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* 🔍 hide debug JSON in prod */}
      {/* <pre className="p-4 bg-gray-100 rounded overflow-auto">
        {JSON.stringify({ cash, portfolio, pies, pieDetails, fxRate }, null, 2)}
      </pre> */}

      {/* ─── DASHBOARD TITLE ────────────────────────────────────────────────────── */}
      <h1 className="text-3xl font-bold text-left">Trading212 Dashboard</h1>
      {/* ─── API STATUS ────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <Card shadow="sm" radius="md" fullWidth>
          <CardHeader>Trading212 API</CardHeader>
          <CardBody
            className={apiStatus.t212 ? 'text-green-600' : 'text-red-600'}
          >
            {apiStatus.t212 ? 'Online' : 'Offline'}
          </CardBody>
        </Card>
        <Card shadow="sm" radius="md" fullWidth>
          <CardHeader>FX API</CardHeader>
          <CardBody className={apiStatus.fx ? 'text-green-600' : 'text-red-600'}>
            {apiStatus.fx ? 'Online' : 'Offline'}
          </CardBody>
        </Card>
      </section>

      {apiStatus.t212 && apiStatus.fx ? (
        <Dashboard
          data={{
            metrics: {
              totalValue,
              invested,
              freeCash:       cash.free,
              profitLoss:     cash.ppl,
              profitLossPct:  cash.ppl / invested * 100,
              simpleReturnPct,
            },
            positions: mergedPositions,
            apiStatus,
          }}
        />
      ) : (
        <div className="text-center p-8">
          <p className="text-lg font-semibold">One or more APIs are offline.</p>
          <p>
            Please try again in a moment.{' '}
            <a
              href="/trading212"
              className="text-blue-600 underline hover:text-blue-800"
            >
              Refresh
            </a>
          </p>
        </div>
      )}
    </main>
  )
}
