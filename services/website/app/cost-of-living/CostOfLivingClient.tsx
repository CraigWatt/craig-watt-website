'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Alert, Button, Card, CardBody, CardHeader, Chip, Spinner } from '@heroui/react';
import { AreaChart, type CustomTooltipProps } from '@tremor/react';
import { Activity } from '../components/icons';
import { RefreshArrow } from '../components/icons/RefreshArrow';

type SourceSnapshot = {
  name: string;
  url: string;
  fetchedAt: string;
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
    local: boolean;
    partial: boolean;
    warnings: string[];
  };
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

type HistoryRange = '1y' | '5y' | '10y' | '20y' | 'all';

type MealDealSnapshot = {
  clubcardPrice: number | null;
  regularPrice: number | null;
  fetchedAt: string;
};

const fetcher = async (url: string): Promise<CostOfLivingPayload> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
};

function formatCurrency(value: number | null) {
  if (value === null) return 'Unavailable';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumber(value: number | null, fractionDigits = 2) {
  if (value === null) return 'Unavailable';
  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

function formatMonthYear(date: string) {
  const parsed = new Date(`${date}-01T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(parsed);
}

function formatMoney(value: number | null) {
  if (value === null) return 'Unavailable';
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseSalaryInput(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatDisplayDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

function DataCard({
  title,
  value,
  detail,
  tone = 'default',
}: {
  title: string;
  value: string;
  detail?: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-[var(--color-foreground)]';

  return (
    <Card shadow="sm" radius="lg" className="border border-[var(--color-border)]">
      <CardHeader className="flex items-center justify-between gap-4">
        <span className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
          {title}
        </span>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
        {detail && <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{detail}</p>}
      </CardBody>
    </Card>
  );
}

function MealDealTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const dateLabel =
    typeof label === 'string'
      ? new Intl.DateTimeFormat('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).format(new Date(label))
      : String(label ?? '');

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-lg backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{dateLabel}</p>
      <div className="mt-3 space-y-2">
        {payload.map((entry) => {
          const value = typeof entry.value === 'number' ? formatCurrency(entry.value) : 'Unavailable';
          return (
            <div key={String(entry.dataKey)} className="flex items-center justify-between gap-6">
              <span className="inline-flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: String(entry.color ?? 'currentColor') }}
                />
                {String(entry.name ?? entry.dataKey)}
              </span>
              <span className="text-sm font-semibold text-[var(--color-foreground)]">{value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MealDealHistoryChart({
  history,
  currentSnapshot,
}: {
  history: MealDealHistoryPoint[];
  currentSnapshot: MealDealSnapshot;
}) {
  const [historyRange, setHistoryRange] = useState<HistoryRange>('20y');
  const points = [...history].sort((a, b) => a.date.localeCompare(b.date));

  const chartData = useMemo(() => {
    const now = new Date();
    const rangeYears: Record<Exclude<HistoryRange, 'all'>, number> = {
      '1y': 1,
      '5y': 5,
      '10y': 10,
      '20y': 20,
    };

    const cutoff =
      historyRange === 'all'
        ? null
        : new Date(now.getFullYear() - rangeYears[historyRange], now.getMonth(), now.getDate());

    const basePoints = points
      .filter((point) => {
        if (!cutoff) return true;
        return new Date(point.date) >= cutoff;
      })
      .map((point) => ({
        date: point.date,
        Clubcard: point.clubcardPrice,
        Regular: point.regularPrice,
      }));

    const currentDate = currentSnapshot.fetchedAt ? currentSnapshot.fetchedAt.slice(0, 10) : '';
    const hasCurrentValues =
      currentSnapshot.clubcardPrice !== null || currentSnapshot.regularPrice !== null;
    const currentPoint =
      hasCurrentValues && currentDate
        ? {
            date: currentDate,
            Clubcard: currentSnapshot.clubcardPrice,
            Regular: currentSnapshot.regularPrice,
          }
        : null;

    if (!currentPoint) {
      return basePoints;
    }

    const deduped = new Map(basePoints.map((point) => [point.date, point]));
    deduped.set(currentPoint.date, currentPoint);
    return Array.from(deduped.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [historyRange, points]);

  if (points.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-sm text-[var(--color-muted-foreground)]">
        No meal-deal history yet.
      </div>
    );
  }

  const rangeButtons: { label: string; value: HistoryRange }[] = [
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
    { label: '10Y', value: '10y' },
    { label: '20Y', value: '20y' },
    { label: 'All', value: 'all' },
  ];

  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];
  const latestLabel =
    lastPoint?.date && currentSnapshot.fetchedAt.slice(0, 10) === lastPoint.date
      ? `Latest tracked ${formatDisplayDate(lastPoint.date)}`
      : lastPoint?.date
        ? `Latest historical ${formatDisplayDate(lastPoint.date)}`
        : 'Latest';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted-foreground)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            Clubcard
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            Regular
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            Seeded from known price changes and then kept up to date by the scraper.
          </span>
          <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1">
            {rangeButtons.map((button) => {
              const active = historyRange === button.value;
              return (
                <button
                  key={button.value}
                  type="button"
                  onClick={() => setHistoryRange(button.value)}
                  className={[
                    'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors',
                    active
                      ? 'bg-[var(--color-foreground)] text-[var(--color-background)]'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                  ].join(' ')}
                >
                  {button.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 md:p-5 shadow-sm">
        <AreaChart
          className="h-80"
          data={chartData}
          index="date"
          categories={['Clubcard', 'Regular']}
          colors={['cyan', 'amber']}
          valueFormatter={formatCurrency}
          showLegend={false}
          showGridLines
          showYAxis
          showXAxis={false}
          autoMinValue
          connectNulls
          curveType="monotone"
          showGradient
          yAxisWidth={56}
          startEndOnly
          customTooltip={MealDealTooltip}
        />
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
          <span>{firstPoint?.date ? formatDisplayDate(firstPoint.date) : 'Earlier'}</span>
          <span>
            Last {historyRange === 'all' ? 'all available' : historyRange.toUpperCase()} · {latestLabel}
          </span>
          <span>{lastPoint?.date ? formatDisplayDate(lastPoint.date) : 'Latest'}</span>
        </div>
      </div>
    </div>
  );
}

export default function CostOfLivingClient() {
  const [historicalSalary, setHistoricalSalary] = useState('100000');
  const [selectedLocation, setSelectedLocation] = useState<'central-london' | 'west-london' | 'edinburgh'>(
    'central-london'
  );

  const { data, error, isValidating, mutate } = useSWR<CostOfLivingPayload>(
    '/api/cost-of-living',
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      console.warn('[CostOfLiving] Load failed:', error);
    }
  }, [error]);

  const inflation = data?.inflation ?? {
    index: null,
    rate12m: null,
    period: null,
    source: { name: 'Unavailable', url: '#', fetchedAt: '' },
    history: [],
  };
  const salaries = data?.salaries ?? {
    dataset: 'ASHE Table 7',
    downloadUrl: null,
    source: { name: 'Unavailable', url: '#', fetchedAt: '' },
    notes: '',
  };
  const mealDeal = data?.mealDeal ?? {
    retailer: 'Tesco',
    clubcardPrice: null,
    regularPrice: null,
    source: { name: 'Unavailable', url: '#', fetchedAt: '' },
    notes: '',
    history: [],
  };
  const apiStatus = data?.apiStatus ?? {
    inflation: false,
    salaries: false,
    mealDeals: false,
  };
  const _meta = data?._meta ?? {
    cold: false,
    stale: false,
    local: true,
    partial: false,
    warnings: [],
  };

  const sourceStatus = [
    { label: 'Inflation', ok: apiStatus.inflation },
    { label: 'Salaries', ok: apiStatus.salaries },
    { label: 'Meal deals', ok: apiStatus.mealDeals },
  ];

  const historicalSalaryValue = parseSalaryInput(historicalSalary);
  const inflationHistory = inflation.history ?? [];
  const latestInflationPoint = inflationHistory[inflationHistory.length - 1] ?? null;
  const availableYears = Array.from(
    new Set(inflationHistory.map((point) => point.date.slice(0, 4)))
  ).sort((a, b) => b.localeCompare(a));
  const defaultPeriod = latestInflationPoint?.date ?? '';
  const [selectedSalaryYear, setSelectedSalaryYear] = useState(defaultPeriod.slice(0, 4) || '2026');
  const [selectedSalaryMonth, setSelectedSalaryMonth] = useState(defaultPeriod.slice(5, 7) || '06');

  useEffect(() => {
    if (!latestInflationPoint) {
      return;
    }

    const [year, month] = latestInflationPoint.date.split('-');
    setSelectedSalaryYear((current) => (current ? current : year));
    setSelectedSalaryMonth((current) => (current ? current : month));
  }, [latestInflationPoint]);

  const monthOptions = inflationHistory
    .filter((point) => point.date.startsWith(`${selectedSalaryYear}-`))
    .map((point) => ({
      value: point.date.slice(5, 7),
      label: formatMonthYear(point.date).split(' ')[0],
    }));

  useEffect(() => {
    if (!monthOptions.some((option) => option.value === selectedSalaryMonth) && monthOptions[0]) {
      setSelectedSalaryMonth(monthOptions[0].value);
    }
  }, [monthOptions, selectedSalaryMonth]);

  const selectedInflationPoint =
    inflationHistory.find((point) => point.date === `${selectedSalaryYear}-${selectedSalaryMonth}`) ?? null;
  const inflationMultiplier =
    latestInflationPoint && selectedInflationPoint && selectedInflationPoint.index !== 0
      ? latestInflationPoint.index / selectedInflationPoint.index
      : null;

  const benchmarkRows = [
    {
      key: 'central-london' as const,
      label: 'Central London',
      value: 78000,
      detail: 'Working benchmark for the City and West End salary band.',
    },
    {
      key: 'west-london' as const,
      label: 'West London',
      value: 70000,
      detail: 'Useful as a west London benchmark for hybrid and office-based work.',
    },
    {
      key: 'edinburgh' as const,
      label: 'Edinburgh',
      value: 62000,
      detail: 'A lower-cost comparator for a broader UK market view.',
    },
  ];
  const activeBenchmark =
    benchmarkRows.find((row) => row.key === selectedLocation) ?? benchmarkRows[0];

  const inflatedHistoricalSalary =
    inflationMultiplier === null ? null : historicalSalaryValue * inflationMultiplier;

  if (error) {
    return (
      <main className="min-h-screen px-6 md:px-12 lg:px-24 py-16 max-w-6xl mx-auto">
        <Alert
          title="Could not load cost-of-living data"
          description="The page is up, but the live sources are temporarily unavailable. Try again in a moment."
          color="danger"
          variant="flat"
          radius="lg"
          endContent={
            <Button size="sm" variant="flat" onPress={() => mutate()}>
              Retry
            </Button>
          }
        />
      </main>
    );
  }

  if (!data || isValidating) {
    return (
      <main className="min-h-screen px-6 md:px-12 lg:px-24 py-16 max-w-6xl mx-auto">
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-sm text-[var(--color-muted-foreground)]">
          <Spinner size="sm" color="primary" />
          <span>Loading cost-of-living data…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 md:px-12 lg:px-24 py-16 max-w-6xl mx-auto space-y-10">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4 max-w-3xl">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
              Cost of living
            </p>
            <h1 className="text-4xl md:text-5xl font-semibold text-balance">
              Live signals for salary, inflation, and everyday prices
            </h1>
            <p className="text-[var(--color-muted-foreground)] leading-relaxed max-w-2xl">
              A small dashboard for tracking the signals that matter most when talking about pay,
              purchasing power, and day-to-day costs.
            </p>
          </div>

          <Button
            onPress={() => mutate()}
            variant="flat"
            className="border border-[var(--color-border)] bg-[var(--color-card)]"
            startContent={<RefreshArrow className="h-4 w-4" />}
          >
            Refresh
          </Button>
        </div>

        {(_meta.partial || _meta.stale) && (
          <Alert
            color={_meta.stale ? 'warning' : 'default'}
            variant="flat"
            title={_meta.stale ? 'Showing cached data' : 'Partial data loaded'}
            description={
              _meta.warnings.length > 0
                ? _meta.warnings.join(' · ')
                : 'One or more live sources could not be fetched right now.'
            }
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <DataCard
            title="Inflation"
            value={
              inflation.index === null ? 'Unavailable' : `${formatNumber(inflation.index, 2)}`
            }
            detail={
              inflation.rate12m === null
                ? 'Latest CPIH snapshot is not available right now.'
                : `${formatNumber(inflation.rate12m, 2)}% year on year`
            }
            tone={apiStatus.inflation ? 'success' : 'warning'}
          />

          <DataCard
            title="Salary feed"
            value={apiStatus.salaries ? 'Available' : 'Unavailable'}
            detail={
              salaries.downloadUrl
                ? 'ONS ASHE Table 7 download is reachable for building location-based salary views.'
                : 'The salary source is currently unavailable.'
            }
            tone={apiStatus.salaries ? 'success' : 'warning'}
          />

          <DataCard
            title="Meal deal"
            value={
              mealDeal.clubcardPrice === null && mealDeal.regularPrice === null
                ? 'Unavailable'
                : `${formatCurrency(mealDeal.clubcardPrice)} / ${formatCurrency(mealDeal.regularPrice)}`
            }
            detail={`Tracked from ${mealDeal.retailer} as a lightweight everyday-cost signal.`}
            tone={apiStatus.mealDeals ? 'success' : 'warning'}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card shadow="sm" radius="lg" className="lg:col-span-5 border border-[var(--color-border)]">
          <CardHeader className="flex items-center gap-3">
            <div className="space-y-1">
              <p className="font-semibold">Inflation calculator</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                What a salary would need to be today to hold the same buying power.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="block space-y-2 md:col-span-1">
                <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Salary
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={historicalSalary}
                  onChange={(event) => setHistoricalSalary(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Year earned
                </span>
                <select
                  value={selectedSalaryYear}
                  onChange={(event) => setSelectedSalaryYear(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Month earned
                </span>
                <select
                  value={selectedSalaryMonth}
                  onChange={(event) => setSelectedSalaryMonth(event.target.value)}
                  className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 space-y-2">
              <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                Inflation-adjusted today
              </p>
              <p className="text-3xl font-semibold">
                {inflatedHistoricalSalary === null ? 'Unavailable' : formatMoney(inflatedHistoricalSalary)}
              </p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {inflationMultiplier === null || !selectedInflationPoint || !latestInflationPoint
                  ? 'The CPIH history is unavailable right now, so this calculation is paused.'
                  : `Adjusted from ${formatMonthYear(selectedInflationPoint.date)} to ${formatMonthYear(latestInflationPoint.date)} using the CPIH index series.`}
              </p>
            </div>
          </CardBody>
        </Card>

        <Card shadow="sm" radius="lg" className="lg:col-span-7 border border-[var(--color-border)]">
          <CardHeader className="flex items-center gap-3">
            <div className="space-y-1">
              <p className="font-semibold">Location snapshots</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Keep these as working benchmarks until the salary extractor lands.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-2">
              {benchmarkRows.map((row) => {
                const active = row.key === activeBenchmark.key;
                return (
                  <button
                    key={row.key}
                    type="button"
                    onClick={() => setSelectedLocation(row.key)}
                    className={[
                      'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[var(--color-foreground)] text-[var(--color-background)]'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                    ].join(' ')}
                  >
                    {row.label}
                  </button>
                );
              })}
            </div>

            <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-5 space-y-4">
              <div className="space-y-2">
                <p className="text-lg font-semibold">{activeBenchmark.label}</p>
                <p className="text-sm text-[var(--color-muted-foreground)]">{activeBenchmark.detail}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                  <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                    Annual salary
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {formatMoney(activeBenchmark.value)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                  <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                    Monthly
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {formatMoney(activeBenchmark.value / 12)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                  <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                    Today equivalent
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {inflationMultiplier === null
                      ? 'Unavailable'
                      : formatMoney(activeBenchmark.value * inflationMultiplier)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                  Versus your adjusted salary
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">
                  {inflatedHistoricalSalary === null
                    ? 'Unavailable'
                    : `${inflatedHistoricalSalary >= activeBenchmark.value ? '+' : '-'}${formatMoney(
                        Math.abs(inflatedHistoricalSalary - activeBenchmark.value)
                      )}`}
                </p>
                <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                  Compares your selected salary period against the current benchmark for {activeBenchmark.label}.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card shadow="sm" radius="lg" className="border border-[var(--color-border)]">
          <CardHeader className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-[var(--color-accent)]" />
            <div>
              <p className="font-semibold">What’s live</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                The page keeps working even when one source is down.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-[var(--color-muted-foreground)]">
            <p>
              Inflation is pulled from the ONS CPIH feed, salary availability from ASHE Table 7,
              and meal-deal pricing from a public retailer page.
            </p>
            <div className="flex flex-wrap gap-2">
              {sourceStatus.map(({ label, ok }) => (
                <Chip key={label} color={ok ? 'success' : 'warning'} variant="flat" size="sm">
                  {label}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card shadow="sm" radius="lg" className="border border-[var(--color-border)]">
          <CardHeader>
            <div>
              <p className="font-semibold">Sources</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Snapshots used to power the page and the future calculator.
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-4 text-sm">
            <div>
              <p className="font-medium">Inflation source</p>
              <a
                href={inflation.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] hover:underline break-all"
              >
                {inflation.source.name}
              </a>
            </div>
            <div>
              <p className="font-medium">Salary source</p>
              <a
                href={salaries.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] hover:underline break-all"
              >
                {salaries.source.name}
              </a>
            </div>
            <div>
              <p className="font-medium">Meal-deal source</p>
              <a
                href={mealDeal.source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] hover:underline break-all"
              >
                {mealDeal.source.name}
              </a>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
              Meal deal history
            </p>
            <h2 className="text-2xl font-semibold">Tesco meal deal over time</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Seeded from known price changes and then kept up to date by the scraper.
            </p>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md md:text-right">
            The trend line lets you compare Clubcard and regular pricing at a glance.
          </p>
        </div>

        <Card shadow="sm" radius="lg" className="border border-[var(--color-border)] overflow-hidden">
          <CardBody className="space-y-4">
            <MealDealHistoryChart
              history={mealDeal.history}
              currentSnapshot={{
                clubcardPrice: mealDeal.clubcardPrice,
                regularPrice: mealDeal.regularPrice,
                fetchedAt: mealDeal.source.fetchedAt,
              }}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Clubcard current
                </p>
                <p className="text-xl font-semibold">{formatCurrency(mealDeal.clubcardPrice)}</p>
                <p className="text-[var(--color-muted-foreground)]">Current tracked Tesco price.</p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                <p className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Regular current
                </p>
                <p className="text-xl font-semibold">{formatCurrency(mealDeal.regularPrice)}</p>
                <p className="text-[var(--color-muted-foreground)]">Non-Clubcard tracked Tesco price.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-3">Next step</h2>
        <p className="text-[var(--color-muted-foreground)] leading-relaxed max-w-3xl">
          This page is the foundation for comparing salary levels across places like central
          London, West London, and Edinburgh, then translating those against inflation so the
          salary-equivalent story is easy to read.
        </p>
      </section>
    </main>
  );
}
