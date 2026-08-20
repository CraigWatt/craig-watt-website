'use client';

import { useEffect, useState } from 'react';
import {
  defaultGrafanaPublicDashboardUrl,
  grafanaRuntimeConfigPath,
} from '../data/runtime';

export function GrafanaRedirectClient() {
  const [targetHref, setTargetHref] = useState(defaultGrafanaPublicDashboardUrl);

  useEffect(() => {
    let cancelled = false;

    async function redirectToGrafana() {
      try {
        const response = await fetch(grafanaRuntimeConfigPath, {
          cache: 'no-store',
        });

        if (response.ok) {
          const payload = await response.json();
          const runtimeHref = payload?.grafana?.['craigwatt-platform-health'];

          if (!cancelled && typeof runtimeHref === 'string' && runtimeHref.length > 0) {
            setTargetHref(runtimeHref);
            window.location.replace(runtimeHref);
            return;
          }
        }
      } catch {
        // Fall through to the default public dashboard URL.
      }

      if (!cancelled) {
        window.location.replace(defaultGrafanaPublicDashboardUrl);
      }
    }

    void redirectToGrafana();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--color-muted)]">
            Redirecting
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Opening Grafana
          </h1>
          <p className="text-base text-[var(--color-muted-foreground)] sm:text-lg">
            Taking you to the live public dashboard.
          </p>
        </div>

        <a
          href={targetHref}
          className="rounded-full border border-[var(--color-border)] px-5 py-3 text-sm font-medium text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-card)]"
        >
          Continue manually
        </a>
      </div>
    </main>
  );
}
