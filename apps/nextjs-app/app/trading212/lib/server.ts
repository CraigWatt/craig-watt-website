// app/trading212/lib/server.ts
import pLimit from 'p-limit'

// tell Next to cache this page for 60s
export const revalidate = 60

const BASE = 'https://live.trading212.com/api/v0'
const limitCash = pLimit(1)
const limitPortfolio = pLimit(1)
const limitPies = pLimit(1)
const limitPieDetail = pLimit(1)
const RETRIES = 2 // retry 2× on 429

function delay(ms: number, jitter = 250) {
  const j = Math.floor(Math.random() * jitter)
  return new Promise((res) => setTimeout(res, ms + j))
}

/**
 * Trading212 now requires HTTP Basic Auth:
 *   Authorization: Basic base64(API_KEY:API_SECRET)
 */
function getT212AuthHeader(): string {
  const key = process.env.T212_API_KEY
  const secret = process.env.T212_API_SECRET

  if (!key || !secret) {
    // Fail fast so you don't silently 401 and poison caches
    throw new Error(
      '[T212] Missing T212_API_KEY or T212_API_SECRET in environment'
    )
  }

  // Node runtime (ECS/Next server) has Buffer
  const token = Buffer.from(`${key}:${secret}`, 'utf8').toString('base64')
  return `Basic ${token}`
}

async function fetchT212Safe<T>(path: string): Promise<{ ok: boolean; data: T | null }> {
  const authHeader = getT212AuthHeader()

  for (let attempt = 0; attempt <= RETRIES; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
      cache: 'force-cache',
      next: { revalidate: 60 },
    })

    if (res.ok) {
      const json = (await res.json()) as T
      return { ok: true, data: json }
    }

    // Helpful logging for auth failures
    if (res.status === 401 || res.status === 403) {
      const body = await res.text().catch(() => '')
      console.warn(`[T212] ${path} auth failed: HTTP ${res.status}${body ? ` — ${body}` : ''}`)
      return { ok: false, data: null }
    }

    if (res.status === 429 && attempt < RETRIES) {
      console.warn(`T212 ${path} hit rate limit — retrying [${attempt + 1}/${RETRIES}]`)
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      continue
    }

    console.warn(`T212 ${path} returned status ${res.status}`)
    return { ok: false, data: null }
  }

  return { ok: false, data: null }
}

export async function getAccountCashSafe() {
  await delay(2000)
  return limitCash(() =>
    fetchT212Safe<{
      blocked: number
      free: number
      invested: number
      pieCash: number
      ppl: number
      result: number
      total: number
    }>('/equity/account/cash')
  )
}

export async function getPortfolioSafe() {
  await delay(5000)
  return limitPortfolio(() =>
    fetchT212Safe<
      Array<{
        ticker: string
        quantity: number
        averagePrice: number
        currentPrice: number
        pieQuantity: number
        ppl: number
        fxPpl: number | null
        initialFillDate: string
      }>
    >('/equity/portfolio')
  )
}

export async function getPiesSafe() {
  await delay(30000)
  return limitPies(() =>
    fetchT212Safe<
      Array<{
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
      }>
    >('/equity/pies')
  )
}

export async function getPieDetailSafe(id: number) {
  await delay(5000)
  return limitPieDetail(() =>
    fetchT212Safe<{
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
  )
}

