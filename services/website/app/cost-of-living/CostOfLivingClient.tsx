'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Button, Card, CardBody, CardHeader, Chip } from '@heroui/react';
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
type InsightView = 'summary' | 'everyday-prices' | 'salary-trend' | 'sources';

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
    <div className="site-input-surface rounded-[1.5rem] px-5 py-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <span className="text-[11px] uppercase tracking-[0.28em] text-[var(--color-muted)]">
          {title}
        </span>
      </div>
      <div className="space-y-2">
        <p className={`text-2xl font-semibold ${toneClass}`}>{value}</p>
        {detail && (
          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{detail}</p>
        )}
        {source && <p className="text-xs text-[var(--color-muted)]">{source}</p>}
        {fetchedAt && <p className="text-xs text-[var(--color-muted)]">Updated {formatDisplayDate(fetchedAt)}</p>}
      </div>
    </div>
  );
}

function StatusBanner({
  title,
  description,
  tone = 'neutral',
  action,
}: {
  title: string;
  description: string;
  tone?: 'neutral' | 'warning' | 'danger';
  action?: React.ReactNode;
}) {
  const toneClasses =
    tone === 'danger'
      ? 'border-rose-500/25 bg-rose-500/10'
      : tone === 'warning'
        ? 'border-amber-500/25 bg-amber-500/10'
        : 'border-[var(--color-border)] bg-[var(--color-card)]';

  return (
    <div className={`site-status-banner rounded-[1.75rem] border px-5 py-4 ${toneClasses}`}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[var(--color-foreground)]">{title}</p>
          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{description}</p>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </div>
  );
}

function StepSection({
  step,
  title,
  description,
  children,
  action,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="site-surface rounded-[2rem] px-6 py-6 md:px-8 md:py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-3">
              <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--color-muted-foreground)]">
                {step}
              </span>
              <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-muted)]">
                Guided Flow
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)] md:text-3xl">
                {title}
              </h2>
              <p className="max-w-2xl text-sm leading-relaxed text-[var(--color-muted-foreground)] md:text-base">
                {description}
              </p>
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
        {children}
      </div>
    </section>
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
  const [activeInsightView, setActiveInsightView] = useState<InsightView>('summary');
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
  const defaultSalaryYear = defaultPeriod.slice(0, 4) || '2026';
  const defaultSalaryMonth = defaultPeriod.slice(5, 7) || '06';
  const [selectedSalaryYear, setSelectedSalaryYear] = useState('');
  const [selectedSalaryMonth, setSelectedSalaryMonth] = useState('');
  const selectedSalaryYearValue = selectedSalaryYear || defaultSalaryYear;

  const monthOptions = inflationHistory
    .filter((point) => point.date.startsWith(`${selectedSalaryYearValue}-`))
    .map((point) => ({
      value: point.date.slice(5, 7),
      label: formatMonthYear(point.date).split(' ')[0],
    }));
  const selectedSalaryMonthValue = monthOptions.some((option) => option.value === selectedSalaryMonth)
    ? selectedSalaryMonth
    : (monthOptions[0]?.value ?? defaultSalaryMonth);

  const selectedInflationPoint =
    inflationHistory.find(
      (point) => point.date === `${selectedSalaryYearValue}-${selectedSalaryMonthValue}`
    ) ?? null;
  const inflationMultiplier =
    latestInflationPoint && selectedInflationPoint && selectedInflationPoint.index !== 0
      ? latestInflationPoint.index / selectedInflationPoint.index
      : null;
  const selectedSalaryPeriod = `${selectedSalaryYearValue}-${selectedSalaryMonthValue}`;
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
  const resolvedSelectedLocation =
    benchmarkRows.some((row) => row.key === selectedLocation)
      ? selectedLocation
      : (benchmarkRows[0]?.key ?? 'central-london');
  const activeBenchmark =
    benchmarkRows.find((row) => row.key === resolvedSelectedLocation) ?? benchmarkRows[0] ?? FALLBACK_BENCHMARK;
  const activeBenchmarkAnnualMedian = activeBenchmark.annualMedian;
  const activeBenchmarkLabel = activeBenchmark.label;
  const roleOptions: Array<{ key: SalaryRole; label: string }> = [
    { key: 'all-employees', label: 'All employees' },
    { key: 'software-engineer', label: 'Software engineer' },
  ];
  const insightViews: Array<{ key: InsightView; label: string }> = [
    { key: 'summary', label: 'Summary' },
    { key: 'everyday-prices', label: 'Everyday prices' },
    { key: 'salary-trend', label: 'Salary trend' },
    { key: 'sources', label: 'Sources' },
  ];

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
    submittedAdjustedSalary !== null && activeBenchmarkAnnualMedian !== null
      ? submittedAdjustedSalary - activeBenchmarkAnnualMedian
      : null;
  const roleLabel = selectedRole === 'software-engineer' ? 'software engineer' : 'all-employee';
  const salarySentence =
    submittedSalaryAnalysis &&
    submittedSalaryPeriodLabel &&
    latestInflationPeriodLabel &&
    submittedAdjustedSalary !== null
      ? `A salary of ${formatMoney(submittedSalaryAnalysis.salary)} from ${submittedSalaryPeriodLabel} would need to be ${formatMoney(submittedAdjustedSalary)} by ${latestInflationPeriodLabel} to preserve the same buying power, a required increase of ${formatPercent(salaryRequiredGrowthPct)}.`
      : 'Salary purchasing-power adjustment is currently unavailable because the inflation history needed for that calculation is missing.';
  const benchmarkSentence =
    benchmarkDelta !== null && activeBenchmarkAnnualMedian !== null
      ? `Against the current ${activeBenchmarkLabel} ${roleLabel} benchmark of ${formatMoney(activeBenchmarkAnnualMedian)}, that leaves you ${benchmarkDelta >= 0 ? formatMoney(benchmarkDelta) : formatMoney(Math.abs(benchmarkDelta))} ${benchmarkDelta >= 0 ? 'above' : 'below'} the benchmark today.`
      : `The current ${activeBenchmarkLabel} ${roleLabel} benchmark is ${formatMoney(activeBenchmarkAnnualMedian)}.`;
  const mealDealSentence =
    mealDealStartPoint?.clubcardPrice !== null && mealDeal.clubcardPrice !== null
      ? `Over the same broader period, the Tesco Clubcard meal deal moved from ${formatCurrency(mealDealStartPoint.clubcardPrice)} in ${formatDisplayDate(mealDealStartPoint.date)} to ${formatCurrency(mealDeal.clubcardPrice)} now, a change of ${formatPercent(mealDealPercentChange)}.`
      : 'The Tesco meal-deal series is currently unavailable, so the everyday-cost comparison is paused.';
  const summaryParagraph = `${salarySentence} ${benchmarkSentence} ${mealDealSentence}`;
  const sourceHealthSummary =
    sourceHealthItems.map(({ label, mode }) => `${label}: ${formatSourceState(mode)}`).join(' · ');

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 md:px-12 lg:px-24">
        <StatusBanner
          title="Could not load cost-of-living data"
          description="The page is up, but the live sources are temporarily unavailable. Try again in a moment."
          tone="danger"
          action={
            <Button
              size="sm"
              variant="flat"
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)]"
              onPress={() => mutate()}
            >
              Retry
            </Button>
          }
        />
      </main>
    );
  }

  if (!data || isValidating) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 md:px-12 lg:px-24">
        <div className="py-20">
          <LoadingIndicator label="Loading cost-of-living data..." />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-8 px-6 py-16 md:px-12 lg:px-24">
      <section className="site-surface relative overflow-hidden rounded-[2.5rem] px-6 py-8 md:px-8 md:py-9">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.16),transparent_28%)]" />
        <div className="relative flex flex-col gap-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-muted)]">
                Cost of living
              </p>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight text-balance md:text-5xl">
                  Live signals for salary, inflation, and everyday prices
                </h1>
                <p className="max-w-2xl text-base leading-relaxed text-[var(--color-muted-foreground)]">
                  A calmer, guided view of the data that matters when you want to talk about pay,
                  purchasing power, and how everyday costs are moving around you.
                </p>
              </div>
            </div>

            <Button
              onPress={() => mutate()}
              variant="flat"
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]"
              startContent={<RefreshArrow className="h-4 w-4" />}
            >
              Refresh
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {sourceHealthItems.map(({ label, mode }) => (
              <Chip
                key={label}
                color={mode === 'live' ? 'success' : 'warning'}
                variant="flat"
                size="sm"
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3"
              >
                {label}: {formatSourceState(mode)}
              </Chip>
            ))}
          </div>

          {(_meta.partial || _meta.stale) && (
            <StatusBanner
              title={_meta.stale ? 'Showing cached data' : 'Partial data loaded'}
              tone={_meta.stale ? 'warning' : 'neutral'}
              description={
                _meta.warnings.length > 0
                  ? _meta.warnings.join(' · ')
                  : 'One or more live sources could not be fetched right now.'
              }
            />
          )}
        </div>
      </section>

      <StepSection
        step="01"
        title="Check the live feeds first"
        description="Start with the data health. This keeps the page honest before you use any of the comparisons further down."
      >
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="site-input-surface rounded-[1.75rem] p-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1 text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                <Activity className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                Live status
              </div>
              <h3 className="text-2xl font-semibold text-[var(--color-foreground)]">
                What is working right now
              </h3>
              <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                Inflation comes from the ONS CPIH feed, salary benchmarks from ASHE Table 7 and
                Table 15, and the Tesco signal is used as a lightweight everyday-price reference.
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                Current status: {sourceHealthSummary}.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <DataCard
              title="Inflation"
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
              title="Salaries"
              value={formatSourceState(sourceStates.salaries)}
              detail={
                salaries.downloadUrl
                  ? 'ONS ASHE Table 7 and Table 15 are reachable for locality and software-engineer benchmarks.'
                  : 'The salary source is currently unavailable.'
              }
              source={salaries.source.name}
              fetchedAt={salaries.source.fetchedAt}
              tone={toneFromSourceState(sourceStates.salaries)}
            />
            <DataCard
              title="Everyday prices"
              value={formatSourceState(sourceStates.mealDeals)}
              detail={
                mealDeal.clubcardPrice === null && mealDeal.regularPrice === null
                  ? `Tracked from ${mealDeal.retailer} as a lightweight everyday-cost signal.`
                  : `${mealDeal.retailer}: ${formatCurrency(mealDeal.clubcardPrice)} Clubcard / ${formatCurrency(mealDeal.regularPrice)} regular.`
              }
              source={mealDeal.source.name}
              fetchedAt={mealDeal.source.fetchedAt}
              tone={toneFromSourceState(sourceStates.mealDeals)}
            />
          </div>
        </div>
      </StepSection>

      <StepSection
        step="02"
        title="Enter your salary and the month it started"
        description="This is the anchor point for the rest of the page. Once you set the amount and date, we can translate it into today’s buying power."
      >
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="site-input-surface rounded-[1.75rem] p-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="block space-y-2 md:col-span-1">
                <span className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                  Salary
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step="1000"
                  value={historicalSalary}
                  onChange={(event) => setHistoricalSalary(event.target.value)}
                  className="site-input-surface w-full rounded-2xl px-4 py-3 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                  Year earned
                </span>
                <select
                  value={selectedSalaryYearValue}
                  onChange={(event) => {
                    setSelectedSalaryYear(event.target.value);
                    setSelectedSalaryMonth('');
                  }}
                  className="site-input-surface w-full rounded-2xl px-4 py-3 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                  Month earned
                </span>
                <select
                  value={selectedSalaryMonthValue}
                  onChange={(event) => setSelectedSalaryMonth(event.target.value)}
                  className="site-input-surface w-full rounded-2xl px-4 py-3 text-[var(--color-foreground)] outline-none transition-colors focus:border-[var(--color-accent)]"
                >
                  {monthOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                onPress={() => {
                  setSubmittedSalaryAnalysis({
                    salary: historicalSalaryValue,
                    period: selectedSalaryPeriod,
                  });
                  setActiveInsightView('summary');
                }}
                variant="solid"
                color="primary"
                className="rounded-2xl"
                isDisabled={historicalSalaryValue <= 0 || selectedInflationPoint === null}
              >
                Continue to analysis
              </Button>
              <p className="max-w-md text-sm text-[var(--color-muted-foreground)]">
                This unlocks the written summary and the chart views below.
              </p>
            </div>

            {salaryAnalysisStale && (
              <div className="mt-5">
                <StatusBanner
                  title="Inputs changed"
                  description="Regenerate the analysis to refresh the benchmark comparison and chart views."
                  tone="warning"
                />
              </div>
            )}
          </div>

          <div className="site-input-surface rounded-[1.75rem] p-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                  Inflation-adjusted today
                </p>
                <p className="mt-3 text-4xl font-semibold text-[var(--color-foreground)]">
                  {inflatedHistoricalSalary === null ? 'Unavailable' : formatMoney(inflatedHistoricalSalary)}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {inflationMultiplier === null || !selectedInflationPoint || !latestInflationPoint
                  ? 'The CPIH history is unavailable right now, so this calculation is paused.'
                  : `Adjusted from ${formatMonthYear(selectedInflationPoint.date)} to ${formatMonthYear(latestInflationPoint.date)} using the CPIH index series.`}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                    Current CPI
                  </p>
                  <p className="mt-2 text-xl font-semibold">{formatNumber(inflation.index, 1)}</p>
                </div>
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                  <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                    12m inflation
                  </p>
                  <p className="mt-2 text-xl font-semibold">{formatPercent(inflation.rate12m, 2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </StepSection>

      <StepSection
        step="03"
        title="Choose the benchmark you want to compare against"
        description="Pick the lens first, then the place. This keeps the salary comparison focused instead of showing too many benchmark cards at once."
      >
        <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-4">
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

            <div className="site-input-surface rounded-[1.75rem] p-6">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Selected benchmark
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                {activeBenchmark.label}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {selectedRole === 'all-employees'
                  ? 'Representative local-authority medians from ONS ASHE Table 7 full-time annual pay.'
                  : 'Representative software-engineer medians from ONS ASHE Table 15 full-time annual pay.'}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                {activeBenchmark.notes} Source locality: {activeBenchmark.locality}.
              </p>
            </div>
          </div>

          <div className="site-input-surface rounded-[1.75rem] p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                  Annual salary
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-foreground)]">
                  {formatMoney(activeBenchmark.annualMedian)}
                </p>
              </div>
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
                <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                  Monthly
                </p>
                <p className="mt-2 text-3xl font-semibold text-[var(--color-foreground)]">
                  {activeBenchmark.annualMedian === null
                    ? 'Unavailable'
                    : formatMoney(activeBenchmark.annualMedian / 12)}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Versus your adjusted salary
              </p>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                {inflatedHistoricalSalary === null || activeBenchmark.annualMedian === null
                  ? 'Unavailable'
                  : `${inflatedHistoricalSalary >= activeBenchmark.annualMedian ? '+' : '-'}${formatMoney(
                      Math.abs(inflatedHistoricalSalary - activeBenchmark.annualMedian)
                    )}`}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                Compares your selected salary period against the current benchmark for {activeBenchmark.label}.
              </p>
            </div>
          </div>
        </div>
      </StepSection>

      <StepSection
        step="04"
        title="Open the deeper views when you are ready"
        description="This last stage keeps the detailed graphs and source links behind a simple switcher so the page stays focused instead of overwhelming."
      >
        {salaryAnalysisReady ? (
          <div className="space-y-6">
            <div className="inline-flex w-full flex-wrap gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-2">
              {insightViews.map((view) => {
                const active = activeInsightView === view.key;
                return (
                  <button
                    key={view.key}
                    type="button"
                    onClick={() => setActiveInsightView(view.key)}
                    className={[
                      'rounded-xl px-4 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-[var(--color-foreground)] text-[var(--color-background)]'
                        : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                    ].join(' ')}
                  >
                    {view.label}
                  </button>
                );
              })}
            </div>

            {activeInsightView === 'summary' && (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="site-input-surface rounded-[1.75rem] p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Plain-English summary
                  </p>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--color-muted-foreground)]">
                    {summaryParagraph}
                  </p>
                </div>

                <div className="site-input-surface rounded-[1.75rem] p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Snapshot
                  </p>
                  <div className="mt-4 grid gap-3">
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                        Selected period
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                        {submittedSalaryPeriodLabel ?? 'Unavailable'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                        Today equivalent
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                        {formatMoney(submittedAdjustedSalary)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                      <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                        Benchmark delta
                      </p>
                      <p className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                        {benchmarkDelta === null
                          ? 'Unavailable'
                          : `${benchmarkDelta >= 0 ? '+' : '-'}${formatMoney(Math.abs(benchmarkDelta))}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeInsightView === 'everyday-prices' && (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                      Everyday prices
                    </p>
                    <h3 className="text-2xl font-semibold">Tesco meal deal vs CPI</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Clubcard meal-deal pricing compared with CPI on a normalized index basis.
                    </p>
                  </div>
                  <p className="max-w-md text-sm text-[var(--color-muted-foreground)] md:text-right">
                    CPI stretches back to January 1988, while Tesco begins in February 2022 from known public price changes and ongoing snapshots.
                  </p>
                </div>

                <Card shadow="sm" radius="lg" className="site-surface overflow-hidden rounded-[1.75rem]">
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 text-sm">
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                          Clubcard current
                        </p>
                        <p className="text-xl font-semibold">{formatCurrency(mealDeal.clubcardPrice)}</p>
                        <p className="text-[var(--color-muted-foreground)]">Current tracked Tesco price.</p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4">
                        <p className="text-xs uppercase tracking-[0.25em] text-[var(--color-muted)]">
                          CPI current
                        </p>
                        <p className="text-xl font-semibold">{formatNumber(inflation.index, 1)}</p>
                        <p className="text-[var(--color-muted-foreground)]">Latest tracked CPI level.</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}

            {activeInsightView === 'salary-trend' && (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                      Salary trend
                    </p>
                    <h3 className="text-2xl font-semibold">Your salary vs inflation</h3>
                    <p className="text-sm text-[var(--color-muted-foreground)]">
                      Actual pay in pounds compared against the inflation-adjusted level needed to keep the same buying power.
                    </p>
                  </div>
                  <p className="max-w-md text-sm text-[var(--color-muted-foreground)] md:text-right">
                    The benchmark line uses the current selected location snapshot as a horizontal reference rather than a full historical series.
                  </p>
                </div>

                <Card shadow="sm" radius="lg" className="site-surface overflow-hidden rounded-[1.75rem]">
                  <CardBody className="space-y-4">
                    <SalaryHistoryChart
                      inflationHistory={inflation.history}
                      salaryValue={submittedSalaryAnalysis.salary}
                      salaryStartMonth={submittedInflationPoint?.date ?? null}
                      benchmarkLabel={`${activeBenchmark.label} benchmark`}
                      benchmarkValue={activeBenchmark.annualMedian}
                    />
                  </CardBody>
                </Card>
              </div>
            )}

            {activeInsightView === 'sources' && (
              <div className="grid gap-6 lg:grid-cols-2">
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
                        Snapshots used to power the page and the calculator flow.
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
                        className="break-all text-[var(--color-accent)] hover:underline"
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
                        className="break-all text-[var(--color-accent)] hover:underline"
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
                        className="break-all text-[var(--color-accent)] hover:underline"
                      >
                        {mealDeal.source.name}
                      </a>
                    </div>
                  </CardBody>
                </Card>
              </div>
            )}
          </div>
        ) : (
          <div className="site-input-surface rounded-[1.75rem] p-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
              Deep-dive locked for now
            </p>
            <h3 className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
              Generate your salary analysis first
            </h3>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              Once you confirm your salary and start date above, this stage unlocks the plain-English summary,
              the normalized Tesco vs CPI chart, the salary trend view, and the source breakdown.
            </p>
          </div>
        )}
      </StepSection>
    </main>
  );
}
