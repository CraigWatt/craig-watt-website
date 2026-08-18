'use client';
import React from 'react';
import Image from 'next/image';
import { ThemeSwitcher } from './ThemeSwitcher';
import { siteUrl } from '../data/site';
import { navIconButtonClassName } from './navIconButtonStyles';

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
    <div className="hidden items-center gap-3 md:flex">
      <a
        href={siteUrl('/salary-inflation-checker')}
        className={navIconButtonClassName}
        aria-label="Salary inflation checker"
      >
        <Image
          src="/icons/pound-coin.png"
          alt="Salary inflation checker"
          width={28}
          height={28}
          className="object-contain"
          priority={false}
        />
      </a>

      {externalTools.map((tool) => {
        const hasThemeVariants = tool.lightSrc && tool.darkSrc;
        const bgClass = hasThemeVariants ? 'bg-[var(--color-card)]' : 'bg-[var(--color-background)]';

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
            className={`${navIconButtonClassName} ${bgClass}`}
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
