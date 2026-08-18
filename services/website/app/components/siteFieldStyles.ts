export const siteInputClassNames = {
  base: 'w-full',
  mainWrapper: 'w-full',
  inputWrapper:
    'min-h-16 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-background)]/96 px-5 py-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)] transition-colors group-data-[focus=true]:border-[var(--color-accent)] group-data-[focus=true]:bg-[var(--color-card)] group-data-[hover=true]:border-[var(--color-accent)]',
  innerWrapper: 'items-center gap-3',
  input:
    'text-lg font-semibold text-[var(--color-foreground)] placeholder:text-transparent md:text-xl',
  label:
    'text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)] group-data-[focus=true]:text-[var(--color-accent)]',
  helperWrapper: 'hidden',
} as const;

export const siteTextareaClassNames = {
  ...siteInputClassNames,
  inputWrapper:
    'min-h-40 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-background)]/96 px-5 py-4 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)] transition-colors group-data-[focus=true]:border-[var(--color-accent)] group-data-[focus=true]:bg-[var(--color-card)] group-data-[hover=true]:border-[var(--color-accent)]',
  innerWrapper: 'items-start gap-3',
  input:
    'text-base leading-relaxed text-[var(--color-foreground)] placeholder:text-transparent',
} as const;

export const siteSelectClassNames = {
  base: 'w-full',
  trigger:
    'min-h-16 rounded-[1.75rem] border border-[var(--color-border)] bg-[var(--color-background)]/96 px-5 py-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.28)] transition-colors data-[hover=true]:border-[var(--color-accent)] data-[focus=true]:border-[var(--color-accent)] data-[open=true]:border-[var(--color-accent)]',
  value: 'text-lg font-semibold text-[var(--color-foreground)] md:text-xl',
  label:
    'text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-muted)] group-data-[focus=true]:text-[var(--color-accent)]',
  selectorIcon:
    'text-[var(--color-muted)] transition-transform group-data-[open=true]:rotate-180',
  popoverContent:
    'rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)]',
  listboxWrapper: 'p-1',
} as const;
