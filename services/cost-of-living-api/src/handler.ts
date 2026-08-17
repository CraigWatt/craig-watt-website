import {
  extractSalaryBenchmarksFromAsheTable15Zip,
  extractSalaryBenchmarksFromAsheTable7Zip,
  SALARY_BENCHMARK_FALLBACKS,
  type SalaryBenchmark,
} from './ashe';
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

type SourceMode = 'live' | 'fallback' | 'unavailable';

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
  sourceStatus: {
    inflation: SourceMode;
    salaries: SourceMode;
    mealDeals: SourceMode;
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
    benchmarks: SalaryBenchmark[];
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

type SourceStatuses = CostOfLivingPayload['sourceStatus'];

const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'public, max-age=300, stale-while-revalidate=1800',
};

const ONS_CPIH_INDEX_SERIES_URL =
  'https://www.ons.gov.uk/economy/inflationandpriceindices/timeseries/l522/mm23';
const ONS_CPIH_INDEX_LINECHART_CONFIG_URL = `${ONS_CPIH_INDEX_SERIES_URL}/linechartconfig`;
const ONS_ASHE_TABLE_7_URL =
  'https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/placeofworkbylocalauthorityashetable7';
const ONS_INFLATION_TOPIC_URL = 'https://www.ons.gov.uk/economy/inflationandpriceindices?os=0';
const ONS_ASHE_TABLE_7_FALLBACK_ZIP_URL =
  'https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/placeofworkbylocalauthorityashetable7/2025provisional/ashetable72025provisional.zip';
const ONS_ASHE_TABLE_15_FALLBACK_ZIP_URL =
  'https://www.ons.gov.uk/file?uri=/employmentandlabourmarket/peopleinwork/earningsandworkinghours/datasets/regionbyoccupation4digitsoc2010ashetable15/2025provisional/ashetable152025provisional.zip';
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
  table7DownloadUrl: ONS_ASHE_TABLE_7_FALLBACK_ZIP_URL,
  table15DownloadUrl: ONS_ASHE_TABLE_15_FALLBACK_ZIP_URL,
  source: {
    name: 'ONS ASHE salary benchmark fallback snapshot',
    url: ONS_ASHE_TABLE_7_URL,
    fetchedAt: '2025-10-23T07:00:00.000Z',
  },
  benchmarks: SALARY_BENCHMARK_FALLBACKS,
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
    date: '2022-02-01',
    clubcardPrice: 3,
    regularPrice: 3.5,
    source: {
      name: 'Tesco meal deal February 2022 price rise coverage',
      url: 'https://www.moneysavingexpert.com/news/2022/10/tesco-meal-deal-price-hike/',
      fetchedAt: '2022-10-21T00:00:00.000Z',
    },
  },
  {
    date: '2022-10-24',
    clubcardPrice: 3.4,
    regularPrice: 3.9,
    source: {
      name: 'Tesco meal deal October 2022 price rise coverage',
      url: 'https://www.moneysavingexpert.com/news/2022/10/tesco-meal-deal-price-hike/',
      fetchedAt: '2022-10-21T00:00:00.000Z',
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
const REQUEST_TIMEOUT_MS = 5000;
const BINARY_REQUEST_TIMEOUT_MS = 15000;

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

function summariseFetchFailureBody(body: string) {
  const compact = body
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!compact) {
    return '';
  }

  return compact.slice(0, 180);
}

async function fetchText(url: string): Promise<string> {
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
    const summary = summariseFetchFailureBody(body);
    throw new Error(`Fetch failed for ${url} with HTTP ${response.status}${summary ? `: ${summary}` : ''}`);
  }

  throw new Error(`Fetch failed for ${url} after retries`);
}

async function fetchBuffer(url: string, timeoutMs = BINARY_REQUEST_TIMEOUT_MS): Promise<Buffer> {
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        accept: 'application/zip,application/octet-stream;q=0.9,*/*;q=0.8',
        'user-agent': 'craigwatt-cost-of-living-bot/1.0',
      },
    });

    if (response.ok) {
      return Buffer.from(await response.arrayBuffer());
    }

    if (response.status === 429 && attempt < RETRIES) {
      const retryAfter = Number(response.headers.get('retry-after') ?? '0');
      const waitMs =
        Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1);

      await new Promise((resolve) => setTimeout(resolve, waitMs));
      continue;
    }

    const body = await response.text().catch(() => '');
    const summary = summariseFetchFailureBody(body);
    throw new Error(`Fetch failed for ${url} with HTTP ${response.status}${summary ? `: ${summary}` : ''}`);
  }

  throw new Error(`Fetch failed for ${url} after retries`);
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
  sourceStatus: SourceStatuses,
  overrides: Partial<CostOfLivingPayload['_meta']> = {}
): CostOfLivingPayload['_meta'] {
  const warnings = [
    sourceStatus.inflation === 'fallback'
      ? 'Inflation source is on fallback snapshot'
      : sourceStatus.inflation === 'unavailable'
        ? 'Inflation data unavailable'
        : null,
    sourceStatus.salaries === 'fallback'
      ? 'Salary source is on fallback snapshot'
      : sourceStatus.salaries === 'unavailable'
        ? 'Salary data unavailable'
        : null,
    sourceStatus.mealDeals === 'fallback'
      ? 'Meal-deal source is on fallback snapshot'
      : sourceStatus.mealDeals === 'unavailable'
        ? 'Meal-deal data unavailable'
        : null,
  ].filter((entry): entry is string => Boolean(entry));

  return {
    cold: overrides.cold ?? false,
    stale: overrides.stale ?? false,
    partial: overrides.partial ?? warnings.length > 0,
    warnings: overrides.warnings ?? warnings,
  };
}

function parseOnsSeriesPointLabel(value: string) {
  const match = value.match(/^(\d{4}) ([A-Z]{3})$/);
  if (!match) {
    return null;
  }

  const [, year, monthLabel] = match;
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
  const month = monthMap[monthLabel];
  if (!month) {
    return null;
  }

  return `${year}-${month}`;
}

function parseOnsLineChartHistory(script: string): InflationHistoryPoint[] {
  const history: InflationHistoryPoint[] = [];
  const pointPattern = /\{"name":"(\d{4} [A-Z]{3})", "y": ([0-9]+(?:\.[0-9]+)?) \}/g;
  let pointMatch = pointPattern.exec(script);

  while (pointMatch) {
    const [, label, rawIndex] = pointMatch;
    const date = parseOnsSeriesPointLabel(label);
    const index = Number(rawIndex);

    if (date && Number.isFinite(index)) {
      history.push({ date, index });
    }

    pointMatch = pointPattern.exec(script);
  }

  return history.sort((a, b) => a.date.localeCompare(b.date));
}

async function loadCpihSnapshot(): Promise<CostOfLivingPayload['inflation']> {
  try {
    const lineChartConfig = await fetchText(ONS_CPIH_INDEX_LINECHART_CONFIG_URL);
    const history = parseOnsLineChartHistory(lineChartConfig);

    if (history.length === 0) {
      throw new Error('ONS CPIH line chart config did not contain monthly history rows');
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
        name: 'ONS CPIH time series',
        url: ONS_CPIH_INDEX_SERIES_URL,
        fetchedAt: new Date().toISOString(),
      },
      history,
    };
  } catch (error) {
    console.error('CPIH snapshot failed', error);
    return INFLATION_FALLBACK_SNAPSHOT;
  }
}

function getInflationStatus(
  inflation: CostOfLivingPayload['inflation']
): SourceMode {
  if (inflation.index === null || inflation.history.length === 0) {
    return 'unavailable';
  }

  return inflation.source.name === INFLATION_FALLBACK_SNAPSHOT.source.name ? 'fallback' : 'live';
}

async function loadAsheBenchmarks() {
  const table7Result = await fetchBuffer(ONS_ASHE_TABLE_7_FALLBACK_ZIP_URL)
    .then((zipBuffer) => extractSalaryBenchmarksFromAsheTable7Zip(zipBuffer))
    .then(
      (value) => ({ status: 'fulfilled', value } as const),
      (reason) => ({ status: 'rejected', reason } as const)
    );

  const table15Result = await fetchBuffer(ONS_ASHE_TABLE_15_FALLBACK_ZIP_URL)
    .then((zipBuffer) => extractSalaryBenchmarksFromAsheTable15Zip(zipBuffer))
    .then(
      (value) => ({ status: 'fulfilled', value } as const),
      (reason) => ({ status: 'rejected', reason } as const)
    );

  if (table7Result.status === 'rejected') {
    console.error('ASHE Table 7 benchmark extraction failed', table7Result.reason);
  }

  if (table15Result.status === 'rejected') {
    console.error('ASHE Table 15 benchmark extraction failed', table15Result.reason);
  }

  return {
    table7Benchmarks:
      table7Result.status === 'fulfilled'
        ? table7Result.value
        : SALARY_BENCHMARK_FALLBACKS.filter((benchmark) => benchmark.role === 'all-employees'),
    table15Benchmarks:
      table15Result.status === 'fulfilled'
        ? table15Result.value
        : SALARY_BENCHMARK_FALLBACKS.filter(
            (benchmark) => benchmark.role === 'software-engineer'
          ),
    table7Live: table7Result.status === 'fulfilled',
    table15Live: table15Result.status === 'fulfilled',
  };
}

async function loadSalarySnapshot() {
  const { table7Benchmarks, table15Benchmarks, table7Live, table15Live } =
    await loadAsheBenchmarks();
  const liveCount = Number(table7Live) + Number(table15Live);

  if (liveCount === 0) {
    return {
      downloadUrl: SALARY_FALLBACK_SNAPSHOT.table7DownloadUrl,
      benchmarks: SALARY_BENCHMARK_FALLBACKS,
      source: SALARY_FALLBACK_SNAPSHOT.source,
      sourceMode: 'fallback' as const,
    };
  }

  return {
    downloadUrl: ONS_ASHE_TABLE_7_FALLBACK_ZIP_URL,
    benchmarks: [...table7Benchmarks, ...table15Benchmarks],
    source: {
      name:
        liveCount === 2
          ? 'ONS ASHE Table 7 and Table 15 ZIP downloads'
          : 'ONS ASHE salary benchmark mixed live snapshot',
      url: liveCount === 2 ? ONS_ASHE_TABLE_7_FALLBACK_ZIP_URL : ONS_ASHE_TABLE_7_URL,
      fetchedAt: new Date().toISOString(),
    },
    sourceMode: liveCount === 2 ? ('live' as const) : ('fallback' as const),
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

async function loadFreshPayload(): Promise<CostOfLivingPayload> {
  const inflation = await loadCpihSnapshot();

  const salaries = await loadSalarySnapshot();
  const salaryStatus: SourceMode = salaries.sourceMode;
  const mealDeal = MEAL_DEAL_FALLBACK_SNAPSHOT;
  const mealDealStatus: SourceMode = 'fallback';
  const sourceStatus: SourceStatuses = {
    inflation: getInflationStatus(inflation),
    salaries: salaryStatus,
    mealDeals: mealDealStatus,
  };
  const apiStatus = {
    inflation: sourceStatus.inflation !== 'unavailable',
    salaries: sourceStatus.salaries !== 'unavailable',
    mealDeals: sourceStatus.mealDeals !== 'unavailable',
  };
  const mealDealHistory = await loadMealDealHistory({
    date: todayKey(),
    clubcardPrice: mealDeal.clubcardPrice,
    regularPrice: mealDeal.regularPrice,
    source: {
      name: MEAL_DEAL_FALLBACK_SNAPSHOT.source.name,
      url: TESCO_MEAL_DEAL_URL,
      fetchedAt: MEAL_DEAL_FALLBACK_SNAPSHOT.source.fetchedAt,
    },
  });

  return {
    apiStatus,
    sourceStatus,
    inflation,
    salaries: {
      dataset: 'ASHE Table 7 + 15',
      downloadUrl: salaries.downloadUrl,
      source: salaries.source,
      notes: 'Public sources used to derive representative local-authority and software-engineer salary benchmarks.',
      benchmarks: salaries.benchmarks,
    },
    mealDeal: {
      retailer: 'Tesco',
      clubcardPrice: mealDeal.clubcardPrice,
      regularPrice: mealDeal.regularPrice,
      source: {
        name: MEAL_DEAL_FALLBACK_SNAPSHOT.source.name,
        url: TESCO_MEAL_DEAL_URL,
        fetchedAt: MEAL_DEAL_FALLBACK_SNAPSHOT.source.fetchedAt,
      },
      notes:
        'Tesco meal-deal pricing is intentionally served from a stored snapshot because Tesco blocks automated AWS fetches.',
      history: mealDealHistory,
    },
    _meta: buildMeta(sourceStatus),
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
      _meta: buildMeta(cachedPayload.sourceStatus, { cold: false, stale: false }),
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
      _meta: buildMeta(payload.sourceStatus, { cold: false, stale: false }),
    });
  } catch (error) {
    console.error('Cost of living lambda failed', error);

    if (cachedPayload && now - lastFetchedAt < STALE_TTL_MS) {
      return json(200, {
        ...cachedPayload,
        _meta: buildMeta(cachedPayload.sourceStatus, { cold: false, stale: true }),
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
