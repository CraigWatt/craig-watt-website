// app/components/PublicDashboard.tsx
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
  Button,
  Alert
} from '@heroui/react'
import { ChevronDown } from 'lucide-react'
import type { PublicMetrics, PublicPos } from '../trading212/lib/transform'
import { RefreshArrow } from './icons/RefreshArrow'

// mirror the same ApiStatus shape
interface ApiStatus {
  t212: boolean
}

interface PublicDashboardProps {
  data: {
    metrics:   PublicMetrics
    positions: PublicPos[]
    apiStatus: ApiStatus
    _meta?: {
      stale?:boolean
      cold?:boolean
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
    <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-8">
        <h1 className="text-3xl font-bold">Trading212 Dashboard</h1>

        {data._meta?.cold && (
          <Alert
            color="default"
            title="Loading from scratch"
            description="First-time load — please wait while data is fetched..."
          />
        )}

        {data._meta?.stale && (
          <section className="grid grid-cols-1 gap-4">
            <Alert color="warning">
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-small font-medium">Stale Data</span>
                  <span>Showing cached data — live update in progress…</span>
                </div>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => location.reload()}
                  className="shrink-0"
                  radius="full"
                >
                  <RefreshArrow className="w-4 h-4" />
                </Button>
              </div>
            </Alert>
          </section>
        )}

        <section className="grid grid-cols-1 gap-4">
          <Alert
            color={apiStatus.t212 ? 'success' : 'danger'}
            title="T212 API"
            description={apiStatus.t212 ? 'Online' : 'Offline'}
          />
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
            <Card key={label} shadow="sm" radius="md" fullWidth>
              <CardHeader>{label}</CardHeader>
              <CardBody
                className={
                  label === 'Profit / Loss'
                    ? `text-xl font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`
                    : 'text-xl font-semibold'
                }
              >
                {value}
                {extra && <div className="text-sm mt-1">{extra}</div>}
              </CardBody>
            </Card>
          ))}
        </section>

        <section className="w-full px-4 sm:px-6 space-y-4">
          <h4 className="text-lg font-medium mb-4 text-left">
            Craig’s Holdings
          </h4>   

          <div className="flex justify-end">
            <Dropdown>
              <DropdownTrigger>
                <Button size="sm" variant="flat" className="flex items-center gap-1">
                  Sort by:{' '}
                  {sortKey === 'value'
                    ? 'Value'
                    : sortKey === 'pct'
                    ? 'Gain %'
                    : 'Date'}
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
                  Date
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sorted.map(({ symbol, marketValue, pct, purchaseDate }) => (
              <Card key={symbol} shadow="sm" radius="md" fullWidth>
                <CardHeader>{symbol}</CardHeader>
                <CardBody className="flex justify-between items-center">
                  <span>{marketValue}</span>
                  <span className={pct.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                    {pct}
                  </span>
                </CardBody>
                <CardFooter className="text-xs text-gray-500">
                  Purchased {purchaseDate}
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
