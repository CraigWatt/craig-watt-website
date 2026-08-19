'use client';

import React, { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Button, Card, CardBody, Chip, Input, Select, SelectItem, Tooltip } from '@heroui/react';
import {
  CartesianGrid,
  Line,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipContentProps, TooltipValueType } from 'recharts';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { siteInputClassNames, siteSelectClassNames } from '../components/siteFieldStyles';

type SourceSnapshot = {
  name: string;
  url: string;
  fetchedAt: string;
};

type SourceMode = 'live' | 'fallback' | 'unavailable';
type SalaryRole = 'all-employees' | 'software-engineer';
type SalaryAgeBand = '18-21' | '22-29' | '30-39' | '40-49' | '50-59' | '60+';

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

type SalaryAgeOverlay = {
  role: SalaryRole;
  ageBand: SalaryAgeBand;
  label: string;
  comparisonGroup: string;
  annualMedian: number | null;
  sourceSheet: string;
  sourceDataset: string;
  notes: string;
};

type SalaryInflationCheckerPayload = {
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
    ageOverlays: SalaryAgeOverlay[];
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

type HistoryRange = '1y' | '5y' | '10y' | 'all';

type ChartDatum = Record<string, string | number | null | undefined>;
type SalaryHistoryDatum = ChartDatum & {
  date: string;
  monthKey: string;
  'Your salary': number;
  'Required salary': number;
  'Projected required salary': number | null;
};

type CustomTooltipProps = Pick<TooltipContentProps<TooltipValueType, string | number>, 'active' | 'label' | 'payload'>;

const HISTORY_RANGE_YEARS: Record<HistoryRange, number> = {
  '1y': 1,
  '5y': 5,
  '10y': 10,
  'all': Number.POSITIVE_INFINITY,
};

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

const AGE_OVERLAY_OPTIONS: Array<{ key: 'none' | SalaryAgeBand; label: string }> = [
  { key: 'none', label: 'No age overlay' },
  { key: '18-21', label: '18-21' },
  { key: '22-29', label: '22-29' },
  { key: '30-39', label: '30-39' },
  { key: '40-49', label: '40-49' },
  { key: '50-59', label: '50-59' },
  { key: '60+', label: '60+' },
];

const fetcher = async (url: string): Promise<SalaryInflationCheckerPayload> => {
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

function formatSignedMoney(value: number | null) {
  if (value === null) return 'Unavailable';
  return `${value >= 0 ? '+' : '-'}${formatMoney(Math.abs(value))}`;
}

function formatPercentage(value: number | null) {
  if (value === null || !Number.isFinite(value)) return 'Unavailable';
  return `${value >= 0 ? '+' : '-'}${Math.abs(value).toFixed(1)}%`;
}

function formatAxisSalary(value: number) {
  if (!Number.isFinite(value)) {
    return '';
  }

  if (Math.abs(value) >= 1_000_000) {
    return `£${(value / 1_000_000).toFixed(1)}m`;
  }

  if (Math.abs(value) >= 1_000) {
    return `£${Math.round(value / 1_000)}k`;
  }

  return `£${Math.round(value)}`;
}

function getRoleDisplayLabel(role: SalaryRole) {
  return role === 'software-engineer' ? 'Software engineer' : 'All employees';
}

function getAgeOverlayIntro(role: SalaryRole) {
  if (role === 'software-engineer') {
    return 'Adds a UK-wide age-band benchmark for the nearest published engineering/software occupation group. Your selected location benchmark stays separate.';
  }

  return 'Adds a UK-wide age-band benchmark for all employees. Your selected location benchmark stays separate.';
}

function getAgeOverlayCaption(role: SalaryRole) {
  if (role === 'software-engineer') {
    return 'Role-matched age context';
  }

  return 'All-employees age context';
}

function formatShortDate(value: string) {
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

function extractAsheDatasetLabel(downloadUrl: string | null, fallbackFetchedAt: string) {
  const match = downloadUrl?.match(/\/(20\d{2})(provisional|revised|final)?\//i);
  if (match) {
    const [, year, qualifier] = match;
    const qualifierLabel =
      qualifier?.toLowerCase() === 'provisional'
        ? 'provisional'
        : qualifier?.toLowerCase() === 'revised'
          ? 'revised'
          : qualifier?.toLowerCase() === 'final'
            ? 'final'
            : null;

    return qualifierLabel ? `${year} ${qualifierLabel}` : year;
  }

  return fallbackFetchedAt ? `snapshot refreshed ${formatShortDate(fallbackFetchedAt)}` : 'latest snapshot';
}

function parseSalaryInput(value: string) {
  const parsed = Number(value.replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function formatSalaryInputValue(value: string) {
  const digits = value.replace(/[^\d]/g, '');

  if (!digits) {
    return '';
  }

  return new Intl.NumberFormat('en-GB', {
    maximumFractionDigits: 0,
  }).format(Number(digits));
}

function selectionToValue(keys: unknown) {
  if (!keys || keys === 'all') {
    return '';
  }

  if (typeof keys === 'object' && Symbol.iterator in keys) {
    const [value] = Array.from(keys as Iterable<React.Key>);
    return value == null ? '' : String(value);
  }

  return '';
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
  strokeDasharrayMap,
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
  strokeDasharrayMap?: Partial<Record<string, string>>;
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
              strokeDasharray={strokeDasharrayMap?.[category]}
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

function InfoLabel({ label, tip }: { label: string; tip: string }) {
  return (
    <Tooltip
      content={<div className="max-w-xs text-sm leading-relaxed">{tip}</div>}
      delay={150}
      classNames={{
        content:
          'rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-[var(--color-foreground)] shadow-lg',
      }}
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 text-left text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]"
      >
        <span>{label}</span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--color-border)] text-[10px] normal-case tracking-normal text-[var(--color-muted-foreground)]">
          i
        </span>
      </button>
    </Tooltip>
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

function sourceChipClasses(mode: SourceMode) {
  if (mode === 'live') {
    return 'border-emerald-500/30 bg-emerald-500/12 text-emerald-700 dark:text-emerald-300';
  }

  if (mode === 'fallback') {
    return 'border-amber-500/30 bg-amber-500/12 text-amber-700 dark:text-amber-300';
  }

  return 'border-rose-500/30 bg-rose-500/12 text-rose-700 dark:text-rose-300';
}

function summariseInflationSource(sourceName: string) {
  if (/cpih/i.test(sourceName)) {
    return 'ONS CPIH';
  }

  if (/ons/i.test(sourceName)) {
    return 'ONS inflation';
  }

  return sourceName;
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
  latestInflationRate,
}: {
  inflationHistory: InflationHistoryPoint[];
  salaryValue: number;
  salaryStartMonth: string | null;
  latestInflationRate: number | null;
}) {
  const [historyRange, setHistoryRange] = useState<HistoryRange>('5y');
  const latestHistoricalMonth = inflationHistory[inflationHistory.length - 1]?.date ?? salaryStartMonth;
  const maxAvailableRange = useMemo(() => {
    if (!salaryStartMonth || !latestHistoricalMonth) {
      return 0;
    }

    const startDate = new Date(`${salaryStartMonth}-01T00:00:00Z`);
    const endDate = new Date(`${latestHistoricalMonth}-01T00:00:00Z`);
    const months =
      (endDate.getUTCFullYear() - startDate.getUTCFullYear()) * 12 +
      (endDate.getUTCMonth() - startDate.getUTCMonth()) +
      1;

    return Math.max(months / 12, 0);
  }, [latestHistoricalMonth, salaryStartMonth]);

  const effectiveHistoryRange = useMemo<HistoryRange>(() => {
    if (maxAvailableRange <= 0) {
      return historyRange;
    }

    if (historyRange === '5y' && maxAvailableRange > 10) {
      return 'all';
    }

    if (historyRange === 'all' || HISTORY_RANGE_YEARS[historyRange] <= maxAvailableRange) {
      return historyRange;
    }

    const fallbackRange = (['10y', '5y', '1y'] as const).find(
      (candidate) => HISTORY_RANGE_YEARS[candidate] <= maxAvailableRange
    );

    return fallbackRange ?? 'all';
  }, [historyRange, maxAvailableRange]);

  const chartData = useMemo(() => {
    if (!salaryStartMonth || salaryValue <= 0) {
      return [];
    }
    const cpiLookup = new Map(inflationHistory.map((point) => [point.date, point.index]));
    const salaryBaseIndex = cpiLookup.get(salaryStartMonth) ?? null;
    if (salaryBaseIndex === null || salaryBaseIndex === 0) {
      return [];
    }

    const now = new Date();
    const firstMonth =
      effectiveHistoryRange === 'all'
        ? salaryStartMonth
        : (() => {
            const cutoff = new Date(
              now.getFullYear() - HISTORY_RANGE_YEARS[effectiveHistoryRange],
              now.getMonth(),
              now.getDate()
            );
            const rangeStartMonth = monthKeyFromValue(cutoff.toISOString().slice(0, 10));
            return compareMonthKeys(rangeStartMonth, salaryStartMonth) > 0 ? rangeStartMonth : salaryStartMonth;
          })();
    if (compareMonthKeys(firstMonth, latestHistoricalMonth) > 0) {
      return [];
    }

    const annualRate = latestInflationRate !== null ? latestInflationRate / 100 : null;
    const monthlyGrowth =
      annualRate !== null && annualRate > -1 ? Math.pow(1 + annualRate, 1 / 12) - 1 : null;

    const historicalData = enumerateMonthKeys(firstMonth, latestHistoricalMonth)
      .map((monthKey) => {
        const cpiIndex = cpiLookup.get(monthKey);
        if (cpiIndex === undefined) {
          return null;
        }

        const point: SalaryHistoryDatum = {
          date: `${monthKey}-01`,
          monthKey,
          'Your salary': salaryValue,
          'Required salary': salaryValue * (cpiIndex / salaryBaseIndex),
          'Projected required salary': null,
        };

        return point;
      })
      .filter((point): point is SalaryHistoryDatum => point !== null);

    if (historicalData.length === 0 || monthlyGrowth === null) {
      return historicalData;
    }

    const lastHistoricalPoint = historicalData[historicalData.length - 1];
    const projectedMonths = enumerateMonthKeys(
      latestHistoricalMonth,
      monthKeyFromValue(
        new Date(
          Number(latestHistoricalMonth.slice(0, 4)),
          Number(latestHistoricalMonth.slice(5, 7)) - 1 + 12,
          1
        )
          .toISOString()
          .slice(0, 10)
      )
    ).slice(1);

    const projectedData = projectedMonths.map((monthKey, index) => ({
      date: `${monthKey}-01`,
      monthKey,
      'Your salary': salaryValue,
      'Required salary': null as number | null,
      'Projected required salary': lastHistoricalPoint['Required salary'] * Math.pow(1 + monthlyGrowth, index + 1),
    }));

    return [
      ...historicalData,
      {
        ...lastHistoricalPoint,
        'Projected required salary': lastHistoricalPoint['Required salary'],
      },
      ...projectedData,
    ];
  }, [effectiveHistoryRange, inflationHistory, latestHistoricalMonth, latestInflationRate, salaryStartMonth, salaryValue]);

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
    { label: 'All', value: 'all' },
  ];
  const firstPoint = chartData[0] as { monthKey?: string };
  const lastPoint = chartData[chartData.length - 1] as { monthKey?: string };
  const categories = ['Your salary', 'Required salary', 'Projected required salary'] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[var(--color-muted-foreground)]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-500" />
            Your salary
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Required salary
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-1">
            <span className="h-2.5 w-2.5 rounded-full border border-dashed border-sky-400" />
            12-month projection
          </span>
        </div>
        <div className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-card)] p-1">
          {rangeButtons.map((button) => {
            const active = effectiveHistoryRange === button.value;
            const disabled =
              button.value !== 'all' && HISTORY_RANGE_YEARS[button.value] > maxAvailableRange;
            return (
              <button
                key={button.value}
                type="button"
                onClick={() => !disabled && setHistoryRange(button.value)}
                disabled={disabled}
                className={[
                  'rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors',
                  active
                    ? 'bg-[var(--color-foreground)] text-[var(--color-background)]'
                    : disabled
                      ? 'cursor-not-allowed text-[var(--color-muted)]/45'
                      : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                ].join(' ')}
              >
                {button.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 md:p-4 shadow-sm">
        <LineChart
          className="h-80"
          data={chartData}
          index="date"
          categories={[...categories]}
          colors={['gray', 'emerald', '#38bdf8']}
          valueFormatter={(value: number) => formatAxisSalary(value)}
          showGridLines
          showYAxis
          showXAxis={false}
          autoMinValue
          connectNulls
          curveType="monotone"
          yAxisWidth={56}
          customTooltip={SalaryTooltip}
          strokeDasharrayMap={{
            'Projected required salary': '7 7',
          }}
        />
        <div className="mt-4 flex items-center justify-between gap-3 text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
          <span>{firstPoint?.monthKey ? formatMonthYear(firstPoint.monthKey) : 'Earlier'}</span>
          <span>
            {effectiveHistoryRange === 'all'
              ? `All since ${formatMonthYear(salaryStartMonth ?? '')}`
              : maxAvailableRange > 0 && HISTORY_RANGE_YEARS[effectiveHistoryRange] > maxAvailableRange
                ? `Since ${formatMonthYear(salaryStartMonth ?? '')}`
                : `Last ${effectiveHistoryRange.toUpperCase()} · GBP only`}
          </span>
          <span>{lastPoint?.monthKey ? formatMonthYear(lastPoint.monthKey) : 'Latest'}</span>
        </div>
        <p className="mt-4 text-sm text-[var(--color-muted-foreground)]">
          The solid green line shows what your salary needed to become over time to preserve the same buying power.
          The dotted blue line extends that idea 12 months forward using the latest annual CPI rate as a projection.
        </p>
      </div>
    </div>
  );
}

export default function SalaryInflationCheckerClient() {
  const [historicalSalary, setHistoricalSalary] = useState('');
  const [selectedRole, setSelectedRole] = useState<SalaryRole>('all-employees');
  const [selectedAgeBand, setSelectedAgeBand] = useState<'none' | SalaryAgeBand>('none');
  const [selectedLocation, setSelectedLocation] = useState<'central-london' | 'west-london' | 'edinburgh'>(
    'central-london'
  );
  const [entryStage, setEntryStage] = useState<0 | 1 | 2>(0);
  const [submittedSalaryAnalysis, setSubmittedSalaryAnalysis] = useState<{
    salary: number;
    period: string;
  } | null>(null);

  const { data, error, isValidating, mutate } = useSWR<SalaryInflationCheckerPayload>(
    '/api/salary-inflation-checker',
    fetcher,
    {
      shouldRetryOnError: false,
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (error) {
      console.warn('[SalaryInflationChecker] Load failed:', error);
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
    ageOverlays: [],
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

  const salaryDatasetLabel = extractAsheDatasetLabel(salaries.downloadUrl, salaries.source.fetchedAt);
  const sourceHealthItems = [
    {
      label: 'Inflation',
      mode: sourceStates.inflation,
      detail: summariseInflationSource(inflation.source.name),
    },
    {
      label: 'Salaries',
      mode: sourceStates.salaries,
      detail: `ASHE ${salaryDatasetLabel}`,
    },
  ];
  const visibleWarnings = _meta.warnings.filter((warning) => !/meal|tesco|clubcard/i.test(warning));

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
  const roleOptions: Array<{ key: SalaryRole; label: string }> = [
    { key: 'all-employees', label: 'All employees' },
    { key: 'software-engineer', label: 'Software engineer' },
  ];
  const activeAgeOverlay =
    selectedAgeBand === 'none'
      ? null
      : salaries.ageOverlays.find(
          (overlay) => overlay.role === selectedRole && overlay.ageBand === selectedAgeBand
        ) ?? null;
  const activeAgeOverlayAnnualMedian = activeAgeOverlay?.annualMedian ?? null;
  const ageOverlayIntro = getAgeOverlayIntro(selectedRole);
  const ageOverlayCaption = getAgeOverlayCaption(selectedRole);
  const selectedRoleLabel = getRoleDisplayLabel(selectedRole);

  const submittedAdjustedSalary =
    submittedSalaryAnalysis && submittedInflationMultiplier !== null
      ? submittedSalaryAnalysis.salary * submittedInflationMultiplier
      : null;
  const projectedRequiredSalaryInOneYear =
    submittedAdjustedSalary !== null && inflation.rate12m !== null
      ? submittedAdjustedSalary * (1 + inflation.rate12m / 100)
      : null;
  const salaryAnalysisReady = submittedSalaryAnalysis !== null && submittedInflationPoint !== null;
  const salaryAnalysisStale =
    submittedSalaryAnalysis !== null &&
    (submittedSalaryAnalysis.salary !== historicalSalaryValue ||
      submittedSalaryAnalysis.period !== selectedSalaryPeriod);
  const submittedSalaryPeriodLabel = submittedInflationPoint
    ? formatMonthYear(submittedInflationPoint.date)
    : null;
  const benchmarkDelta =
    submittedAdjustedSalary !== null && activeBenchmarkAnnualMedian !== null
      ? submittedAdjustedSalary - activeBenchmarkAnnualMedian
      : null;
  const currentSalaryDelta =
    submittedSalaryAnalysis !== null && activeBenchmarkAnnualMedian !== null
      ? submittedSalaryAnalysis.salary - activeBenchmarkAnnualMedian
      : null;
  const benchmarkDeltaPercent =
    benchmarkDelta !== null && activeBenchmarkAnnualMedian && activeBenchmarkAnnualMedian !== 0
      ? (benchmarkDelta / activeBenchmarkAnnualMedian) * 100
      : null;
  const currentSalaryDeltaPercent =
    currentSalaryDelta !== null && activeBenchmarkAnnualMedian && activeBenchmarkAnnualMedian !== 0
      ? (currentSalaryDelta / activeBenchmarkAnnualMedian) * 100
      : null;
  const ageOverlayTodayDelta =
    submittedAdjustedSalary !== null && activeAgeOverlayAnnualMedian !== null
      ? submittedAdjustedSalary - activeAgeOverlayAnnualMedian
      : null;
  const ageOverlayCurrentDelta =
    submittedSalaryAnalysis !== null && activeAgeOverlayAnnualMedian !== null
      ? submittedSalaryAnalysis.salary - activeAgeOverlayAnnualMedian
      : null;
  const ageOverlayTodayDeltaPercent =
    ageOverlayTodayDelta !== null &&
    activeAgeOverlayAnnualMedian !== null &&
    activeAgeOverlayAnnualMedian !== 0
      ? (ageOverlayTodayDelta / activeAgeOverlayAnnualMedian) * 100
      : null;
  const ageOverlayCurrentDeltaPercent =
    ageOverlayCurrentDelta !== null &&
    activeAgeOverlayAnnualMedian !== null &&
    activeAgeOverlayAnnualMedian !== 0
      ? (ageOverlayCurrentDelta / activeAgeOverlayAnnualMedian) * 100
      : null;
  const buyingPowerChangePercent =
    submittedAdjustedSalary !== null &&
    submittedSalaryAnalysis !== null &&
    submittedSalaryAnalysis.salary > 0
      ? ((submittedAdjustedSalary / submittedSalaryAnalysis.salary) - 1) * 100
      : null;
  const projectedBuyingPowerChangePercent =
    projectedRequiredSalaryInOneYear !== null &&
    submittedSalaryAnalysis !== null &&
    submittedSalaryAnalysis.salary > 0
      ? ((projectedRequiredSalaryInOneYear / submittedSalaryAnalysis.salary) - 1) * 100
      : null;
  const currentEntryTitle =
    entryStage === 0
      ? 'Enter your most recently obtained salary'
      : entryStage === 1
        ? 'What year did you obtain it?'
        : 'What month did you obtain it?';
  const currentEntryHint =
    entryStage === 0
      ? 'Use your annual salary.'
      : entryStage === 1
        ? 'We use this to anchor the inflation comparison.'
        : 'This lets us compare the same salary against today.';
  const canAdvanceEntryStage =
    entryStage === 0
      ? historicalSalaryValue > 0
      : entryStage === 1
        ? Boolean(selectedSalaryYearValue)
        : selectedInflationPoint !== null;

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-6xl px-6 py-16 md:px-12 lg:px-24">
        <StatusBanner
          title="Could not load salary inflation data"
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
          <LoadingIndicator label="Loading salary inflation data..." />
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-6 py-16 md:px-12 lg:px-24">
      <section className="site-surface relative overflow-hidden rounded-[2.5rem] px-6 py-7 md:px-8 md:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.14),transparent_28%)]" />
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl space-y-2">
              <p className="text-sm uppercase tracking-[0.35em] text-[var(--color-muted)]">
                Salary inflation checker
              </p>
              <h1 className="text-4xl font-semibold leading-tight text-balance md:text-5xl">
                Salary Inflation Checker
              </h1>
              <p className="text-sm text-[var(--color-muted-foreground)] md:text-base">
                Check what your salary needs to be today to keep the same buying power.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {sourceHealthItems.map(({ label, mode, detail }) => (
              <Chip
                key={label}
                variant="flat"
                size="sm"
                className={[
                  'rounded-full border px-3 py-1 text-xs shadow-sm',
                  sourceChipClasses(mode),
                ].join(' ')}
              >
                {label} {formatSourceState(mode)}
                <span className="mx-2 opacity-40">·</span>
                {detail}
              </Chip>
            ))}
          </div>

          {(_meta.stale || visibleWarnings.length > 0) && (
            <StatusBanner
              title={_meta.stale ? 'Showing cached data' : 'Partial data loaded'}
              tone={_meta.stale ? 'warning' : 'neutral'}
              description={
                visibleWarnings.length > 0
                  ? visibleWarnings.join(' · ')
                  : 'Using cached source data for part of the analysis.'
              }
            />
          )}
        </div>
      </section>

      {!salaryAnalysisReady ? (
        <section className="site-surface rounded-[2rem] px-6 py-8 md:px-10 md:py-10">
          <div className="mx-auto flex max-w-3xl flex-col gap-8">
            <div className="space-y-3 text-center">
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--color-muted)]">
                Step {entryStage + 1} of 3
              </p>
              <h2 className="text-3xl font-semibold text-[var(--color-foreground)] md:text-4xl">
                {currentEntryTitle}
              </h2>
              <p className="text-sm text-[var(--color-muted-foreground)] md:text-base">
                {currentEntryHint}
              </p>
            </div>

            <div className="space-y-5">
              {entryStage === 0 && (
                <Input
                  type="text"
                  inputMode="numeric"
                  aria-label="Annual salary"
                  placeholder="100,000"
                  value={historicalSalary}
                  onValueChange={(value) => setHistoricalSalary(formatSalaryInputValue(value))}
                  classNames={{
                    ...siteInputClassNames,
                    input:
                      'text-xl font-semibold leading-none text-[var(--color-foreground)] placeholder:text-[var(--color-muted)]/70 md:text-2xl',
                  }}
                />
              )}

              {entryStage === 1 && (
                <Select
                  aria-label="Year obtained"
                  disallowEmptySelection
                  selectedKeys={[selectedSalaryYearValue]}
                  onSelectionChange={(keys) => {
                    setSelectedSalaryYear(selectionToValue(keys));
                    setSelectedSalaryMonth('');
                  }}
                  classNames={{
                    ...siteSelectClassNames,
                    value: 'text-xl font-semibold leading-none text-[var(--color-foreground)] md:text-2xl',
                  }}
                >
                  {availableYears.map((year) => (
                    <SelectItem key={year}>{year}</SelectItem>
                  ))}
                </Select>
              )}

              {entryStage === 2 && (
                <Select
                  aria-label="Month obtained"
                  disallowEmptySelection
                  selectedKeys={[selectedSalaryMonthValue]}
                  onSelectionChange={(keys) => setSelectedSalaryMonth(selectionToValue(keys))}
                  classNames={{
                    ...siteSelectClassNames,
                    value: 'text-xl font-semibold leading-none text-[var(--color-foreground)] md:text-2xl',
                  }}
                >
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              )}

              <div className="grid grid-cols-3 gap-2">
                {[0, 1, 2].map((step) => (
                  <div
                    key={step}
                    className={[
                      'h-2 rounded-full transition-colors',
                      step <= entryStage ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]/50',
                    ].join(' ')}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="button"
                variant="flat"
                className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]"
                onPress={() => setEntryStage((stage) => (stage > 0 ? ((stage - 1) as 0 | 1 | 2) : stage))}
                isDisabled={entryStage === 0}
              >
                Back
              </Button>

              {entryStage < 2 ? (
                <Button
                  type="button"
                  variant="solid"
                  color="primary"
                  className="rounded-2xl"
                  onPress={() => setEntryStage((stage) => (stage < 2 ? ((stage + 1) as 0 | 1 | 2) : stage))}
                  isDisabled={!canAdvanceEntryStage}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onPress={() => {
                    setSubmittedSalaryAnalysis({
                      salary: historicalSalaryValue,
                      period: selectedSalaryPeriod,
                    });
                  }}
                  variant="solid"
                  color="primary"
                  className="rounded-2xl"
                  isDisabled={!canAdvanceEntryStage}
                >
                  Show analysis
                </Button>
              )}
            </div>
          </div>
        </section>
      ) : (
        <section className="site-surface rounded-[2rem] px-6 py-6 md:px-8 md:py-7">
          <div className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Salary
                </span>
                <Input
                  type="text"
                  inputMode="numeric"
                  aria-label="Salary"
                  placeholder="100,000"
                  value={historicalSalary}
                  onValueChange={(value) => setHistoricalSalary(formatSalaryInputValue(value))}
                  classNames={{
                    ...siteInputClassNames,
                    input:
                      'text-lg font-semibold leading-none text-[var(--color-foreground)] placeholder:text-[var(--color-muted)]/70 md:text-xl',
                  }}
                />
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Year
                </span>
                <Select
                  aria-label="Year"
                  disallowEmptySelection
                  selectedKeys={[selectedSalaryYearValue]}
                  onSelectionChange={(keys) => {
                    setSelectedSalaryYear(selectionToValue(keys));
                    setSelectedSalaryMonth('');
                  }}
                  classNames={siteSelectClassNames}
                >
                  {availableYears.map((year) => (
                    <SelectItem key={year}>{year}</SelectItem>
                  ))}
                </Select>
              </label>

              <label className="space-y-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                  Month
                </span>
                <Select
                  aria-label="Month"
                  disallowEmptySelection
                  selectedKeys={[selectedSalaryMonthValue]}
                  onSelectionChange={(keys) => setSelectedSalaryMonth(selectionToValue(keys))}
                  classNames={siteSelectClassNames}
                >
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value}>{option.label}</SelectItem>
                  ))}
                </Select>
              </label>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              <Button
                onPress={() => {
                  setSubmittedSalaryAnalysis({
                    salary: historicalSalaryValue,
                    period: selectedSalaryPeriod,
                  });
                }}
                variant="solid"
                color="primary"
                className="rounded-2xl"
                isDisabled={historicalSalaryValue <= 0 || selectedInflationPoint === null}
              >
                Update analysis
              </Button>
              {salaryAnalysisStale && (
                <p className="text-sm text-[var(--color-muted-foreground)]">
                  Inputs changed. Update to refresh the graph.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {salaryAnalysisReady ? (
        <>
          <section className="grid gap-4 md:grid-cols-4">
            <div className="site-input-surface rounded-[1.75rem] p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Salary date
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                {submittedSalaryPeriodLabel ?? 'Unavailable'}
              </p>
            </div>
            <div className="site-input-surface rounded-[1.75rem] p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Salary needed today
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                {formatMoney(submittedAdjustedSalary)}
              </p>
            </div>
            <div className="site-input-surface rounded-[1.75rem] p-5">
              <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                Salary needed in 12 months
              </p>
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                {formatMoney(projectedRequiredSalaryInOneYear)}
              </p>
            </div>
            <div className="site-input-surface rounded-[1.75rem] p-5">
              <InfoLabel
                label="Compared with local benchmark"
                tip="Shows how far your salary, adjusted into today's buying power, sits above or below the selected benchmark salary."
              />
              <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                {formatSignedMoney(benchmarkDelta)}
              </p>
            </div>
          </section>

          <section className="site-surface rounded-[2rem] px-5 py-5 md:px-7 md:py-7">
            <div className="mb-4 flex flex-col gap-2">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                Salary graph
              </p>
              <h2 className="text-2xl font-semibold text-[var(--color-foreground)]">
                Your salary vs inflation
              </h2>
            </div>

            <Card shadow="sm" radius="lg" className="site-surface overflow-hidden rounded-[1.75rem]">
              <CardBody className="space-y-5 p-4 md:p-5">
                <SalaryHistoryChart
                  inflationHistory={inflation.history}
                  salaryValue={submittedSalaryAnalysis.salary}
                  salaryStartMonth={submittedInflationPoint?.date ?? null}
                  latestInflationRate={inflation.rate12m}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 md:p-5">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      Increase needed today
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                      {formatPercentage(buyingPowerChangePercent)}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                      The percentage increase your original salary would need today to buy the same things.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 md:p-5">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      Increase needed in 12 months
                    </p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                      {formatPercentage(projectedBuyingPowerChangePercent)}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                      A simple forward view based on the latest annual CPI rate.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </section>

          <section className="site-surface rounded-[2rem] px-6 py-6 md:px-8 md:py-8">
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

                <div className="space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--color-muted)]">
                    Optional age-band overlay
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {AGE_OVERLAY_OPTIONS.map((option) => {
                      const active = option.key === selectedAgeBand;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => setSelectedAgeBand(option.key)}
                          className={[
                            'rounded-full px-3 py-2 text-xs font-medium transition-colors',
                            active
                              ? 'bg-[var(--color-foreground)] text-[var(--color-background)]'
                              : 'border border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                          ].join(' ')}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                    {ageOverlayIntro}
                  </p>
                </div>

                <div className="site-input-surface rounded-[1.75rem] p-5 sm:p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-[var(--color-muted)]">
                    Selected benchmark
                  </p>
                  <h3 className="mt-3 text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
                    {activeBenchmark.label}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                    {activeBenchmark.notes}
                  </p>
                  <p className="mt-3 text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
                    Based on {salaryDatasetLabel} ASHE earnings data
                    {salaries.source.fetchedAt ? ` · refreshed ${formatShortDate(salaries.source.fetchedAt)}` : ''}
                  </p>
                </div>
              </div>

              <div className="site-input-surface rounded-[1.75rem] p-5 sm:p-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      Annual
                    </p>
                    <p className="mt-2 break-words text-2xl font-semibold text-[var(--color-foreground)] sm:text-3xl">
                      {formatMoney(activeBenchmark.annualMedian)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      Monthly
                    </p>
                    <p className="mt-2 break-words text-2xl font-semibold text-[var(--color-foreground)] sm:text-3xl">
                      {activeBenchmark.annualMedian === null
                        ? 'Unavailable'
                        : formatMoney(activeBenchmark.annualMedian / 12)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <InfoLabel
                    label="Compared with your entered salary"
                    tip="Compares the selected benchmark against the salary amount you entered before any inflation adjustment."
                  />
                  <p className="mt-3 break-words text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
                    {formatSignedMoney(currentSalaryDelta)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                    {formatPercentage(currentSalaryDeltaPercent)} against the selected benchmark.
                  </p>
                </div>

                <div className="mt-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                  <InfoLabel
                    label="Compared with your salary today"
                    tip="Compares the selected benchmark against what your entered salary would need to be today to keep the same buying power."
                  />
                  <p className="mt-3 break-words text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
                    {formatSignedMoney(benchmarkDelta)}
                  </p>
                  <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                    {formatPercentage(benchmarkDeltaPercent)} against the selected benchmark.
                  </p>
                </div>

                {activeAgeOverlay ? (
                  <div className="mt-4 rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-background)] p-5">
                    <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                      {ageOverlayCaption}
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      <h4 className="text-lg font-semibold text-[var(--color-foreground)] sm:text-xl">
                        {selectedRoleLabel} · {activeAgeOverlay.label}
                      </h4>
                      <p className="text-sm text-[var(--color-muted-foreground)]">
                        {activeAgeOverlay.comparisonGroup}
                      </p>
                      <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
                        {activeAgeOverlay.notes}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                          Annual median
                        </p>
                        <p className="mt-2 break-words text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
                          {formatMoney(activeAgeOverlay.annualMedian)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                          Versus entered salary
                        </p>
                        <p className="mt-2 break-words text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
                          {formatSignedMoney(ageOverlayCurrentDelta)}
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                          {formatPercentage(ageOverlayCurrentDeltaPercent)} against the overlay median.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4">
                        <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--color-muted)]">
                          Versus salary today
                        </p>
                        <p className="mt-2 break-words text-xl font-semibold text-[var(--color-foreground)] sm:text-2xl">
                          {formatSignedMoney(ageOverlayTodayDelta)}
                        </p>
                        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                          {formatPercentage(ageOverlayTodayDeltaPercent)} against the overlay median.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="site-input-surface rounded-[1.75rem] p-8 text-center">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Generate analysis to see the graph and comparisons.
          </p>
        </section>
      )}
    </main>
  );
}
