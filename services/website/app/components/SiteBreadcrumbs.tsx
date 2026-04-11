// app/components/SiteBreadcrumbs.tsx
'use client';

import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';
import { siteUrl } from '../data/site';

export type Crumb = {
  label: string;
  href?: string; // if present and not current, BreadcrumbItem will render as <a href=...>
  current?: boolean;
};

export function SiteBreadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumbs aria-label="Breadcrumbs" className="mb-4">
      {items.map((crumb, idx) => (
        <BreadcrumbItem
          key={idx}
          {...(crumb.href && !crumb.current ? { href: crumb.href.startsWith('http') ? crumb.href : siteUrl(crumb.href) } : {})}
          isCurrent={crumb.current}
          classNames={{
            item: "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
            separator: "text-zinc-500 dark:text-zinc-500",
          }}
        >
          {/* Just render text; BreadcrumbItem will wrap in <a> if href provided */}
          <span className={crumb.current ? 'font-medium text-zinc-900 dark:text-zinc-100' : undefined}>
            {crumb.label}
          </span>
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}
