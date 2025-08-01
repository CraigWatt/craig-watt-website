// app/components/Dashboard.tsx
'use client'
import React from 'react'
import type { Position, PortfolioMetrics } from '../trading212/lib/types'

interface DashboardProps {
  data: {
    metrics: PortfolioMetrics
    positions: Position[]
  }
}

export default function Dashboard({ data }: DashboardProps) {
  const { metrics, positions } = data

  // GBP currency formatter
  const gbp = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  })

  // 1) sum of raw market values (full precision)
  const sumOfPositions = positions.reduce((sum, { marketValue }) => sum + marketValue, 0)
  // 2) implied holdings from totals (to cross-check if needed)
  const impliedHoldings = metrics.totalValue - metrics.freeCash
  console.log('Positions sum:', sumOfPositions, 'Implied holdings:', impliedHoldings)

  // use impliedHoldings to ensure alignment with totalValue - freeCash
  const totalHoldings = impliedHoldings

return (
    <div className="space-y-8">
      <section className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <h4>Total Value</h4>
          <p className="text-xl font-semibold">{gbp.format(metrics.totalValue)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4>Invested</h4>
          <p className="text-xl font-semibold">{gbp.format(metrics.invested)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4>Free Cash</h4>
          <p className="text-xl font-semibold">{gbp.format(metrics.freeCash)}</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h4>Profit / Loss</h4>
          <p className={`text-xl font-semibold ${metrics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.profitLoss >= 0 ? '+' : ''}{gbp.format(metrics.profitLoss)}
          </p>
          <p className={`text-sm font-medium ${metrics.profitLossPct >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {metrics.profitLossPct >= 0 ? '+' : ''}{metrics.profitLossPct.toFixed(2)}%
          </p>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-medium mb-2">Simple Return</h4>
        <p className="text-2xl font-bold">{metrics.simpleReturnPct.toFixed(2)}%</p>
      </section>

      <section>
        <h4 className="text-lg font-medium mb-2">Your Holdings</h4>
        <div className="flex justify-between mb-4 p-3 bg-white rounded shadow">
          <span className="font-medium">Total Holdings</span>
          <span className="font-medium">{gbp.format(totalHoldings)}</span>
        </div>
        <ul className="space-y-2">
          {positions.map(({ symbol, marketValue, pct }) => {
            const isUp = pct >= 0
            // trim any 5-character ticker to 4 characters
            const displaySymbol = symbol.length === 5 ? symbol.slice(0, 4) : symbol
            return (
              <li
                key={symbol}
                className="flex flex-col p-3 bg-white rounded shadow"
              >
                <div className="flex justify-between">
                  <span>{displaySymbol}</span>
                  <span>{gbp.format(marketValue)}</span>
                </div>
                <div
                  className={`mt-1 self-end text-sm font-medium ${
                    isUp ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isUp ? '+' : ''}{pct.toFixed(2)}%
                </div>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
