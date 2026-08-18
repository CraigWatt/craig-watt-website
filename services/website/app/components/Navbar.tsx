// app/components/Navbar.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ChevronDown } from './icons';
import { Menu, X } from 'lucide-react';
import { navItems } from '../config/nav.config';
import { NavbarRightIcons, externalTools } from './NavbarRightIcons';
import { ThemeSwitcher } from './ThemeSwitcher';
import { siteUrl } from '../data/site';
import { navIconButtonClassName } from './navIconButtonStyles';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileBlogOpen, setMobileBlogOpen] = useState(false);

  const hoverBgClass = 'hover:bg-black/5 dark:hover:bg-white/8';
  const itemRounded = 'rounded-2xl';
  const mobileItemPadding = 'px-4 py-3';
  const desktopNavLinkClass = `
    px-4 py-2.5 ${itemRounded}
    text-[15px] font-medium tracking-[0.01em] text-[var(--color-foreground)]
    transition-colors ${hoverBgClass}
  `;
  const mobileNavLinkClass = `
    w-full flex items-center
    ${mobileItemPadding} ${itemRounded}
    border border-transparent
    text-[15px] font-medium tracking-[0.01em] text-[var(--color-foreground)]
    transition-colors ${hoverBgClass}
  `;

  const writingItem = navItems.find((item) => Array.isArray(item.children) && item.label === 'Writing');
  const primaryItems = navItems.filter((item) => !Array.isArray(item.children));

  return (
    <header className="site-nav print:hidden">
      <div className="mx-auto flex min-h-20 max-w-6xl items-center gap-6 px-4 md:px-6 lg:px-8">
        <div className="hidden md:flex">
          <a
            href={siteUrl('/')}
            className="group flex items-center gap-3.5 p-0"
          >
            <div
              className={`
                relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-[var(--color-border)]
                transition-shadow transition-filter
                group-hover:shadow-outline
                group-hover:brightness-90
              `}
            >
              <Image
                src="/images/avatar.jpg"
                alt="Craig Watt’s avatar"
                fill
                sizes="40px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <span className="text-[15px] font-semibold tracking-[0.01em] text-[var(--color-foreground)] transition-opacity group-hover:opacity-80">
              Craig Watt
            </span>
          </a>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-1.5 md:flex">
          {primaryItems.map((item) => (
            <a
              key={item.label}
              href={siteUrl(item.href)}
              className={desktopNavLinkClass}
            >
              {item.label}
            </a>
          ))}
          {writingItem && (
            <a
              href={siteUrl(writingItem.href)}
              className={desktopNavLinkClass}
            >
              {writingItem.label}
            </a>
          )}
        </nav>

        <div className="hidden md:ml-auto md:flex">
          <NavbarRightIcons />
        </div>

        <div className="flex w-full items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            onClick={() => {
              setIsMenuOpen((open) => {
                const nextOpen = !open;
                setMobileBlogOpen(nextOpen);
                return nextOpen;
              });
            }}
            className={navIconButtonClassName}
          >
            {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <a
            href={siteUrl('/')}
            onClick={() => setIsMenuOpen(false)}
            className="group flex items-center gap-3"
          >
            <div className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-[var(--color-border)]">
              <Image
                src="/images/avatar.jpg"
                alt="Craig Watt’s avatar"
                fill
                sizes="44px"
                style={{ objectFit: 'cover' }}
              />
            </div>
            <span className="text-[15px] font-semibold tracking-[0.01em] text-[var(--color-foreground)] transition-opacity group-hover:opacity-80">
              Craig Watt
            </span>
          </a>

          <ThemeSwitcher />
        </div>
      </div>

      {isMenuOpen && (
        <div className="site-nav-panel border-t border-[var(--color-border)] px-4 pb-6 pt-4 backdrop-blur md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1.5">
            {primaryItems.map((item) => (
              <a
                key={item.label}
                href={siteUrl(item.href)}
                onClick={() => {
                  setIsMenuOpen(false);
                  setMobileBlogOpen(false);
                }}
                className={mobileNavLinkClass}
              >
                {item.label}
              </a>
            ))}

            {writingItem && (
              <>
                <a
                  href={siteUrl(writingItem.href)}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setMobileBlogOpen(false);
                  }}
                  className={mobileNavLinkClass}
                >
                  All writing
                </a>

                <button
                  type="button"
                  onClick={() => setMobileBlogOpen((prev) => !prev)}
                  className={`
                    ${mobileNavLinkClass}
                    justify-between
                  `}
                >
                  <span>Browse writing</span>
                  <ChevronDown
                    size={16}
                    fill="currentColor"
                    className={`transform transition-transform ${mobileBlogOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                </button>

                {mobileBlogOpen &&
                  writingItem.children?.map((child) => {
                    const childExternal = child.href.startsWith('http');
                    return (
                      <a
                        key={child.label}
                        href={childExternal ? child.href : siteUrl(child.href)}
                        onClick={() => {
                          setIsMenuOpen(false);
                          setMobileBlogOpen(false);
                        }}
                        className={`
                          flex w-full items-center gap-3
                          ${itemRounded} ${mobileItemPadding} border border-transparent pl-8
                          text-[15px] text-[var(--color-foreground)] transition-colors ${hoverBgClass}
                        `}
                      >
                        <span className="flex-shrink-0">{child.icon}</span>
                        <span>{child.label}</span>
                      </a>
                    );
                  })}
              </>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] px-0 pt-4">
            <a
              href={siteUrl('/salary-inflation-checker')}
              onClick={() => {
                setIsMenuOpen(false);
                setMobileBlogOpen(false);
              }}
              className={`
                ${navIconButtonClassName}
              `}
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
              const bgClass = hasThemeVariants
                ? 'bg-[var(--color-card)]'
                : 'bg-[var(--color-background)]';
              
              return (
                <a
                  key={tool.alt}
                  href={tool.internal ? siteUrl(tool.href) : tool.href}
                  target={tool.internal ? undefined : '_blank'}
                  rel={tool.internal ? undefined : 'noopener noreferrer'}
                  onClick={() => {
                    setIsMenuOpen(false);
                    setMobileBlogOpen(false);
                  }}
                  className={`
                    ${navIconButtonClassName}
                    ${bgClass}
                  `}
                  aria-label={tool.ariaLabel}
                >
                  {hasThemeVariants ? (
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
                  ) : tool.src ? (
                    <Image
                      src={tool.src}
                      alt={tool.alt}
                      width={tool.size ?? 24}
                      height={tool.size ?? 24}
                      priority={false}
                    />
                  ) : null}
                </a>
              );
            })}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};
