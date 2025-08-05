// app/trading212/lib/server.ts
import pLimit from 'p-limit'

// tell Next to cache this page for 60s
export const revalidate = 60

const BASE    = 'https://live.trading212.com/api/v0'
const limit   = pLimit(5)    // max 5 concurrent
const RETRIES = 2             // retry 2× on 429

async function fetchT212Safe<T>(path: string): Promise<{ ok: boolean; data: T | null }> {
  // run this whole block under the limiter
  return limit(async () => {
    for (let attempt = 0; attempt <= RETRIES; attempt++) {
      const res = await fetch(`${BASE}${path}`, {
        headers: { Authorization: process.env.T212_API_KEY! },
        // we still want ISR at the page level
        next: { revalidate: 60 },
      })

      if (res.ok) {
        const json = (await res.json()) as T
        return { ok: true, data: json }
      }

      // if we get throttled, back off a bit and retry
      if (res.status === 429 && attempt < RETRIES) {
        await new Promise(r => setTimeout(r, 500 * (attempt + 1)))
        continue
      }

      console.warn(`T212 ${path} returned status ${res.status}`)
      return { ok: false, data: null }
    }
    return { ok: false, data: null }
  })
}

export function getAccountCashSafe() {
  return fetchT212Safe<{
    blocked: number
    free: number
    invested: number
    pieCash: number
    ppl: number
    result: number
    total: number
  }>('/equity/account/cash')
}

export function getPortfolioSafe() {
  return fetchT212Safe<Array<{
    ticker: string
    quantity: number
    averagePrice: number
    currentPrice: number
    pieQuantity: number
    ppl: number
    fxPpl: number | null
    initialFillDate: string
  }>>('/equity/portfolio')
}

export function getPiesSafe() {
  return fetchT212Safe<Array<{
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
  }>>('/equity/pies')
}

export function getPieDetailSafe(id: number) {
  return fetchT212Safe<{
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
  }>(`/equity/pies/${id}`)
}

export async function getUsdGbpRateSafe(): Promise<{ ok: boolean; data: number }> {
  const key = process.env.FX_API_KEY
  if (!key) {
    console.warn('No FX_API_KEY in env, defaulting to 1')
    return { ok: false, data: 1 }
  }
  try {
    const res = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${key}&currencies=GBP`,
      { next: { revalidate: 60 } }
    )
    if (!res.ok) {
      console.warn(`FX lookup failed: ${res.status}`)
      return { ok: false, data: 1 }
    }
    const json = (await res.json()) as { data?: { GBP?: number } }
    return { ok: true, data: json.data?.GBP ?? 1 }
  } catch (err) {
    console.error('FX lookup error', err)
    return { ok: false, data: 1 }
  }
}
