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

  // 5a) Prepare profit/loss display (mask only, no sign):
  const rawPL     = cash.ppl
  const fmtPL     = formatGBP(Math.abs(rawPL))  // e.g. "£1,234.56"
  const maskedPL  = maskValue(fmtPL)           // e.g. "£*,***.**"

  // 5b) Signed pct:
  const plPct = invested > 0 ? (rawPL / invested) * 100 : 0
  const signedPct = `${plPct >= 0 ? '+' : ''}${plPct.toFixed(2)}%`

  const pubMetrics: PublicMetrics = {
    totalValue:      maskValue(formatGBP(totalValue)),
    invested:        maskValue(formatGBP(invested)),
    freeCash:        maskValue(formatGBP(cash.free)),
    profitLoss:      maskedPL,       // now "£*,***.**"
    profitLossPct:   signedPct,      // e.g. "+11.34%"
    simpleReturnPct: `${simpleReturnPct.toFixed(2)}%`,
  }

  // 5c) Trim trailing 'l' off any 5-char symbol, then mask/format:
  const pubPositions: PublicPos[] = mergedPositions.map((p) => {
    let sym = p.symbol
    if (sym.length === 5 && sym.endsWith('l')) {
      sym = sym.slice(0, 4)
    }
    const valStr = p.marketValue > 300.01
      ? maskValue(formatGBP(p.marketValue))
      : p.marketValue < 1
        ? '£0.00'
        : formatGBP(p.marketValue)
    const pctStr = `${p.pct >= 0 ? '+' : ''}${p.pct.toFixed(2)}%`
    return {
      symbol:       sym,
      marketValue:  valStr,
      pct:          pctStr,
      purchaseDate: new Date(p.purchaseDate).toLocaleDateString('en-GB', {
        day:   '2-digit',
        month: 'short',
        year:  'numeric',
      }),
    }
  })

  return {
    apiStatus: {
      t212: Boolean(cash && portfolio && pies.length),
      fx: typeof fxRate === 'number' && !isNaN(fxRate),
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
