'use client';

type LoadingIndicatorProps = {
  label: string;
};

export function LoadingIndicator({ label }: LoadingIndicatorProps) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center gap-4 rounded-[2rem] border border-[var(--color-border)] bg-[var(--color-card)] px-8 py-12 text-center">
      <span
        aria-hidden="true"
        className="h-10 w-10 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)] shadow-[0_0_0_8px_rgba(34,211,238,0.06)]"
      />
      <div className="space-y-2">
        <p className="text-base font-medium text-[var(--color-foreground)]">{label}</p>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Pulling the latest page state and preparing the dashboard surface.
        </p>
      </div>
    </div>
  );
}
