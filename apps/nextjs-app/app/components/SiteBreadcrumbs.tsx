// app/components/SiteBreadcrumbs.tsx
'use client';

import Link from 'next/link';
import { Breadcrumbs, BreadcrumbItem } from '@heroui/react';

export type Crumb = {
  label: string;
  href?: string; // if undefined or current=true, render as text
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
          {crumb.href && !crumb.current ? (
            <Link href={crumb.href} className="hover:underline">
              {crumb.label}
            </Link>
          ) : (
            <span className={crumb.current ? 'font-medium' : undefined}>
              {crumb.label}
            </span>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}
