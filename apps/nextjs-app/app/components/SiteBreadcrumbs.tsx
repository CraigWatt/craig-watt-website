// app/components/SiteBreadcrumbs.tsx
'use client';

import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';

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
          {...(crumb.href && !crumb.current ? { href: crumb.href } : {})}
          isCurrent={crumb.current}
        >
          {/* Just render text; BreadcrumbItem will wrap in <a> if href provided */}
          <span className={crumb.current ? 'font-medium' : undefined}>
            {crumb.label}
          </span>
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}
