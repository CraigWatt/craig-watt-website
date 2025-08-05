// app/trading212/Trading212Client.tsx
'use client'

import useSWR from 'swr'
import PublicDashboard from '../components/PublicDashboard'
import type {
  PublicMetrics,
  PublicPos,
  PublicApiStatus,   // if you exported that
} from './lib/transform'

// simple SWR fetcher
const fetcher = (url: string) => fetch(url).then(res => res.json())

interface ApiResponse {
  apiStatus: PublicApiStatus
  metrics:   PublicMetrics
  positions: PublicPos[]
}

export default function Trading212Client() {
  const { data, error } = useSWR<ApiResponse>('/api/trading212', fetcher)

  if (error)  return <p className="p-4 text-center">Error loading…</p>
  if (!data) return <p className="p-4 text-center">Loading…</p>

  return <PublicDashboard data={data} />
}
