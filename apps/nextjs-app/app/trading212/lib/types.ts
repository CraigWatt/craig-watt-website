// app/trading212/lib/types.ts

/** 
 * A snapshot of your portfolio totals and ROR% for each period
 */
export interface PortfolioMetrics {
  totalValue:   number  // today’s total (cash + positions)
  invested:     number  // total cash you’ve put in
  freeCash:     number  // uninvested cash on hand
  profitLoss:      number      // absolute P/L
  profitLossPct:   number      // P/L ÷ invested * 100
  simpleReturnPct: number      // (totalValue – invested) ÷ invested * 100
}

/**
 * A single date + ROR percentage data point, used in the chart
 */
export interface RorPoint {
  date:   string  // “YYYY-MM-DD”
  rorPct: number
}

/**
 * Your individual holding, for the list at the bottom
 */
export interface Position {
  symbol:      string
  marketValue: number
  avgPrice:    number
  ppl:         number  // absolute P/L in GBP
  pct:         number  // P/L percent (e.g. 23.48 for +23.48%)
}
