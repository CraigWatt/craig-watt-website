// app/trading212/lib/transform.ts
import type {
  Cash,
  PortfolioItem,
  PieDetail,
} from './types'

interface Raw {
  cash:       Cash
  portfolio:  PortfolioItem[]
  pies:       unknown[]
  pieDetails: PieDetail[]
  fxRate:     number
}

export interface PublicPos {
  symbol:       string
  marketValue:  string    // e.g. "£*,***.**"
  pct:          string    // e.g. "+11.26%"
  purchaseDate: string    // human-readable date
}

export interface PublicMetrics {
  totalValue:     string
  invested:       string
  freeCash:       string
  profitLoss:     string
  profitLossPct:  string
  simpleReturnPct:string
}

export interface PublicApiStatus {
  t212: boolean
  fx:   boolean
}

export function transformForPublic({
  cash,
  portfolio,
  pies,
  pieDetails,
  fxRate,
}: Raw): {
  apiStatus: { t212: boolean; fx: boolean }
  metrics:   PublicMetrics
  positions: PublicPos[]
} {
  // ─── 1) Build slice lookups ─────────────────────────────────────────────
  const sliceValueMap: Record<string, number> = {}
  const slicePplMap:   Record<string, number> = {}
  for (const pd of pieDetails) {
    for (const instr of pd.instruments) {
      sliceValueMap[instr.ticker] = instr.result.priceAvgValue
      slicePplMap[instr.ticker]   = instr.result.priceAvgResult
    }
  }

  // ─── 2) Flatten free vs in-pie shares into a RawPos[] ────────────────────
  type RawPos = {
    symbol:       string
    marketValue:  number
    pct:          number
    ppl:          number
    purchaseDate: string
  }
  const rawPositions: RawPos[] = portfolio.flatMap(p => {
    const symbol = p.ticker.split('_')[0]
    const isUsd  = p.ticker.endsWith('_US_EQ')
    const fxMult = isUsd ? fxRate : 1

    // absolute P/L in GBP and base percent
    const totalPplGBP = (p.ppl ?? 0) * fxMult
    const basePct     = (p.ppl ?? 0) / (p.averagePrice * p.quantity) * 100

    const entries: RawPos[] = []

    // 2a) free shares
    const freeQty = p.quantity - p.pieQuantity
    if (freeQty > 0) {
      entries.push({
        symbol,
        marketValue:  p.currentPrice * freeQty * fxMult,
        pct:          basePct,
        ppl:          totalPplGBP * (freeQty / p.quantity),
        purchaseDate: p.initialFillDate,
      })
    }

    // 2b) shares inside pies
    if (p.pieQuantity > 0 && sliceValueMap[p.ticker] != null) {
      const sliceVal   = sliceValueMap[p.ticker]
      const slicePplGBP= (slicePplMap[p.ticker] ?? 0) * fxMult
      const invested   = sliceVal - (slicePplMap[p.ticker] ?? 0)
      const slicePct   = invested > 0
        ? (slicePplMap[p.ticker]! / invested) * 100
        : 0

      entries.push({
        symbol,
        marketValue:  sliceVal,
        pct:          slicePct,
        ppl:          slicePplGBP,
        purchaseDate: p.initialFillDate,
      })
    }

    return entries
  })

  // ─── 3) Merge duplicates by symbol ─────────────────────────────────────
  const mergedMap: Record<string, RawPos> = {}
  for (const pos of rawPositions) {
    if (!mergedMap[pos.symbol]) {
      mergedMap[pos.symbol] = { ...pos }
    } else {
      mergedMap[pos.symbol].marketValue += pos.marketValue
      mergedMap[pos.symbol].ppl         += pos.ppl
    }
  }
  const mergedPositions = Object.values(mergedMap)
    .sort((a, b) => b.marketValue - a.marketValue)

  // ─── 4) Compute portfolio-level metrics ─────────────────────────────────
  const totalValue      = cash.total
  const invested        = cash.invested || 1
  const profitLoss      = cash.ppl
  const profitLossPct   = (profitLoss / invested) * 100
  const simpleReturnPct = invested > 0
    ? ((totalValue - invested) / invested) * 100
    : 0

  // ─── 5) Mask & format for public output ────────────────────────────────
  const pubMetrics: PublicMetrics = {
    totalValue:     maskValue(formatGBP(totalValue)),
    invested:       maskValue(formatGBP(invested)),
    freeCash:       maskValue(formatGBP(cash.free)),
    profitLoss:     maskValue(formatGBP(profitLoss)),
    profitLossPct:  `${profitLossPct.toFixed(2)}%`,
    simpleReturnPct:`${simpleReturnPct.toFixed(2)}%`,
  }

  const pubPositions: PublicPos[] = mergedPositions.map(p => ({
    symbol:       p.symbol,
    marketValue:  p.pct >= 0
      ? maskValue(formatGBP(p.marketValue))
      : formatGBP(p.marketValue),
    pct:          `${p.pct >= 0 ? '+' : ''}${p.pct.toFixed(2)}%`,
    purchaseDate: new Date(p.purchaseDate).toLocaleDateString('en-GB', {
      day:   '2-digit',
      month: 'short',
      year:  'numeric',
    }),
  }))

  return {
    apiStatus: {
      t212: Boolean(cash && portfolio && pies.length),
      fx:   fxRate != null,
    },
    metrics:   pubMetrics,
    positions: pubPositions,
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatGBP(n: number) {
  return new Intl.NumberFormat('en-GB', {
    style:                 'currency',
    currency:              'GBP',
    minimumFractionDigits: 2,
  }).format(n)
}

function maskValue(s: string) {
  return s.replace(/[0-9]/g, '*')
}
