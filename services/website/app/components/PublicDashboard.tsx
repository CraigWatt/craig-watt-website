// app/components/PublicDashboard.tsx
'use client'
import React from 'react'
import type { PublicApiStatus, PublicMetrics, PublicPos } from '../trading212/types'
import { RefreshArrow } from './icons/RefreshArrow'

interface PublicDashboardProps {
  data: {
    metrics: PublicMetrics
    positions: PublicPos[]
    apiStatus: PublicApiStatus
    _meta?: {
      stale?: boolean
      cold?: boolean
    }
  }
}

export default function PublicDashboard({ data }: PublicDashboardProps) {
  const { metrics, positions, apiStatus } = data

  type SortKey = 'value' | 'pct' | 'date'
  const [sortKey, setSortKey] = React.useState<SortKey>('value')

  // sort by extracting numbers from the masked strings
  const sorted = React.useMemo(() => {
    const arr = [...positions]
    if (sortKey === 'value') {
      arr.sort((a, b) =>
        parseFloat(b.marketValue.replace(/[^0-9.-]/g, '')) -
        parseFloat(a.marketValue.replace(/[^0-9.-]/g, ''))
      )
    } else if (sortKey === 'pct') {
      arr.sort((a, b) =>
        parseFloat(b.pct) -
        parseFloat(a.pct)
      )
    } else {
      arr.sort((a, b) =>
        new Date(b.purchaseDate).getTime() -
        new Date(a.purchaseDate).getTime()
      )
    }
    return arr
  }, [positions, sortKey])

  return (
    <main className="max-w-4xl mx-auto px-6 md:px-12 lg:px-24 py-16 space-y-6">
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">Trading212</p>
          <h1 className="text-4xl font-semibold tracking-tight">Trading212 Dashboard</h1>
          <p className="max-w-2xl text-[var(--color-muted-foreground)]">
            A compact view of portfolio value, cash, returns, and current holdings with a cleaner public-facing surface.
          </p>
        </div>

        {data._meta?.cold && (
          <div className="site-surface rounded-[1.75rem] px-5 py-4 text-sm text-[var(--color-muted-foreground)]">
            <p className="font-medium text-[var(--color-foreground)]">Loading from scratch</p>
            <p>First-time load. Please wait while data is fetched.</p>
          </div>
        )}

        {data._meta?.stale && (
          <section className="grid grid-cols-1 gap-4">
            <div className="site-surface flex w-full items-center justify-between gap-4 rounded-[1.75rem] px-5 py-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-[var(--color-foreground)]">Stale data</span>
                <span className="text-sm text-[var(--color-muted-foreground)]">Showing cached data while a live refresh is in progress.</span>
              </div>
              <button
                type="button"
                onClick={() => location.reload()}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-background)] text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
              >
                  <RefreshArrow className="w-4 h-4" />
              </button>
            </div>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4">
          <div className="site-surface flex items-center justify-between rounded-[1.75rem] px-5 py-4">
            <div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">T212 API</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">{apiStatus.t212 ? 'Online' : 'Offline'}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${apiStatus.t212 ? 'bg-emerald-500/15 text-emerald-500' : 'bg-rose-500/15 text-rose-500'}`}>
              {apiStatus.t212 ? 'Live' : 'Down'}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total Value',   value: metrics.totalValue },
            { label: 'Invested',      value: metrics.invested    },
            { label: 'Free Cash',     value: metrics.freeCash    },
            {
              label: 'Profit / Loss',
              // add a “+” if the pct is positive
              value: metrics.profitLoss,
              extra: metrics.profitLossPct,
              isPositive: metrics.profitLossPct.startsWith('+'),
            },
            { label: 'Simple Return', value: metrics.simpleReturnPct },
          ].map(({ label, value, extra, isPositive }) => (
            <article key={label} className="site-surface rounded-[1.75rem] px-5 py-4">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">{label}</p>
              <div
                className={
                  label === 'Profit / Loss'
                    ? `text-xl font-semibold ${
                        isPositive
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`
                    : 'text-xl font-semibold text-[var(--color-foreground)]'
                }
              >
                <p className="mt-3">{value}</p>
                {extra && <div className="mt-1 text-sm">{extra}</div>}
              </div>
            </article>
          ))}
        </section>

        <section className="w-full space-y-4">
          <h4 className="text-lg font-medium text-left text-[var(--color-foreground)]">
            Craig’s Holdings
          </h4>

          <div className="flex justify-end">
            <label className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
              <span>Sort by</span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="site-input-surface rounded-2xl px-4 py-2 text-sm text-[var(--color-foreground)] outline-none transition focus:border-[var(--color-accent)]"
              >
                <option value="value">Value</option>
                <option value="pct">Gain %</option>
                <option value="date">Date</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sorted.map(({ symbol, marketValue, pct, purchaseDate }) => (
              <article key={symbol} className="site-surface rounded-[1.75rem] px-5 py-4">
                <p className="text-lg font-semibold text-[var(--color-foreground)]">{symbol}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[var(--color-foreground)]">{marketValue}</span>
                  <span
                    className={
                      pct.startsWith('+')
                        ? 'font-medium text-emerald-600 dark:text-emerald-400'
                        : 'font-medium text-rose-600 dark:text-rose-400'
                    }
                  >
                    {pct}
                  </span>
                </div>
                <p className="mt-4 text-xs text-[var(--color-muted)]">
                  Purchased {purchaseDate}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
