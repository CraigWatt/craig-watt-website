import type {
  Cash,
  PieDetail,
  PieSummary,
  PortfolioItem,
} from '../../../platform/trading212/types';
import { transformForPublic } from '../../../platform/trading212/transform';

type HttpEvent = {
  requestContext?: {
    http?: {
      method?: string;
    };
  };
};

type HttpResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type PublicPayload = ReturnType<typeof transformForPublic>;

const BASE = 'https://live.trading212.com/api/v0';
const TTL_MS = 7 * 60 * 1000;
const STALE_TTL_MS = 30 * 60 * 1000;
const RETRIES = 2;
const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=60, stale-while-revalidate=300',
};

let cachedPayload: PublicPayload | null = null;
let lastFetchedAt = 0;
let inFlight: Promise<PublicPayload> | null = null;

function json(statusCode: number, body: unknown): HttpResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

function getAuthHeader(): string {
  const key = process.env.T212_API_KEY;
  const secret = process.env.T212_API_SECRET;

  if (!key || !secret) {
    throw new Error('Missing T212_API_KEY or T212_API_SECRET');
  }

  return `Basic ${Buffer.from(`${key}:${secret}`, 'utf8').toString('base64')}`;
}

async function fetchTrading212<T>(path: string): Promise<T> {
  const authorization = getAuthHeader();

  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const response = await fetch(`${BASE}${path}`, {
      headers: {
        authorization,
        accept: 'application/json',
      },
    });

    if (response.ok) {
      return (await response.json()) as T;
    }

    if (response.status === 429 && attempt < RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      continue;
    }

    const body = await response.text().catch(() => '');
    throw new Error(`Trading212 ${path} failed with HTTP ${response.status}${body ? `: ${body}` : ''}`);
  }

  throw new Error(`Trading212 ${path} failed after retries`);
}

async function loadFreshPayload(): Promise<PublicPayload> {
  const [cash, portfolio, pies] = await Promise.all([
    fetchTrading212<Cash>('/equity/account/cash'),
    fetchTrading212<PortfolioItem[]>('/equity/portfolio'),
    fetchTrading212<PieSummary[]>('/equity/pies'),
  ]);

  const pieDetails: PieDetail[] = [];
  for (const pie of pies) {
    try {
      const detail = await fetchTrading212<PieDetail>(`/equity/pies/${pie.id}`);
      pieDetails.push(detail);
    } catch (error) {
      console.warn(`Skipping Trading212 pie detail for ${pie.id}`, error);
    }
  }

  return transformForPublic({
    cash,
    portfolio,
    pies,
    pieDetails,
  });
}

export async function handler(event: HttpEvent): Promise<HttpResponse> {
  const method = event.requestContext?.http?.method ?? 'GET';

  if (method === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        ...JSON_HEADERS,
        allow: 'GET,OPTIONS',
      },
      body: '',
    };
  }

  if (method !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const now = Date.now();
  if (cachedPayload && now - lastFetchedAt < TTL_MS) {
    return json(200, {
      ...cachedPayload,
      _meta: { stale: false, cold: false },
    });
  }

  if (!inFlight) {
    inFlight = loadFreshPayload();
  }

  try {
    const payload = await inFlight;
    cachedPayload = payload;
    lastFetchedAt = Date.now();

    return json(200, {
      ...payload,
      _meta: { stale: false, cold: false },
    });
  } catch (error) {
    console.error('Trading212 lambda failed', error);

    if (cachedPayload && now - lastFetchedAt < STALE_TTL_MS) {
      return json(200, {
        ...cachedPayload,
        _meta: { stale: true, cold: false },
      });
    }

    return json(503, {
      error: 'Upstream fetch failed',
      _meta: { stale: false, cold: true },
    });
  } finally {
    inFlight = null;
  }
}
