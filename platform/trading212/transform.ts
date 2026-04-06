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
}

export interface PublicPos {
  symbol:       string
  marketValue:  string    // e.g. "£*,***.**"
  pct:          string    // e.g. "+11.26%"
  purchaseDate: string    // human-readable date
}

export interface PublicMetrics {
  totalValue:      string
  invested:        string
  freeCash:        string
  profitLoss:      string
  profitLossPct:   string
  simpleReturnPct: string
}

export interface PublicApiStatus {
  t212: boolean
}

/**
 * Some T212 instruments report values in USD (e.g. *_US_EQ).
 * If you're mixing currencies, you need a multiplier to normalise to GBP.
 *
 * For local testing you can set:
 *   T212_USD_GBP=0.79
 *
 * If not set, we default to 1 (no conversion) so code never explodes.
 */
function getFxMultForPosition(p: PortfolioItem): number {
  const isUsd = p.ticker.endsWith('_US_EQ')

  if (!isUsd) return 1

  // "USD per GBP" vs "GBP per USD" ambiguity: we assume GBP per USD here.
  // Pick whichever you want and keep it consistent across the app.
  const raw = process.env.T212_USD_GBP
  const n = raw ? Number(raw) : NaN
  return Number.isFinite(n) && n > 0 ? n : 1
}

export function transformForPublic({
  cash,
  portfolio,
  pies,
  pieDetails,
}: Raw): {
  apiStatus: { t212: boolean; }
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

  const rawPositions: RawPos[] = portfolio.flatMap((p) => {
    const symbol = p.ticker.split('_')[0]
    const fxMult = getFxMultForPosition(p)

    // Guard: avoid NaNs and divide-by-zero
    const qty = p.quantity || 0
    const avg = p.averagePrice || 0
    const denom = avg * qty

    // absolute P/L in GBP and base percent
    const totalPplGBP = (p.ppl ?? 0) * fxMult
    const basePct = denom > 0
      ? ((p.ppl ?? 0) / denom) * 100
      : 0

    const entries: RawPos[] = []

    // 2a) free shares
    const freeQty = (p.quantity ?? 0) - (p.pieQuantity ?? 0)
    if (freeQty > 0 && qty > 0) {
      entries.push({
        symbol,
        marketValue:  (p.currentPrice ?? 0) * freeQty * fxMult,
        pct:          basePct,
        ppl:          totalPplGBP * (freeQty / qty),
        purchaseDate: p.initialFillDate,
      })
    }

    // 2b) shares inside pies
    if ((p.pieQuantity ?? 0) > 0 && sliceValueMap[p.ticker] != null) {
      const sliceVal    = sliceValueMap[p.ticker] ?? 0
      const slicePplRaw = slicePplMap[p.ticker] ?? 0
      const slicePplGBP = slicePplRaw * fxMult

      const invested = sliceVal - slicePplRaw
      const slicePct = invested > 0
        ? (slicePplRaw / invested) * 100
        : 0

      entries.push({
        symbol,
        marketValue:  sliceVal * fxMult,
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
      // keep pct/purchaseDate from first entry (fine for your “public” view)
    }
  }

  const mergedPositions = Object.values(mergedMap)
    .sort((a, b) => b.marketValue - a.marketValue)

  // ─── 4) Compute portfolio-level metrics ─────────────────────────────────
  const totalValue      = cash.total ?? 0
  const invested        = cash.invested ?? 1
  const freeCash        = cash.free ?? 0
  const profitLoss      = cash.ppl ?? 0

  const simpleReturnPct = invested > 0
    ? ((totalValue - invested) / invested) * 100
    : 0

  const profitLossPct = invested > 0
    ? (profitLoss / invested) * 100
    : 0

  const maskedPL  = maskValue(formatGBP(Math.abs(profitLoss)))
  const signedPct = `${profitLossPct >= 0 ? '+' : ''}${profitLossPct.toFixed(2)}%`

  const pubMetrics: PublicMetrics = {
    totalValue:      maskValue(formatGBP(totalValue)),
    invested:        maskValue(formatGBP(invested)),
    freeCash:        maskValue(formatGBP(freeCash)),
    profitLoss:      maskedPL,       // now "£*,***.**"
    profitLossPct:   signedPct,      // e.g. "+11.34%"
    simpleReturnPct: `${simpleReturnPct.toFixed(2)}%`,
  }

  // ─── 5) Format/mask positions ───────────────────────────────────────────
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
      t212: Boolean(cash && portfolio && pies?.length),
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
