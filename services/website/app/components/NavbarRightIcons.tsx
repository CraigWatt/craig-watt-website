'use client';
import React from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  NavbarContent,
  NavbarItem,
  Button,
} from '@heroui/react';
import { ThemeSwitcher } from './ThemeSwitcher';

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
    href: 'https://github.com/CraigWatt',
    lightSrc: '/icons/github-dark.svg',
    darkSrc: '/icons/github-light.svg',
    alt: 'GitHub',
    ariaLabel: 'GitHub profile',
  },
  {
    href: 'https://www.linkedin.com/in/craig-watt-a5a10a164/',
    lightSrc: '/icons/linkedin-dark.svg',
    darkSrc: '/icons/linkedin-light.svg',
    alt: 'LinkedIn',
    ariaLabel: 'LinkedIn profile',
  },
];

export function NavbarRightIcons() {
  return (
    <NavbarContent justify="end" className="hidden sm:flex gap-2">
      {externalTools.map((tool) => {
        // build the icon markup
        const Icon = tool.lightSrc && tool.darkSrc ? (
          <>
            <Image
              src={tool.lightSrc}
              alt={tool.alt}
              width={tool.size ?? 24}
              height={tool.size ?? 24}
              className="block dark:hidden"
              priority={false}
            />
            <Image
              src={tool.darkSrc}
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

        if (tool.internal) {
          // internal: use NextLink directly on the Button
          return (
            <NavbarItem key={tool.alt}>
              <Button
                as={NextLink}
                href={tool.href}
                variant="light"
                isIconOnly
                className="h-10 w-10 p-0 rounded-medium"
                aria-label={tool.ariaLabel}
              >
                {Icon}
              </Button>
            </NavbarItem>
          );
        } else {
          // external: normal anchor with new-tab
          return (
            <NavbarItem key={tool.alt}>
              <Button
                as="a"
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                variant="light"
                isIconOnly
                className="h-10 w-10 p-0 rounded-medium"
                aria-label={tool.ariaLabel}
              >
                {Icon}
              </Button>
            </NavbarItem>
          );
        }
      })}

      {/* Theme switcher */}
      <NavbarItem className="hidden sm:flex">
        <ThemeSwitcher />
      </NavbarItem>

    </NavbarContent>
  );
}
