'use client';

type LoadingIndicatorProps = {
  label: string;
};

export function LoadingIndicator({ label }: LoadingIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 p-6 text-sm text-[var(--color-muted-foreground)]">
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]"
      />
      <span>{label}</span>
    </div>
  );
}
