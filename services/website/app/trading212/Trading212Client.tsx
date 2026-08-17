'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import PublicDashboard from '../components/PublicDashboard'
import { Alert, Button } from '@heroui/react'
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
        <Alert
          title="Error loading data"
          description="Could not load Trading212 metrics. Try again shortly."
          color="danger"
          variant="flat"
          radius="md"
          isClosable
          endContent={
            <Button size="sm" onPress={() => mutate()} variant="flat">
              Retry
            </Button>
          }
        />
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
