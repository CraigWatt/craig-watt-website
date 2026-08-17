'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import PublicDashboard from '../components/PublicDashboard'
import { LoadingIndicator } from '../components/LoadingIndicator'

import type {
  PublicMetrics,
  PublicPos,
  PublicApiStatus,
} from './types'

interface ApiResponse {
  apiStatus: PublicApiStatus
  metrics: PublicMetrics
  positions: PublicPos[]
}

const fetcher = async (url: string): Promise<ApiResponse> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function Trading212Client() {
  const { data, error, isValidating, mutate } = useSWR<ApiResponse>(
    '/api/trading212',
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    if (error) {
      console.warn('[Trading212] Load failed:', error)
    }
  }, [error])

  if (error) {
    return (
      <div className="px-4 py-6 max-w-md mx-auto">
        <div className="site-surface rounded-[1.75rem] px-5 py-4">
          <p className="font-medium text-[var(--color-foreground)]">Error loading data</p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Could not load Trading212 metrics. Try again shortly.
          </p>
          <button
            type="button"
            onClick={() => mutate()}
            className="mt-4 inline-flex rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data || isValidating) {
    return (
      <LoadingIndicator label="Loading Trading212 data…" />
    )
  }

  return <PublicDashboard data={data} />
}
