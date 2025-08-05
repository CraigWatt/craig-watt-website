// app/trading212/Trading212Client.tsx
'use client'

import useSWR from 'swr'
import Dashboard from '../components/Dashboard'
import { Card, CardHeader, CardBody } from '@heroui/react'
import type {
  PortfolioMetrics,
  Position,
  ApiStatus,
  Cash,
  PortfolioItem,
  PieSummary,
  PieDetail,
} from './lib/types'

// Basic fetcher for SWR
const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Shape of the raw API response
interface ApiResponse {
  cash: Cash
  portfolio: PortfolioItem[]
  pies: PieSummary[]
  pieDetails: PieDetail[]
  fx: number
}

// Turn raw API JSON into the props shape Dashboard expects
function transform(data: ApiResponse): {
  metrics: PortfolioMetrics
  positions: Position[]
  apiStatus: ApiStatus
} {
  const { cash, portfolio, pieDetails, fx } = data

  // Build slice lookups
  const sliceValueMap: Record<string, number> = {}
  const slicePplMap: Record<string, number> = {}
  for (const pd of pieDetails) {
    for (const instr of pd.instruments) {
      sliceValueMap[instr.ticker] = instr.result.priceAvgValue
      slicePplMap[instr.ticker] = instr.result.priceAvgResult
    }
  }

  // Flatten & merge into Position[]
  type RawPos = {
    symbol: string
    marketValue: number
    avgPrice: number
    pct: number
    ppl: number
    purchaseDate: string
  }

  const raw: RawPos[] = portfolio.flatMap((p: PortfolioItem) => {
    const symbol = p.ticker.split('_')[0]
    const fxMult = p.ticker.endsWith('_US_EQ') ? fx : 1
    const totalPplGBP = (p.ppl ?? 0) * fxMult
    const basePct = (p.ppl ?? 0) / (p.averagePrice * p.quantity) * 100
    const arr: RawPos[] = []

    // free shares
    const freeQty = p.quantity - p.pieQuantity
    if (freeQty > 0) {
      arr.push({
        symbol,
        marketValue: p.currentPrice * freeQty * fxMult,
        avgPrice: p.averagePrice * fxMult,
        pct: basePct,
        ppl: totalPplGBP * (freeQty / p.quantity),
        purchaseDate: p.initialFillDate,
      })
    }

    // pie shares
    if (p.pieQuantity > 0 && sliceValueMap[p.ticker] != null) {
      const sliceVal = sliceValueMap[p.ticker]
      const slicePplGBP = (slicePplMap[p.ticker] ?? 0) * fxMult
      const invested = sliceVal - (slicePplMap[p.ticker] ?? 0)
      const slicePct = invested > 0
        ? (slicePplMap[p.ticker]! / invested) * 100
        : 0

      arr.push({
        symbol,
        marketValue: sliceVal,
        avgPrice: sliceVal / p.pieQuantity,
        pct: slicePct,
        ppl: slicePplGBP,
        purchaseDate: p.initialFillDate,
      })
    }

    return arr
  })

  // Merge duplicates by symbol
  const mergedMap: Record<string, RawPos> = {}
  for (const pos of raw) {
    if (!mergedMap[pos.symbol]) mergedMap[pos.symbol] = { ...pos }
    else {
      mergedMap[pos.symbol].marketValue += pos.marketValue
      mergedMap[pos.symbol].ppl += pos.ppl
    }
  }
  const positions: Position[] = Object.values(mergedMap)
    .sort((a, b) => b.marketValue - a.marketValue)
    .map(({ symbol, marketValue, pct, ppl, purchaseDate }) => ({ symbol, marketValue, pct, ppl, purchaseDate }))

  // Compute metrics
  const totalValue = cash.total
  const invested = cash.invested || 1
  const metrics: PortfolioMetrics = {
    totalValue,
    invested,
    freeCash: cash.free,
    profitLoss: cash.ppl,
    profitLossPct: (cash.ppl / invested) * 100,
    simpleReturnPct: invested > 0 ? ((totalValue - invested) / invested) * 100 : 0,
  }

  const apiStatus: ApiStatus = {
    t212: Boolean(data.pies),
    fx: fx != null,
  }

  return { metrics, positions, apiStatus }
}

export default function Trading212Client() {
  const { data, error } = useSWR<ApiResponse>('/api/trading212', fetcher)

  if (error) return <p className="p-4 text-center">Error loading dashboard.</p>
  if (!data) return <p className="p-4 text-center">Loading dashboard…</p>

  const { metrics, positions, apiStatus } = transform(data)
  
  return (
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* ─── DASHBOARD TITLE ────────────────────────────────────────────────────── */}
      <h1 className="text-3xl font-bold text-left">
        Trading212 Dashboard
      </h1>

      {/* ─── API STATUS ────────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4">
        <Card shadow="sm" radius="md" fullWidth>
          <CardHeader>Trading212 API</CardHeader>
          <CardBody className={apiStatus.t212 ? 'text-green-600' : 'text-red-600'}>
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
        <Dashboard data={{ metrics, positions, apiStatus }} />
      ) : (
        <div className="text-center p-8">
          <p className="text-lg font-semibold">One or more APIs are offline.</p>
          <p>
            Please try again in a moment.{' '}
            <a href="/trading212" className="text-blue-600 underline hover:text-blue-800">
              Refresh
            </a>
          </p>
        </div>
      )}
    </main>
  )
}
