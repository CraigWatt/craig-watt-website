// app/trading212/lib/server.ts
import pLimit from 'p-limit'

// tell Next to cache this page for 60s
export const revalidate = 60

const BASE    = 'https://live.trading212.com/api/v0'
const limitCash      = pLimit(1)
const limitPortfolio = pLimit(1)
const limitPies      = pLimit(1)
const limitPieDetail = pLimit(1)
const RETRIES = 2             // retry 2× on 429

function delay(ms: number, jitter = 250) {
  const j = Math.floor(Math.random() * jitter)
  return new Promise(res => setTimeout(res, ms + j))
}

async function fetchT212Safe<T>(path: string): Promise<{ ok: boolean; data: T | null }> {
  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: process.env.T212_API_KEY! },
      cache: 'force-cache',
      next: { revalidate: 60 },
    })

    if (res.ok) {
      const json = (await res.json()) as T
      return { ok: true, data: json }
    }

    if (res.status === 429 && attempt < RETRIES) {
      console.warn(`T212 ${path} hit rate limit — retrying [${attempt + 1}/${RETRIES}]`)
      await new Promise(r => setTimeout(r, 1000 * (attempt + 1)))
      continue
    }

    console.warn(`T212 ${path} returned status ${res.status}`)
    return { ok: false, data: null }
  }

  return { ok: false, data: null }
}

export async function getAccountCashSafe() {
  await delay(2000)
  return limitCash(() => fetchT212Safe<{
    blocked: number
    free: number
    invested: number
    pieCash: number
    ppl: number
    result: number
    total: number
  }>('/equity/account/cash'))
}

export async function getPortfolioSafe() {
  await delay(5000)
  return limitPortfolio(() => fetchT212Safe<Array<{
    ticker: string
    quantity: number
    averagePrice: number
    currentPrice: number
    pieQuantity: number
    ppl: number
    fxPpl: number | null
    initialFillDate: string
  }>>('/equity/portfolio'))
}

export async function getPiesSafe() {
  await delay(30000)
  return limitPies(() => fetchT212Safe<Array<{
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
  }>>('/equity/pies'))
}

export async function getPieDetailSafe(id: number) {
  await delay(5000)
  return limitPieDetail(() => fetchT212Safe<{
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
  }>(`/equity/pies/${id}`))
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
