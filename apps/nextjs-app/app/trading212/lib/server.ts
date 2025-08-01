// app/trading212/lib/server.ts
export const dynamic = 'force-dynamic'
const BASE = 'https://live.trading212.com/api/v0'

// generic fetch helper
async function fetchT212<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: process.env.T212_API_KEY! },
      cache: 'force-cache',
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      console.warn(`T212 ${path} returned status ${res.status}`)
      return null
    }
    return (await res.json()) as T
  } catch (e) {
    console.error(`T212 ${path} failed:`, e)
    return null
  }
}

// 1) Cash
export async function getAccountCashSafe() {
  const data = await fetchT212<{
    blocked: number
    free: number
    invested: number
    pieCash: number
    ppl: number
    result: number
    total: number
  }>('/equity/account/cash')
  return data ?? { blocked: 0, free: 0, invested: 0, pieCash: 0, ppl: 0, result: 0, total: 0 }
}

// 2) Portfolio (open positions)
export async function getPortfolioSafe() {
  const data = await fetchT212<Array<{
    ticker: string
    quantity: number
    averagePrice: number
    currentPrice: number
    pieQuantity: number
    ppl: number           // profit/loss for that position
    fxPpl: number | null  // fx portion of P/L (if USD)
  }>>('/equity/portfolio')
  return data ?? []
}

// 3) Pies
export async function getPiesSafe() {
  // /equity/pies returns a JSON array, not a paged object
  const data = await fetchT212<Array<{
    id: number
    cash: number
    dividendDetails: {
      gained: number
      reinvested: number
      inCash: number
    }
    result: {
      priceAvgInvestedValue: number
      priceAvgValue: number   // current total value of the pie
      priceAvgResult: number
      priceAvgResultCoef: number
    }
    progress: number
    status: string | null
  }>>('/equity/pies')
  return data ?? []
}

export async function getPieDetailSafe(id: number) {
  const data = await fetchT212<{
    instruments: Array<{
      ticker: string
      ownedQuantity: number
      result: {
        priceAvgValue: number      // current value of that slice
        priceAvgInvestedValue: number // invested cost of that slice
        priceAvgResult: number     // P/L for that slice
      }
    }>
    settings: {
      name: string
      id: number
    }
  }>(`/equity/pies/${id}`)

  return data
}

// app/trading212/lib/server.ts
export async function getUsdGbpRate(): Promise<number> {
  const key = process.env.FX_API_KEY;
  if (!key) {
    console.warn('No FX_API_KEY in env, defaulting to 1');
    return 1;
  }

  try {
    const res = await fetch(
      `https://api.freecurrencyapi.com/v1/latest?apikey=${key}&currencies=GBP`,
      {
        cache: 'no-store',
      }
    );
    if (!res.ok) {
      console.warn(`FX lookup failed: ${res.status}`);
      return 1;
    }
    const json = (await res.json()) as { data?: { GBP?: number } };
    return json.data?.GBP ?? 1;
  } catch (err) {
    console.error('FX lookup error', err);
    return 1;
  }
}
