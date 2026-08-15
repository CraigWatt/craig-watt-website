import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

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

type SourceSnapshot = {
  name: string;
  url: string;
  fetchedAt: string;
};

type MealDealHistoryPoint = {
  date: string;
  clubcardPrice: number | null;
  regularPrice: number | null;
  source: SourceSnapshot;
};

type InflationHistoryPoint = {
  date: string;
  index: number;
};

type CostOfLivingPayload = {
  apiStatus: {
    inflation: boolean;
    salaries: boolean;
    mealDeals: boolean;
  };
  inflation: {
    index: number | null;
    rate12m: number | null;
    period: string | null;
    source: SourceSnapshot;
    history: InflationHistoryPoint[];
  };
  salaries: {
    dataset: string;
    downloadUrl: string | null;
    source: SourceSnapshot;
    notes: string;
  };
  mealDeal: {
    retailer: string;
    clubcardPrice: number | null;
    regularPrice: number | null;
    source: SourceSnapshot;
    notes: string;
    history: MealDealHistoryPoint[];
  };
  _meta: {
    cold: boolean;
    stale: boolean;
    partial: boolean;
    warnings: string[];
  };
};

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=300, stale-while-revalidate=1800',
};

const ONS_CPIH_SERIES_URL = 'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/l522/mm23';
const ONS_ASHE_TABLE_7_URL =
  'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/placeofworkbylocalauthorityashetable7';
const ONS_INFLATION_TOPIC_URL = 'https://www.ons.gov.uk/economy/inflationandpriceindices?os=0';
const ONS_ASHE_TABLE_7_FALLBACK_ZIP_URL =
  'https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/placeofworkbylocalauthorityashetable7/2025provisional/ashetable72025provisional.zip';
const TESCO_MEAL_DEAL_URL =
  'https://www.tesco.com/groceries/en-GB/shop/fresh-food/chilled-soup-sandwiches-and-salad-pots/lunch-meal-deals';
const HISTORY_BUCKET = process.env.COST_OF_LIVING_HISTORY_BUCKET ?? '';
const HISTORY_KEY = process.env.COST_OF_LIVING_HISTORY_KEY ?? 'cost-of-living/meal-deal-history.json';
const HISTORY_LIMIT = 365;
const s3 = HISTORY_BUCKET ? new S3Client({}) : null;

const CPIH_HISTORY_FALLBACK: InflationHistoryPoint[] = [
  { date: '2022-01', index: 114.6 },
  { date: '2022-02', index: 115.4 },
  { date: '2022-03', index: 116.5 },
  { date: '2022-04', index: 119.0 },
  { date: '2022-05', index: 119.7 },
  { date: '2022-06', index: 120.5 },
  { date: '2022-07', index: 121.2 },
  { date: '2022-08', index: 121.8 },
  { date: '2022-09', index: 122.3 },
  { date: '2022-10', index: 124.3 },
  { date: '2022-11', index: 124.8 },
  { date: '2022-12', index: 125.3 },
  { date: '2023-01', index: 124.8 },
  { date: '2023-02', index: 126.0 },
  { date: '2023-03', index: 126.8 },
  { date: '2023-04', index: 128.3 },
  { date: '2023-05', index: 129.1 },
  { date: '2023-06', index: 129.4 },
  { date: '2023-07', index: 129.0 },
  { date: '2023-08', index: 129.4 },
  { date: '2023-09', index: 130.1 },
  { date: '2023-10', index: 130.2 },
  { date: '2023-11', index: 130.0 },
  { date: '2023-12', index: 130.5 },
  { date: '2024-01', index: 130.0 },
  { date: '2024-02', index: 130.8 },
  { date: '2024-03', index: 131.6 },
  { date: '2024-04', index: 132.2 },
  { date: '2024-05', index: 132.7 },
  { date: '2024-06', index: 133.0 },
  { date: '2024-07', index: 132.9 },
  { date: '2024-08', index: 133.4 },
  { date: '2024-09', index: 133.5 },
  { date: '2024-10', index: 134.3 },
  { date: '2024-11', index: 134.6 },
  { date: '2024-12', index: 135.1 },
  { date: '2025-01', index: 135.1 },
  { date: '2025-02', index: 135.6 },
  { date: '2025-03', index: 136.1 },
  { date: '2025-04', index: 137.7 },
  { date: '2025-05', index: 138.0 },
  { date: '2025-06', index: 138.4 },
  { date: '2025-07', index: 138.5 },
  { date: '2025-08', index: 138.9 },
  { date: '2025-09', index: 138.9 },
  { date: '2025-10', index: 139.5 },
  { date: '2025-11', index: 139.4 },
  { date: '2025-12', index: 139.9 },
  { date: '2026-01', index: 139.4 },
  { date: '2026-02', index: 140.0 },
  { date: '2026-03', index: 140.8 },
  { date: '2026-04', index: 141.8 },
  { date: '2026-05', index: 142.1 },
  { date: '2026-06', index: 142.3 },
];

const INFLATION_FALLBACK_SNAPSHOT: CostOfLivingPayload['inflation'] = {
  index: 142.3,
  rate12m: 2.8,
  period: '2026 JUN',
  source: {
    name: 'ONS inflation topic page fallback snapshot',
    url: ONS_INFLATION_TOPIC_URL,
    fetchedAt: '2026-07-22T07:00:00.000Z',
  },
  history: CPIH_HISTORY_FALLBACK,
};

const SALARY_FALLBACK_SNAPSHOT = {
  downloadUrl: ONS_ASHE_TABLE_7_FALLBACK_ZIP_URL,
  source: {
    name: 'ONS ASHE Table 7 fallback snapshot',
    url: ONS_ASHE_TABLE_7_URL,
    fetchedAt: '2025-10-23T07:00:00.000Z',
  },
};

const MEAL_DEAL_FALLBACK_SNAPSHOT = {
  clubcardPrice: 3.85,
  regularPrice: 4.25,
  source: {
    name: 'Tesco lunch meal deals fallback snapshot',
    url: TESCO_MEAL_DEAL_URL,
    fetchedAt: '2026-07-27T21:00:37.277Z',
  },
};

const MEAL_DEAL_HISTORY_SEED: MealDealHistoryPoint[] = [
  {
    date: '2022-10-24',
    clubcardPrice: 3.4,
    regularPrice: 3.9,
    source: {
      name: 'Reuters / Euronews Tesco meal deal price rise',
      url: 'https://www.euronews.com/2022/10/22/tesco-prices',
      fetchedAt: '2022-10-22T00:00:00.000Z',
    },
  },
  {
    date: '2024-08-22',
    clubcardPrice: 3.6,
    regularPrice: 4,
    source: {
      name: 'Tesco meal deal price rise coverage',
      url: 'https://www.lbc.co.uk/article/tesco-meal-deal-prices-rise-5HjdBJ9_2/',
      fetchedAt: '2024-08-20T00:00:00.000Z',
    },
  },
  {
    date: '2025-08-21',
    clubcardPrice: 3.85,
    regularPrice: 4.25,
    source: {
      name: 'Guardian Tesco meal deal price rise',
      url: 'https://www.theguardian.com/business/2025/aug/21/customers-feeling-raw-tesco-adds-25p-meal-deal',
      fetchedAt: '2025-08-21T00:00:00.000Z',
    },
  },
];

const TTL_MS = 15 * 60 * 1000;
const STALE_TTL_MS = 6 * 60 * 60 * 1000;
const RETRIES = 2;

let cachedPayload: CostOfLivingPayload | null = null;
let lastFetchedAt = 0;
let inFlight: Promise<CostOfLivingPayload> | null = null;

function json(statusCode: number, body: unknown): HttpResponse {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
  };
}

async function fetchText(url: string): Promise<string> {
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'user-agent': 'craigwatt-cost-of-living-bot/1.0',
      },
    });

    if (response.ok) {
      return response.text();
    }

    if (response.status === 429 && attempt < RETRIES) {
      const retryAfter = Number(response.headers.get('retry-after') ?? '0');
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1);

      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    const body = await response.text().catch(() => '');
    throw new Error(`Fetch failed for ${url} with HTTP ${response.status}${body ? `: ${body}` : ''}`);
  }

  throw new Error(`Fetch failed for ${url} after retries`);
}

function parseNumber(value: string | null | undefined): number | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function sortHistory(points: MealDealHistoryPoint[]) {
  return [...points].sort((a, b) => a.date.localeCompare(b.date));
}

function upsertHistoryPoint(
  points: MealDealHistoryPoint[],
  point: MealDealHistoryPoint
): MealDealHistoryPoint[] {
  const filtered = points.filter((entry) => entry.date !== point.date);
  return sortHistory([...filtered, point]).slice(-HISTORY_LIMIT);
}

async function readHistoryFromS3(): Promise<MealDealHistoryPoint[]> {
  if (!s3 || !HISTORY_BUCKET) {
    return [];
  }

  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: HISTORY_BUCKET,
        Key: HISTORY_KEY,
      })
    );

    const body = await response.Body?.transformToString();
    if (!body) {
      return [];
    }

    const parsed = JSON.parse(body) as MealDealHistoryPoint[];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Meal-deal history read failed', error);
    return [];
  }
}

async function writeHistoryToS3(points: MealDealHistoryPoint[]) {
  if (!s3 || !HISTORY_BUCKET) {
    return;
  }

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: HISTORY_BUCKET,
        Key: HISTORY_KEY,
        Body: JSON.stringify(points),
        ContentType: 'application/json; charset=utf-8',
      })
    );
  } catch (error) {
    console.error('Meal-deal history write failed', error);
  }
}

function buildMeta(
  apiStatus: CostOfLivingPayload['apiStatus'],
  overrides: Partial<CostOfLivingPayload['_meta']> = {}
): CostOfLivingPayload['_meta'] {
  const warnings = [
    !apiStatus.inflation ? 'Inflation data unavailable' : null,
    !apiStatus.salaries ? 'Salary data unavailable' : null,
    !apiStatus.mealDeals ? 'Meal-deal data unavailable' : null,
  ].filter((entry): entry is string => Boolean(entry));

  return {
    cold: overrides.cold ?? false,
    stale: overrides.stale ?? false,
    partial: overrides.partial ?? warnings.length > 0,
    warnings: overrides.warnings ?? warnings,
  };
}

async function loadCpihSnapshot(): Promise<CostOfLivingPayload['inflation']> {
  try {
    const html = await fetchText(ONS_CPIH_SERIES_URL);
    const monthPattern =
      /(\d{4})\s+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)\s+\|\s+([0-9]+(?:\.[0-9]+)?)/g;
    const monthMap: Record<string, string> = {
      JAN: '01',
      FEB: '02',
      MAR: '03',
      APR: '04',
      MAY: '05',
      JUN: '06',
      JUL: '07',
      AUG: '08',
      SEP: '09',
      OCT: '10',
      NOV: '11',
      DEC: '12',
    };
    const history: InflationHistoryPoint[] = [];
    let match = monthPattern.exec(html);

    while (match) {
      const [, year, month, value] = match;
      const index = Number(value);
      if (!Number.isFinite(index)) {
        match = monthPattern.exec(html);
        continue;
      }

      history.push({
        date: `${year}-${monthMap[month]}`,
        index,
      });

      match = monthPattern.exec(html);
    }

    if (history.length === 0) {
      throw new Error('ONS CPIH series page did not contain monthly history rows');
    }

    const latestPoint = history[history.length - 1];
    const latestValue = latestPoint.index;
    const latestTime = latestPoint.date;
    const [latestYear, latestMonth] = latestTime.split('-');
    const previousPoint = history.find(
      (point) => point.date === `${Number(latestYear) - 1}-${latestMonth}`
    );

    const rate12m =
      previousPoint && previousPoint.index !== 0
        ? ((latestValue - previousPoint.index) / previousPoint.index) * 100
        : null;

    return {
      index: latestValue,
      rate12m,
      period: latestTime.replace('-', ' '),
      source: {
        name: 'ONS CPIH index time series',
        url: ONS_CPIH_SERIES_URL,
        fetchedAt: new Date().toISOString(),
      },
      history,
    };
  } catch (error) {
    console.error('CPIH snapshot failed', error);
    return INFLATION_FALLBACK_SNAPSHOT;
  }
}

function parseAsheSnapshot(html: string) {
  const zipMatch = html.match(/href="([^"]+\.zip)"/i) ?? html.match(/href='([^']+\.zip)'/i);
  return {
    downloadUrl: zipMatch?.[1] ? new URL(zipMatch[1], ONS_ASHE_TABLE_7_URL).toString() : null,
  };
}

async function loadMealDealHistory(
  currentSnapshot: MealDealHistoryPoint
): Promise<MealDealHistoryPoint[]> {
  const stored = await readHistoryFromS3();
  const base = stored.length > 0 ? stored : MEAL_DEAL_HISTORY_SEED;
  if (currentSnapshot.clubcardPrice === null && currentSnapshot.regularPrice === null) {
    return base;
  }
  const merged = upsertHistoryPoint(base, currentSnapshot);
  await writeHistoryToS3(merged);
  return merged;
}

function parseTescoSnapshot(html: string) {
  const priceMatch =
    html.match(
      /£([0-9]+(?:\.[0-9]{2})?)\s+Meal Deal (?:Main|Drink)s?\s+Clubcard Price\s+£([0-9]+(?:\.[0-9]{2})?)\s+Meal Deal (?:Main|Drink)s?\s+Regular Price/i
    ) ??
    html.match(
      /£([0-9]+(?:\.[0-9]{2})?)\s+Meal Deal .*? Clubcard Price\s+£([0-9]+(?:\.[0-9]{2})?)\s+Meal Deal .*? Regular Price/i
    );

  return {
    clubcardPrice: parseNumber(priceMatch?.[1] ?? null),
    regularPrice: parseNumber(priceMatch?.[2] ?? null),
  };
}

async function loadFreshPayload(): Promise<CostOfLivingPayload> {
  const inflation = await loadCpihSnapshot();

  let asheHtml: string | null = null;
  try {
    asheHtml = await fetchText(ONS_ASHE_TABLE_7_URL);
  } catch (error) {
    console.error('ASHE snapshot failed', error);
  }

  let tescoHtml: string | null = null;
  try {
    tescoHtml = await fetchText(TESCO_MEAL_DEAL_URL);
  } catch (error) {
    console.error('Tesco meal-deal snapshot failed', error);
  }

  const salaries = asheHtml ? parseAsheSnapshot(asheHtml) : SALARY_FALLBACK_SNAPSHOT;
  const parsedMealDeal = tescoHtml ? parseTescoSnapshot(tescoHtml) : null;
  const mealDeal =
    parsedMealDeal &&
    (parsedMealDeal.clubcardPrice !== null || parsedMealDeal.regularPrice !== null)
      ? parsedMealDeal
      : MEAL_DEAL_FALLBACK_SNAPSHOT;
  const mealDealHistory = await loadMealDealHistory({
    date: todayKey(),
    clubcardPrice: mealDeal.clubcardPrice,
    regularPrice: mealDeal.regularPrice,
    source: {
      name: mealDeal === MEAL_DEAL_FALLBACK_SNAPSHOT ? MEAL_DEAL_FALLBACK_SNAPSHOT.source.name : 'Tesco lunch meal deals page',
      url: TESCO_MEAL_DEAL_URL,
      fetchedAt:
        mealDeal === MEAL_DEAL_FALLBACK_SNAPSHOT
          ? MEAL_DEAL_FALLBACK_SNAPSHOT.source.fetchedAt
          : new Date().toISOString(),
    },
  });

  return {
    apiStatus: {
      inflation: inflation.index !== null,
      salaries: Boolean(salaries.downloadUrl),
      mealDeals: mealDeal.clubcardPrice !== null || mealDeal.regularPrice !== null,
    },
    inflation,
    salaries: {
      dataset: 'ASHE Table 7',
      downloadUrl: salaries.downloadUrl,
      source: {
        name:
          salaries.downloadUrl === SALARY_FALLBACK_SNAPSHOT.downloadUrl
            ? SALARY_FALLBACK_SNAPSHOT.source.name
            : 'ONS ASHE Table 7 dataset page',
        url: ONS_ASHE_TABLE_7_URL,
        fetchedAt:
          salaries.downloadUrl === SALARY_FALLBACK_SNAPSHOT.downloadUrl
            ? SALARY_FALLBACK_SNAPSHOT.source.fetchedAt
            : new Date().toISOString(),
      },
      notes: 'Public source used to derive salary-by-location snapshots.',
    },
    mealDeal: {
      retailer: 'Tesco',
      clubcardPrice: mealDeal.clubcardPrice,
      regularPrice: mealDeal.regularPrice,
      source: {
        name:
          mealDeal === MEAL_DEAL_FALLBACK_SNAPSHOT
            ? MEAL_DEAL_FALLBACK_SNAPSHOT.source.name
            : 'Tesco lunch meal deals page',
        url: TESCO_MEAL_DEAL_URL,
        fetchedAt:
          mealDeal === MEAL_DEAL_FALLBACK_SNAPSHOT
            ? MEAL_DEAL_FALLBACK_SNAPSHOT.source.fetchedAt
            : new Date().toISOString(),
      },
      notes: 'Public retailer page used to snapshot meal-deal pricing.',
      history: mealDealHistory,
    },
    _meta: buildMeta({
      inflation: inflation.index !== null,
      salaries: Boolean(salaries.downloadUrl),
      mealDeals: mealDeal.clubcardPrice !== null || mealDeal.regularPrice !== null,
    }),
  };
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
      _meta: buildMeta(cachedPayload.apiStatus, { cold: false, stale: false }),
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
      _meta: buildMeta(payload.apiStatus, { cold: false, stale: false }),
    });
  } catch (error) {
    console.error('Cost of living lambda failed', error);

    if (cachedPayload && now - lastFetchedAt < STALE_TTL_MS) {
      return json(200, {
        ...cachedPayload,
        _meta: buildMeta(cachedPayload.apiStatus, { cold: false, stale: true }),
      });
    }

    return json(503, {
      error: 'Upstream fetch failed',
      _meta: { cold: true, stale: false },
    });
  } finally {
    inFlight = null;
  }
}
