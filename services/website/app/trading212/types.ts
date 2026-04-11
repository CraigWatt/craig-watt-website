// Types for Trading212 dashboard

export interface Position {
  symbol: string
  marketValue: number
  pct: number
  purchaseDate: string
}

export interface PortfolioMetrics {
  totalValue: number
  invested: number
  freeCash: number
  profitLoss: number
  profitLossPct: number
  simpleReturnPct: number
}

// Public (masked) versions of the types
export interface PublicPos {
  symbol: string
  marketValue: string
  pct: string
  purchaseDate: string
}

export interface PublicMetrics {
  totalValue: string
  invested: string
  freeCash: string
  profitLoss: string
  profitLossPct: string
  simpleReturnPct: string
}

export interface PublicApiStatus {
  t212: boolean
}

export interface ApiStatus {
  t212: boolean
}
