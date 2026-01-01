// apps/nextjs-app/app/trading212/lib/types.ts

// ─── raw T212 API shapes ──────────────────────────────────────────────────────
export interface Cash {
  blocked: number
  free: number
  invested: number
  pieCash: number
  ppl: number
  result: number
  total: number
}

export interface PortfolioItem {
  ticker: string
  quantity: number
  averagePrice: number
  currentPrice: number
  pieQuantity: number
  ppl: number
  initialFillDate: string
}

export interface PieSummary {
  id: number
  cash: number
  dividendDetails: { gained: number; reinvested: number; inCash: number }
  result: {
    priceAvgInvestedValue: number
    priceAvgValue: number
    priceAvgResult: number
    priceAvgResultCoef: number
  }
  progress: number
  status: string | null
}

export interface PieDetail {
  instruments: Array<{
    ticker: string
    ownedQuantity: number
    result: {
      priceAvgValue: number
      priceAvgInvestedValue: number
      priceAvgResult: number
    }
  }>
  settings: { name: string; id: number }
}

// ─── the shape of your combined JSON endpoint ────────────────────────────────
export interface ApiResponse {
  cash: Cash
  portfolio: PortfolioItem[]
  pies: PieSummary[]
  pieDetails: PieDetail[]
}

// ─── the shapes your Dashboard actually **consumes** ───────────────────────────
export interface ApiStatus {
  t212: boolean    // Trading212 connectivity
}

export interface PortfolioMetrics {
  totalValue:      number
  invested:        number
  freeCash:        number
  profitLoss:      number
  profitLossPct:   number
  simpleReturnPct: number
}

export interface Position {
  symbol:       string
  marketValue:  number
  pct:          number
  ppl:          number
  purchaseDate: string
}
