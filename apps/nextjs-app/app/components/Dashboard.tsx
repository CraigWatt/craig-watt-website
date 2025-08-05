// app/components/Dashboard.tsx
'use client'
import React from 'react'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button
} from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import type { Position, PortfolioMetrics } from '../trading212/lib/types'

interface ApiStatus {
  t212: boolean
  fx:   boolean
}

interface DashboardProps {
  data: {
    metrics:   PortfolioMetrics
    positions: Position[]
    apiStatus: ApiStatus
  }
}

function maskValue(formatted: string) {
  return formatted.replace(/[0-9]/g, '*')
}

export default function Dashboard({ data }: DashboardProps) {
  const { metrics, positions } = data

  const gbp = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
  })

  const hideAll = true
  const renderTotal = (v: number) =>
    hideAll ? maskValue(gbp.format(v)) : gbp.format(v)
  const renderHolding = (v: number) =>
    v > 300.01 ? maskValue(gbp.format(v)) : gbp.format(v)

  // ─── SORT STATE ──────────────────────────────────────────────────────────────
  type SortKey = 'value' | 'pct' | 'date'
  const [sortKey, setSortKey] = React.useState<SortKey>('value')

  const sortedPositions = React.useMemo(() => {
    return [...positions].sort((a, b) => {
      switch (sortKey) {
        case 'value':
          return b.marketValue - a.marketValue
        case 'pct':
          return b.pct - a.pct
        case 'date':
          return (
            new Date(b.purchaseDate).getTime() -
            new Date(a.purchaseDate).getTime()
          )
      }
    })
  }, [positions, sortKey])

  const totalHoldings = metrics.totalValue - metrics.freeCash

  return (
    <div className="space-y-8">


      {/* ─── TOP 5 METRICS ───────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Value',  value: renderTotal(metrics.totalValue) },
          { label: 'Invested',     value: renderTotal(metrics.invested) },
          { label: 'Free Cash',    value: renderTotal(metrics.freeCash) },
          {
            label: 'Profit / Loss',
            jsx: (
              <>
                <p className={`text-xl font-semibold ${
                  metrics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.profitLoss >= 0 ? '+' : ''}
                  {hideAll
                    ? maskValue(gbp.format(metrics.profitLoss))
                    : gbp.format(metrics.profitLoss)}
                </p>
                <p className={`text-sm font-medium ${
                  metrics.profitLossPct >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {metrics.profitLossPct >= 0 ? '+' : ''}
                  {metrics.profitLossPct.toFixed(2)}%
                </p>
              </>
            )
          },
          {
            label: 'Simple Return',
            value: metrics.simpleReturnPct.toFixed(2) + '%'
          },
        ].map(({ label, value, jsx }) => (
          <Card key={label} shadow="sm" radius="md" fullWidth>
            <CardHeader>{label}</CardHeader>
            <CardBody className="text-xl font-semibold">
              {jsx ?? value}
            </CardBody>
          </Card>
        ))}
      </section>

      {/* ─── CRAIG’S HOLDINGS ────────────────────────────────────────────────────── */}
      <section className="w-full px-4 sm:px-6">
        <h4 className="text-lg font-medium mb-4 text-left">
          Craig’s Holdings
        </h4>

        {/* HeroUI Dropdown */}
        <div className="flex justify-end mb-4">
          <Dropdown>
            <DropdownTrigger>
              <Button size="sm" variant="flat" className="flex items-center gap-1">
                Sort by:{' '}
                {sortKey === 'value'
                  ? 'Value'
                  : sortKey === 'pct'
                  ? 'Gain %'
                  : 'Purchase Date'}
                <ChevronDown size={14} />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Sort positions">
              <DropdownItem key="value" onClick={() => setSortKey('value')}>
                Value
              </DropdownItem>
              <DropdownItem key="pct" onClick={() => setSortKey('pct')}>
                Gain %
              </DropdownItem>
              <DropdownItem key="date" onClick={() => setSortKey('date')}>
                Purchase Date
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>

        {/* Total Holdings */}
        <Card shadow="sm" radius="md" fullWidth className="mb-4">
          <CardBody className="flex justify-between">
            <span>Total Holdings</span>
            <span>{renderTotal(totalHoldings)}</span>
          </CardBody>
        </Card>

        {/* Individual Positions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedPositions.map(({ symbol, marketValue, pct, purchaseDate }) => {
            const isUp = pct >= 0
            const displaySym = symbol.length === 5
              ? symbol.slice(0, 4)
              : symbol
            const niceDate = new Date(purchaseDate).toLocaleDateString('en-GB',{
              day:   '2-digit',
              month: 'short',
              year:  'numeric'
            })

            return (
              <Card key={symbol} shadow="sm" radius="md" fullWidth>
                <CardHeader>{displaySym}</CardHeader>
                <CardBody className="flex justify-between items-center">
                  <span>{renderHolding(marketValue)}</span>
                  <span className={`text-sm font-medium ${
                    isUp ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isUp && '+'}{pct.toFixed(2)}%
                  </span>
                </CardBody>
                <CardFooter className="text-xs text-gray-500">
                  Purchased {niceDate}
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
