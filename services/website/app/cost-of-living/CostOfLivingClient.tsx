'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Alert, Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';
import {
  Area,
  AreaChart as RechartsAreaChart,
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps, TooltipValueType } from 'recharts';
import { Activity } from '../components/icons';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { RefreshArrow } from '../components/icons/RefreshArrow';

type SourceSnapshot = {
  name: string;
  url: string;
  fetchedAt: string;
};

type SourceMode = 'live' | 'fallback' | 'unavailable';
type SalaryRole = 'all-employees' | 'software-engineer';

type SalaryBenchmark = {
  role: SalaryRole;
  key: 'central-london' | 'west-london' | 'edinburgh';
  label: string;
  locality: string;
  areaCode: string;
  annualMedian: number | null;
  sourceSheet: string;
  sourceDataset: string;
  notes: string;
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

type HistoryRange = '1y' | '5y' | '10y' | '20y' | '40y';

type MealDealSnapshot = {
  clubcardPrice: number | null;
  regularPrice: number | null;
  fetchedAt: string;
};

type ChartDatum = Record<string, string | number | null | undefined>;
type SalaryHistoryDatum = ChartDatum & {
  date: string;
  monthKey: string;
  'Your salary': number;
  'Inflation-adjusted salary': number;
};

type CustomTooltipProps = Pick<TooltipContentProps<TooltipValueType, string | number>, 'active' | 'label' | 'payload'>;

const FALLBACK_BENCHMARK: SalaryBenchmark = {
  role: 'all-employees',
  key: 'central-london',
  label: 'Central London',
  locality: 'Westminster',
  areaCode: 'E09000033',
  annualMedian: null,
  sourceSheet: 'Full-Time',
  sourceDataset: 'ASHE Table 7',
  notes: 'Representative benchmark unavailable right now.',
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

function formatPercent(value: number | null, fractionDigits = 1) {
  if (value === null) return 'Unavailable';
  return `${formatNumber(value, fractionDigits)}%`;
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

function monthKeyFromValue(value: string) {
  const match = value.match(/^(\d{4}-\d{2})/);
  return match ? match[1] : value;
}

function compareMonthKeys(left: string, right: string) {
  return left.localeCompare(right);
}

function enumerateMonthKeys(startMonth: string, endMonth: string) {
  const months: string[] = [];
  let [year, month] = startMonth.split('-').map(Number);
  const [endYear, endMonthNumber] = endMonth.split('-').map(Number);

  while (year < endYear || (year === endYear && month <= endMonthNumber)) {
    months.push(`${year}-${String(month).padStart(2, '0')}`);
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return months;
}

const CHART_COLOR_MAP: Record<string, string> = {
  cyan: '#06b6d4',
  rose: '#f43f5e',
  gray: '#71717a',
  emerald: '#10b981',
  amber: '#f59e0b',
};

function toChartColor(color: string) {
  return CHART_COLOR_MAP[color] ?? color;
}

function renderTooltip(
  CustomTooltip: ((props: CustomTooltipProps) => React.ReactNode) | undefined
): ((props: TooltipContentProps<TooltipValueType, string | number>) => React.ReactNode) | undefined {
  if (!CustomTooltip) {
    return undefined;
  }

  return ({ active, label, payload }: TooltipContentProps<TooltipValueType, string | number>) =>
    CustomTooltip({
      active,
      label,
      payload,
    });
}

function AreaChart({
  className,
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showGridLines,
  showYAxis,
  showXAxis,
  autoMinValue,
  connectNulls,
  curveType,
  showGradient,
  yAxisWidth,
  customTooltip,
}: {
  className?: string;
  data: ChartDatum[];
  index: string;
  categories: readonly string[];
  colors: string[];
  valueFormatter?: (value: number) => string;
  showGridLines?: boolean;
  showYAxis?: boolean;
  showXAxis?: boolean;
  autoMinValue?: boolean;
  connectNulls?: boolean;
  curveType?: 'monotone' | 'linear' | 'step';
  showGradient?: boolean;
  yAxisWidth?: number;
  customTooltip?: (props: CustomTooltipProps) => React.ReactNode;
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsAreaChart data={data}>
          {showGridLines && <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" vertical={false} />}
          <XAxis dataKey={index} hide={showXAxis === false} tickLine={false} axisLine={false} />
          {showYAxis && (
            <YAxis
              width={yAxisWidth ?? 56}
              tickLine={false}
              axisLine={false}
              domain={autoMinValue ? ['auto', 'auto'] : undefined}
              tickFormatter={valueFormatter}
            />
          )}
          <RechartsTooltip content={renderTooltip(customTooltip)} />
          {showGradient &&
            categories.map((category, idx) => {
              const color = toChartColor(colors[idx] ?? colors[0] ?? '#06b6d4');
              return (
                <defs key={category}>
                  <linearGradient id={`gradient-${category}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={color} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
              );
            })}
          {categories.map((category, idx) => {
            const color = toChartColor(colors[idx] ?? colors[0] ?? '#06b6d4');
            return (
              <Area
                key={category}
                type={curveType ?? 'monotone'}
                dataKey={category}
                connectNulls={connectNulls}
                stroke={color}
                fill={showGradient ? `url(#gradient-${category})` : color}
                fillOpacity={showGradient ? 1 : 0.18}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function LineChart({
  className,
  data,
  index,
  categories,
  colors,
  valueFormatter,
  showGridLines,
  showYAxis,
  showXAxis,
  autoMinValue,
  connectNulls,
  curveType,
  yAxisWidth,
  customTooltip,
}: {
  className?: string;
  data: ChartDatum[];
  index: string;
  categories: readonly string[];
  colors: string[];
  valueFormatter?: (value: number) => string;
  showGridLines?: boolean;
  showYAxis?: boolean;
  showXAxis?: boolean;
  autoMinValue?: boolean;
  connectNulls?: boolean;
  curveType?: 'monotone' | 'linear' | 'step';
  yAxisWidth?: number;
  customTooltip?: (props: CustomTooltipProps) => React.ReactNode;
}) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data}>
          {showGridLines && <CartesianGrid stroke="rgba(148, 163, 184, 0.18)" vertical={false} />}
          <XAxis dataKey={index} hide={showXAxis === false} tickLine={false} axisLine={false} />
          {showYAxis && (
            <YAxis
              width={yAxisWidth ?? 72}
              tickLine={false}
              axisLine={false}
              domain={autoMinValue ? ['auto', 'auto'] : undefined}
              tickFormatter={valueFormatter}
            />
          )}
          <RechartsTooltip content={renderTooltip(customTooltip)} />
          {categories.map((category, idx) => (
            <Line
              key={category}
              type={curveType ?? 'monotone'}
              dataKey={category}
              connectNulls={connectNulls}
              stroke={toChartColor(colors[idx] ?? colors[0] ?? '#71717a')}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

function DataCard({
  title,
  value,
  detail,
  source,
  fetchedAt,
  tone = 'default',
}: {
  title: string;
  value: string;
  detail?: string;
  source?: string;
  fetchedAt?: string;
  tone?: 'default' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-600 dark:text-emerald-400'
      : tone === 'warning'
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-[var(--color-foreground)]';

  return (
    <Card shadow="sm" radius="lg" className="site-surface rounded-[1.75rem]">
      <CardHeader className="flex items-center justify-between gap-4">
        <span className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
          {title}
        </span>
      </CardHeader>
      <CardBody className="space-y-2">
        <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
        {detail && <p className="text-sm text-[var(--color-muted-foreground)] leading-relaxed">{detail}</p>}
        {source && <p className="text-xs text-[var(--color-muted)]">{source}</p>}
        {fetchedAt && <p className="text-xs text-[var(--color-muted)]">Updated {formatDisplayDate(fetchedAt)}</p>}
      </CardBody>
    </Card>
  );
}

function formatSourceState(mode: SourceMode) {
  switch (mode) {
    case 'live':
      return 'Live';
    case 'fallback':
      return 'Fallback';
    default:
      return 'Unavailable';
  }
}

function toneFromSourceState(mode: SourceMode): 'success' | 'warning' {
  return mode === 'live' ? 'success' : 'warning';
}

function MealDealTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload as
    | {
        monthKey?: string;
        clubcardRaw?: number | null;
        cpiRaw?: number | null;
      }
    | undefined;

  const dateLabel =
    point?.monthKey
      ? formatMonthYear(point.monthKey)
      : typeof label === 'string'
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
          const value =
            typeof entry.value === 'number' ? `${formatNumber(entry.value, 1)} index` : 'Unavailable';
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
        {point && (
          <>
            <div className="mt-3 h-px bg-[var(--color-border)]" />
            <div className="flex items-center justify-between gap-6 text-sm">
              <span className="text-[var(--color-muted-foreground)]">Clubcard price</span>
              <span className="font-semibold text-[var(--color-foreground)]">
                {formatCurrency(point.clubcardRaw ?? null)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-6 text-sm">
              <span className="text-[var(--color-muted-foreground)]">CPI level</span>
              <span className="font-semibold text-[var(--color-foreground)]">
                {formatNumber(point.cpiRaw ?? null, 1)}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MealDealHistoryChart({
  history,
  currentSnapshot,
  inflationHistory,
}: {
  history: MealDealHistoryPoint[];
  currentSnapshot: MealDealSnapshot;
  inflationHistory: InflationHistoryPoint[];
}) {
  const [historyRange, setHistoryRange] = useState<HistoryRange>('40y');
  const points = [...history].sort((a, b) => a.date.localeCompare(b.date));

  const chartData = useMemo(() => {
    const now = new Date();
    const rangeYears: Record<HistoryRange, number> = {
      '1y': 1,
      '5y': 5,
      '10y': 10,
      '20y': 20,
      '40y': 40,
    };

    const cutoff = new Date(
      now.getFullYear() - rangeYears[historyRange],
      now.getMonth(),
      now.getDate()
    );

    const mealEvents = points
      .map((point) => ({
        monthKey: monthKeyFromValue(point.date),
        clubcardPrice: point.clubcardPrice,
      }))
      .filter((point) => point.clubcardPrice !== null);

    const currentMonthKey = currentSnapshot.fetchedAt
      ? monthKeyFromValue(currentSnapshot.fetchedAt.slice(0, 10))
      : '';
    if (currentMonthKey && currentSnapshot.clubcardPrice !== null) {
      mealEvents.push({
        monthKey: currentMonthKey,
        clubcardPrice: currentSnapshot.clubcardPrice,
      });
    }

    const dedupedMealEvents = Array.from(
      new Map(mealEvents.map((point) => [point.monthKey, point])).values()
    ).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    const cpiLookup = new Map(inflationHistory.map((point) => [point.date, point.index]));
    const cpiMonths = inflationHistory.map((point) => point.date).sort(compareMonthKeys);
    const mealMonths = dedupedMealEvents.map((point) => point.monthKey).sort(compareMonthKeys);

    if (cpiMonths.length === 0) {
      return [];
    }

    const earliestCpiMonth = cpiMonths[0];
    const earliestMealMonth = mealMonths[0] ?? null;
    const latestCpiMonth = cpiMonths[cpiMonths.length - 1];
    const latestMealMonth = mealMonths[mealMonths.length - 1] ?? latestCpiMonth;
    const overallEnd =
      compareMonthKeys(latestMealMonth, latestCpiMonth) > 0 ? latestMealMonth : latestCpiMonth;
    const rangeStartMonth = monthKeyFromValue(cutoff.toISOString().slice(0, 10));
    const filteredStart =
      compareMonthKeys(rangeStartMonth, earliestCpiMonth) > 0 ? rangeStartMonth : earliestCpiMonth;
    const months = enumerateMonthKeys(filteredStart, overallEnd);
    let latestClubcard: number | null = null;
    let mealIndex = 0;
    let clubcardBase: number | null = null;
    let cpiBase: number | null = null;

    return months
      .map((monthKey) => {
        while (mealIndex < dedupedMealEvents.length && dedupedMealEvents[mealIndex].monthKey <= monthKey) {
          latestClubcard = dedupedMealEvents[mealIndex].clubcardPrice;
          mealIndex += 1;
        }

        const cpiRaw = cpiLookup.get(monthKey) ?? null;
        if (cpiBase === null && cpiRaw !== null) {
          cpiBase = cpiRaw;
        }

        const clubcardRaw =
          earliestMealMonth !== null && compareMonthKeys(monthKey, earliestMealMonth) >= 0
            ? latestClubcard
            : null;
        if (clubcardBase === null && clubcardRaw !== null) {
          clubcardBase = clubcardRaw;
        }

        return {
          date: `${monthKey}-01`,
          monthKey,
          Clubcard:
            clubcardRaw !== null && clubcardBase !== null && clubcardBase !== 0
              ? (clubcardRaw / clubcardBase) * 100
              : null,
          CPI:
            cpiRaw !== null && cpiBase !== null && cpiBase !== 0 ? (cpiRaw / cpiBase) * 100 : null,
          clubcardRaw,
          cpiRaw,
        };
      })
      .filter((point) => point.Clubcard !== null || point.CPI !== null);
  }, [currentSnapshot.clubcardPrice, currentSnapshot.fetchedAt, historyRange, inflationHistory, points]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-sm text-[var(--color-muted-foreground)]">
        Clubcard and CPI comparison is unavailable right now.
      </div>
    );
  }

  const rangeButtons: { label: string; value: HistoryRange }[] = [
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
    { label: '10Y', value: '10y' },
    { label: '20Y', value: '20y' },
    { label: '40Y', value: '40y' },
  ];
  const firstPoint = chartData[0];
  const lastPoint = chartData[chartData.length - 1];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted-foreground)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" />
            Clubcard
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            CPI
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            CPI from Jan 1988
          </span>
          <span className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            Tesco from Feb 2022
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
          categories={['Clubcard', 'CPI']}
          colors={['cyan', 'rose']}
          valueFormatter={(value: number) => `${formatNumber(value, 1)} index`}
          showGridLines
          showYAxis
          showXAxis={false}
          autoMinValue
          connectNulls
          curveType="monotone"
          showGradient
          yAxisWidth={56}
          customTooltip={MealDealTooltip}
        />
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
          <span>{firstPoint?.monthKey ? formatMonthYear(firstPoint.monthKey) : 'Earlier'}</span>
          <span>Last {historyRange.toUpperCase()} · Each series starts at 100 from its own visible baseline</span>
          <span>{lastPoint?.monthKey ? formatMonthYear(lastPoint.monthKey) : 'Latest'}</span>
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          Clubcard and CPI are normalized independently from the first visible month so you can
          compare rate of change rather than absolute units.
        </p>
      </div>
    </div>
  );
}

function SalaryTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const point = payload[0]?.payload as { monthKey?: string } | undefined;
  const dateLabel = point?.monthKey ? formatMonthYear(point.monthKey) : String(label ?? '');

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-lg backdrop-blur">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-muted)]">{dateLabel}</p>
      <div className="mt-3 space-y-2">
        {payload.map((entry) => {
          const value =
            typeof entry.value === 'number' ? formatCurrency(entry.value) : 'Unavailable';
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

function SalaryHistoryChart({
  inflationHistory,
  salaryValue,
  salaryStartMonth,
  benchmarkLabel,
  benchmarkValue,
}: {
  inflationHistory: InflationHistoryPoint[];
  salaryValue: number;
  salaryStartMonth: string | null;
  benchmarkLabel: string;
  benchmarkValue: number | null;
}) {
  const [historyRange, setHistoryRange] = useState<HistoryRange>('10y');

  const chartData = useMemo(() => {
    if (!salaryStartMonth || salaryValue <= 0) {
      return [];
    }

    const rangeYears: Record<HistoryRange, number> = {
      '1y': 1,
      '5y': 5,
      '10y': 10,
      '20y': 20,
      '40y': 40,
    };
    const cpiLookup = new Map(inflationHistory.map((point) => [point.date, point.index]));
    const salaryBaseIndex = cpiLookup.get(salaryStartMonth) ?? null;
    if (salaryBaseIndex === null || salaryBaseIndex === 0) {
      return [];
    }

    const now = new Date();
    const cutoff = new Date(
      now.getFullYear() - rangeYears[historyRange],
      now.getMonth(),
      now.getDate()
    );
    const rangeStartMonth = monthKeyFromValue(cutoff.toISOString().slice(0, 10));
    const firstMonth =
      compareMonthKeys(rangeStartMonth, salaryStartMonth) > 0 ? rangeStartMonth : salaryStartMonth;
    const lastMonth = inflationHistory[inflationHistory.length - 1]?.date ?? salaryStartMonth;
    if (compareMonthKeys(firstMonth, lastMonth) > 0) {
      return [];
    }

    return enumerateMonthKeys(firstMonth, lastMonth)
      .map((monthKey) => {
        const cpiIndex = cpiLookup.get(monthKey);
        if (cpiIndex === undefined) {
          return null;
        }

        const point: SalaryHistoryDatum = {
          date: `${monthKey}-01`,
          monthKey,
          'Your salary': salaryValue,
          'Inflation-adjusted salary': salaryValue * (cpiIndex / salaryBaseIndex),
          [benchmarkLabel]: benchmarkValue,
        };

        return point;
      })
      .filter((point): point is SalaryHistoryDatum => point !== null);
  }, [benchmarkLabel, benchmarkValue, historyRange, inflationHistory, salaryStartMonth, salaryValue]);

  if (chartData.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-sm text-[var(--color-muted-foreground)]">
        Salary history comparison is unavailable right now.
      </div>
    );
  }

  const rangeButtons: { label: string; value: HistoryRange }[] = [
    { label: '1Y', value: '1y' },
    { label: '5Y', value: '5y' },
    { label: '10Y', value: '10y' },
    { label: '20Y', value: '20y' },
    { label: '40Y', value: '40y' },
  ];
  const firstPoint = chartData[0] as { monthKey?: string };
  const lastPoint = chartData[chartData.length - 1] as { monthKey?: string };
  const categories =
    benchmarkValue === null
      ? (['Your salary', 'Inflation-adjusted salary'] as const)
      : (['Your salary', 'Inflation-adjusted salary', benchmarkLabel] as const);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted-foreground)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
            Your salary
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Inflation-adjusted salary
          </span>
          {benchmarkValue !== null && (
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              {benchmarkLabel}
            </span>
          )}
        </div>
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

      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 md:p-5 shadow-sm">
        <LineChart
          className="h-80"
          data={chartData}
          index="date"
          categories={[...categories]}
          colors={benchmarkValue === null ? ['gray', 'emerald'] : ['gray', 'emerald', 'amber']}
          valueFormatter={(value: number) => formatCurrency(value)}
          showGridLines
          showYAxis
          showXAxis={false}
          autoMinValue
          connectNulls
          curveType="monotone"
          yAxisWidth={72}
          customTooltip={SalaryTooltip}
        />
        <div className="mt-3 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
          <span>{firstPoint?.monthKey ? formatMonthYear(firstPoint.monthKey) : 'Earlier'}</span>
          <span>Last {historyRange.toUpperCase()} · Actual GBP values</span>
          <span>{lastPoint?.monthKey ? formatMonthYear(lastPoint.monthKey) : 'Latest'}</span>
        </div>
        <p className="mt-3 text-sm text-[var(--color-muted-foreground)]">
          Your salary stays flat from the month you selected. The inflation-adjusted line shows
          what that salary would need to become over time to preserve the same buying power. The
          benchmark line is the current selected location benchmark, shown as a horizontal reference.
        </p>
      </div>
    </div>
  );
}

export default function CostOfLivingClient() {
  const [historicalSalary, setHistoricalSalary] = useState('100000');
  const [selectedRole, setSelectedRole] = useState<SalaryRole>('all-employees');
  const [selectedLocation, setSelectedLocation] = useState<'central-london' | 'west-london' | 'edinburgh'>(
    'central-london'
  );
  const [submittedSalaryAnalysis, setSubmittedSalaryAnalysis] = useState<{
    salary: number;
    period: string;
  } | null>(null);

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
    benchmarks: [],
  };
  const mealDeal = data?.mealDeal ?? {
    retailer: 'Tesco',
    clubcardPrice: null,
    regularPrice: null,
    source: { name: 'Unavailable', url: '#', fetchedAt: '' },
    notes: '',
    history: [],
  };
  const sourceStates = data?.sourceStatus ?? {
    inflation: 'unavailable' as SourceMode,
    salaries: 'unavailable' as SourceMode,
    mealDeals: 'unavailable' as SourceMode,
  };
  const _meta = data?._meta ?? {
    cold: false,
    stale: false,
    local: true,
    partial: false,
    warnings: [],
  };

  const sourceHealthItems = [
    { label: 'Inflation', mode: sourceStates.inflation },
    { label: 'Salaries', mode: sourceStates.salaries },
    { label: 'Meal deals', mode: sourceStates.mealDeals },
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
  const selectedSalaryPeriod = `${selectedSalaryYear}-${selectedSalaryMonth}`;
  const submittedInflationPoint =
    submittedSalaryAnalysis
      ? inflationHistory.find((point) => point.date === submittedSalaryAnalysis.period) ?? null
      : null;
  const submittedInflationMultiplier =
    latestInflationPoint && submittedInflationPoint && submittedInflationPoint.index !== 0
      ? latestInflationPoint.index / submittedInflationPoint.index
      : null;

  const benchmarkRows = salaries.benchmarks.filter((row) => {
    if (row.role !== selectedRole) {
      return false;
    }

    if (selectedRole === 'software-engineer' && row.key === 'west-london') {
      return false;
    }

    return true;
  });
  const activeBenchmark =
    benchmarkRows.find((row) => row.key === selectedLocation) ?? benchmarkRows[0] ?? FALLBACK_BENCHMARK;
  const roleOptions: Array<{ key: SalaryRole; label: string }> = [
    { key: 'all-employees', label: 'All employees' },
    { key: 'software-engineer', label: 'Software engineer' },
  ];

  useEffect(() => {
    if (!benchmarkRows.some((row) => row.key === selectedLocation) && benchmarkRows[0]) {
      setSelectedLocation(benchmarkRows[0].key);
    }
  }, [benchmarkRows, selectedLocation]);

  const inflatedHistoricalSalary =
    inflationMultiplier === null ? null : historicalSalaryValue * inflationMultiplier;
  const submittedAdjustedSalary =
    submittedSalaryAnalysis && submittedInflationMultiplier !== null
      ? submittedSalaryAnalysis.salary * submittedInflationMultiplier
      : null;
  const salaryAnalysisReady = submittedSalaryAnalysis !== null && submittedInflationPoint !== null;
  const salaryAnalysisStale =
    submittedSalaryAnalysis !== null &&
    (submittedSalaryAnalysis.salary !== historicalSalaryValue ||
      submittedSalaryAnalysis.period !== selectedSalaryPeriod);
  const submittedSalaryPeriodLabel = submittedInflationPoint
    ? formatMonthYear(submittedInflationPoint.date)
    : null;
  const latestInflationPeriodLabel = latestInflationPoint
    ? formatMonthYear(latestInflationPoint.date)
    : null;
  const mealDealStartPoint =
    [...mealDeal.history]
      .filter((point) => point.clubcardPrice !== null)
      .sort((a, b) => a.date.localeCompare(b.date))[0] ?? null;
  const mealDealPercentChange =
    mealDealStartPoint?.clubcardPrice && mealDeal.clubcardPrice
      ? ((mealDeal.clubcardPrice - mealDealStartPoint.clubcardPrice) / mealDealStartPoint.clubcardPrice) * 100
      : null;
  const salaryRequiredGrowthPct =
    submittedSalaryAnalysis && submittedAdjustedSalary !== null
      ? ((submittedAdjustedSalary - submittedSalaryAnalysis.salary) / submittedSalaryAnalysis.salary) * 100
      : null;
  const benchmarkDelta =
    submittedAdjustedSalary !== null && activeBenchmark.annualMedian !== null
      ? submittedAdjustedSalary - activeBenchmark.annualMedian
      : null;
  const summaryParagraph = useMemo(() => {
    const roleLabel = selectedRole === 'software-engineer' ? 'software engineer' : 'all-employee';
    const salarySentence =
      submittedSalaryAnalysis &&
      submittedSalaryPeriodLabel &&
      latestInflationPeriodLabel &&
      submittedAdjustedSalary !== null
        ? `A salary of ${formatMoney(submittedSalaryAnalysis.salary)} from ${submittedSalaryPeriodLabel} would need to be ${formatMoney(submittedAdjustedSalary)} by ${latestInflationPeriodLabel} to preserve the same buying power, a required increase of ${formatPercent(salaryRequiredGrowthPct)}.`
        : 'Salary purchasing-power adjustment is currently unavailable because the inflation history needed for that calculation is missing.';
    const benchmarkSentence =
      benchmarkDelta !== null && activeBenchmark.annualMedian !== null
        ? `Against the current ${activeBenchmark.label} ${roleLabel} benchmark of ${formatMoney(activeBenchmark.annualMedian)}, that leaves you ${benchmarkDelta >= 0 ? formatMoney(benchmarkDelta) : formatMoney(Math.abs(benchmarkDelta))} ${benchmarkDelta >= 0 ? 'above' : 'below'} the benchmark today.`
        : `The current ${activeBenchmark.label} ${roleLabel} benchmark is ${formatMoney(activeBenchmark.annualMedian)}.`;
    const mealDealSentence =
      mealDealStartPoint?.clubcardPrice !== null && mealDeal.clubcardPrice !== null
        ? `Over the same broader period, the Tesco Clubcard meal deal moved from ${formatCurrency(mealDealStartPoint.clubcardPrice)} in ${formatDisplayDate(mealDealStartPoint.date)} to ${formatCurrency(mealDeal.clubcardPrice)} now, a change of ${formatPercent(mealDealPercentChange)}.`
        : 'The Tesco meal-deal series is currently unavailable, so the everyday-cost comparison is paused.';

    return `${salarySentence} ${benchmarkSentence} ${mealDealSentence}`;
  }, [
    activeBenchmark.annualMedian,
    activeBenchmark.label,
    benchmarkDelta,
    latestInflationPeriodLabel,
    mealDeal.clubcardPrice,
    mealDealPercentChange,
    mealDealStartPoint,
    salaryRequiredGrowthPct,
    selectedRole,
    submittedAdjustedSalary,
    submittedSalaryAnalysis,
    submittedSalaryPeriodLabel,
  ]);

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
        <div className="py-20">
          <LoadingIndicator label="Loading cost-of-living data..." />
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
            title="Inflation source"
            value={formatSourceState(sourceStates.inflation)}
            detail={
              inflation.rate12m === null
                ? 'Monthly CPIH history for salary adjustment is unavailable right now.'
                : `Latest CPIH reading ${formatNumber(inflation.index, 2)} with ${formatNumber(inflation.rate12m, 2)}% year-on-year inflation.`
            }
            source={inflation.source.name}
            fetchedAt={inflation.source.fetchedAt}
            tone={toneFromSourceState(sourceStates.inflation)}
          />

              <DataCard
            title="Salary source"
            value={formatSourceState(sourceStates.salaries)}
            detail={
              salaries.downloadUrl
                ? 'ONS ASHE Table 7 and Table 15 are reachable for locality and software-engineer salary benchmarks.'
                : 'The salary source is currently unavailable.'
            }
            source={salaries.source.name}
            fetchedAt={salaries.source.fetchedAt}
            tone={toneFromSourceState(sourceStates.salaries)}
          />

          <DataCard
            title="Everyday price source"
            value={formatSourceState(sourceStates.mealDeals)}
            detail={
              mealDeal.clubcardPrice === null && mealDeal.regularPrice === null
                ? `Tracked from ${mealDeal.retailer} as a lightweight everyday-cost signal.`
                : `Current ${mealDeal.retailer} signal: ${formatCurrency(mealDeal.clubcardPrice)} Clubcard / ${formatCurrency(mealDeal.regularPrice)} regular.`
            }
            source={mealDeal.source.name}
            fetchedAt={mealDeal.source.fetchedAt}
            tone={toneFromSourceState(sourceStates.mealDeals)}
          />
        </div>
      </section>

      <section>
        <Card shadow="sm" radius="lg" className="site-surface rounded-[1.75rem]">
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onPress={() =>
                  setSubmittedSalaryAnalysis({
                    salary: historicalSalaryValue,
                    period: selectedSalaryPeriod,
                  })
                }
                variant="solid"
                color="primary"
                isDisabled={historicalSalaryValue <= 0 || selectedInflationPoint === null}
              >
                Generate salary analysis
              </Button>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                Generate the salary graph and written summary from the salary and date you selected.
              </p>
            </div>
            {salaryAnalysisStale && (
              <Alert
                color="warning"
                variant="flat"
                title="Inputs changed"
                description="Regenerate the salary analysis to update the salary graph and summary."
              />
            )}
          </CardBody>
        </Card>
      </section>

      <section>
        <Card shadow="sm" radius="lg" className="site-surface rounded-[1.75rem]">
          <CardHeader className="flex items-center gap-3">
            <div className="space-y-1">
              <p className="font-semibold">Location snapshots</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">
                {selectedRole === 'all-employees'
                  ? 'Representative local-authority medians from ONS ASHE Table 7 full-time annual pay.'
                  : 'Representative software-engineer medians from ONS ASHE Table 15 full-time annual pay.'}
              </p>
            </div>
          </CardHeader>
          <CardBody className="space-y-5">
            <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-2">
              {roleOptions.map((option) => {
                const active = option.key === selectedRole;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSelectedRole(option.key)}
                    className={[
                      'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[var(--color-foreground)] text-[var(--color-background)]'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                    ].join(' ')}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

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
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  {activeBenchmark.notes} Source locality: {activeBenchmark.locality}.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                  <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                    Annual salary
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {formatMoney(activeBenchmark.annualMedian)}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                  <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                    Monthly
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                    {activeBenchmark.annualMedian === null
                      ? 'Unavailable'
                      : formatMoney(activeBenchmark.annualMedian / 12)}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                <p className="text-[11px] uppercase tracking-widest text-[var(--color-muted)]">
                  Versus your adjusted salary
                </p>
                <p className="mt-2 text-lg font-semibold text-[var(--color-foreground)]">
                  {inflatedHistoricalSalary === null || activeBenchmark.annualMedian === null
                    ? 'Unavailable'
                    : `${inflatedHistoricalSalary >= activeBenchmark.annualMedian ? '+' : '-'}${formatMoney(
                        Math.abs(inflatedHistoricalSalary - activeBenchmark.annualMedian)
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
        <Card shadow="sm" radius="lg" className="site-surface rounded-[1.75rem]">
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
              Inflation is pulled from the ONS CPIH feed, salary benchmarks from ASHE Table 7 and
              ASHE Table 15, and meal-deal pricing from a public retailer page.
            </p>
            <div className="flex flex-wrap gap-2">
              {sourceHealthItems.map(({ label, mode }) => (
                <Chip
                  key={label}
                  color={mode === 'live' ? 'success' : 'warning'}
                  variant="flat"
                  size="sm"
                >
                  {label}: {formatSourceState(mode)}
                </Chip>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card shadow="sm" radius="lg" className="site-surface rounded-[1.75rem]">
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
            <h2 className="text-2xl font-semibold">Tesco meal deal vs CPI</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Clubcard meal-deal pricing compared with CPI on a normalized index basis.
            </p>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md md:text-right">
            CPI can stretch back to January 1988, while Tesco begins in February 2022 from known public price changes and ongoing snapshots.
          </p>
        </div>

        <Card shadow="sm" radius="lg" className="site-surface rounded-[1.75rem] overflow-hidden">
          <CardBody className="space-y-4">
            <MealDealHistoryChart
              history={mealDeal.history}
              currentSnapshot={{
                clubcardPrice: mealDeal.clubcardPrice,
                regularPrice: mealDeal.regularPrice,
                fetchedAt: mealDeal.source.fetchedAt,
              }}
              inflationHistory={inflation.history}
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
                  CPI current
                </p>
                <p className="text-xl font-semibold">{formatNumber(inflation.index, 1)}</p>
                <p className="text-[var(--color-muted-foreground)]">Latest tracked CPI level.</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-widest text-[var(--color-muted)]">
              Salary history
            </p>
            <h2 className="text-2xl font-semibold">Your salary vs inflation</h2>
            <p className="text-sm text-[var(--color-muted-foreground)]">
              Actual pay in pounds compared against the inflation-adjusted level needed to keep the same buying power.
            </p>
          </div>
          <p className="text-sm text-[var(--color-muted-foreground)] max-w-md md:text-right">
            The benchmark line uses the currently selected location snapshot as a horizontal reference rather than a full historical series.
          </p>
        </div>

        <Card shadow="sm" radius="lg" className="site-surface rounded-[1.75rem] overflow-hidden">
          <CardBody className="space-y-4">
            {salaryAnalysisReady && submittedSalaryAnalysis ? (
              <SalaryHistoryChart
                inflationHistory={inflation.history}
                salaryValue={submittedSalaryAnalysis.salary}
                salaryStartMonth={submittedInflationPoint?.date ?? null}
                benchmarkLabel={`${activeBenchmark.label} benchmark`}
                benchmarkValue={activeBenchmark.annualMedian}
              />
            ) : (
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-6 text-sm text-[var(--color-muted-foreground)]">
                Enter your salary, year obtained, and month obtained above, then generate the salary analysis to view the salary graph.
              </div>
            )}
          </CardBody>
        </Card>
      </section>

      {salaryAnalysisReady && (
        <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 md:p-8">
          <p className="text-sm uppercase tracking-widest text-[var(--color-muted)] mb-3">
            Plain-English Summary
          </p>
          <p className="text-[var(--color-muted-foreground)] leading-relaxed max-w-4xl">
            {summaryParagraph}
          </p>
        </section>
      )}

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
