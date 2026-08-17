'use client';
import React from 'react';
import Image from 'next/image';
import { ThemeSwitcher } from './ThemeSwitcher';
import { siteUrl } from '../data/site';

type ExternalTool = {
  href: string;
  src?: string;
  lightSrc?: string;
  darkSrc?: string;
  alt: string;
  ariaLabel: string;
  size?: number;
  internal?: boolean;
};

export const externalTools: ExternalTool[] = [
  {
    href: '/trading212',
    src: '/icons/trading212.svg',
    alt: 'Trading 212',
    ariaLabel: 'Trading 212 dashboard',
    internal: true,
  },
  {
    href: 'https://craigwatt.grafana.net/public-dashboards/9f96dfe163484bafbccb7f825a506899',
    src: '/icons/grafana.svg',
    alt: 'Grafana',
    ariaLabel: 'Grafana',
  },
  {
    href: 'https://github.com/CraigWatt',
    lightSrc: '/icons/github-dark.svg',
    darkSrc: '/icons/github-light.svg',
    alt: 'GitHub',
    ariaLabel: 'GitHub profile',
  },
];

export function NavbarRightIcons() {
  return (
    <div className="hidden items-center gap-2 md:flex">
      <a
        href={siteUrl('/cost-of-living')}
        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-white transition hover:border-[var(--color-accent)] hover:-translate-y-0.5 dark:bg-slate-200"
        aria-label="Cost of living"
      >
        <Image
          src="/icons/pound-coin.png"
          alt="Cost of living"
          width={28}
          height={28}
          className="object-contain"
          priority={false}
        />
      </a>

      {externalTools.map((tool) => {
        const hasThemeVariants = tool.lightSrc && tool.darkSrc;
        const bgClass = hasThemeVariants ? 'bg-[var(--color-card)]' : 'bg-white dark:bg-slate-200';

        const Icon = hasThemeVariants ? (
          <>
            <Image
              src={tool.lightSrc!}
              alt={tool.alt}
              width={tool.size ?? 24}
              height={tool.size ?? 24}
              className="block dark:hidden"
              priority={false}
            />
            <Image
              src={tool.darkSrc!}
              alt={tool.alt}
              width={tool.size ?? 24}
              height={tool.size ?? 24}
              className="hidden dark:block"
              priority={false}
            />
          </>
        ) : (
          <Image
            src={tool.src!}
            alt={tool.alt}
            width={tool.size ?? 24}
            height={tool.size ?? 24}
            priority={false}
          />
        );

        return (
          <a
            key={tool.alt}
            href={tool.internal ? siteUrl(tool.href) : tool.href}
            target={tool.internal ? undefined : '_blank'}
            rel={tool.internal ? undefined : 'noopener noreferrer'}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--color-border)] ${bgClass} transition hover:border-[var(--color-accent)] hover:-translate-y-0.5`}
            aria-label={tool.ariaLabel}
          >
            {Icon}
          </a>
        );
      })}

      <div className="hidden md:flex">
        <ThemeSwitcher />
      </div>
    </div>
  );
}
