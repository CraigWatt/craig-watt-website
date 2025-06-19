'use client';
import React from 'react';
import { NavbarContent, NavbarItem, Link } from '@heroui/react';
import Image from 'next/image';
import { ThemeSwitcher } from './ThemeSwitcher';
import { frameworkSwitcher } from '../config/nav.config';
import {
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { ChevronDown } from './icons';

type ExternalTool = {
  href: string;
  // one of these three will be present
  src?: string;
  lightSrc?: string;
  darkSrc?: string;
  alt: string;
  ariaLabel: string;
  size?: number; // <<< allow an optional size
};

const externalTools: ExternalTool[] = [
  {
    href: 'https://trading212.com',
    src: '/icons/trading212.svg',
    alt: 'Trading 212',
    ariaLabel: 'Trading 212',
  },
  {
    href: 'https://grafana.com',
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
    <NavbarContent justify="end" className="hidden sm:flex gap-2">
      {externalTools.map((tool) => (
        <NavbarItem key={tool.alt}>
          <Link
            href={tool.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={tool.ariaLabel}
          >
            <div className="h-10 w-10 flex items-center justify-center rounded-medium hover:bg-default/20 transition cursor-pointer">
              {/*
                If we have both lightSrc & darkSrc, show one or the other
              */}
              {tool.lightSrc && tool.darkSrc ? (
                <>
                  {/* Light‐mode icon: show normally, hide when .dark is present */}
                  <Image
                    src={tool.lightSrc}
                    alt={tool.alt}
                    width={tool.size ?? 24}
                    height={tool.size ?? 24}
                    className="block dark:hidden"
                    priority={false}
                  />
                  {/* Dark‐mode icon: hide normally, show when .dark is present */}
                  <Image
                    src={tool.darkSrc}
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
            </div>
          </Link>
        </NavbarItem>
      ))}

      <NavbarItem className="hidden sm:flex">
        <ThemeSwitcher />
      </NavbarItem>

      <Dropdown>
        <NavbarItem>
          <DropdownTrigger>
            <Button
              variant="light"
              className="text-sm font-semibold"
              endContent={<ChevronDown fill="currentColor" size={16} />}
            >
              {frameworkSwitcher.current}
            </Button>
          </DropdownTrigger>
        </NavbarItem>
        <DropdownMenu aria-label="Frontend Framework">
          {frameworkSwitcher.options.map((option) => (
            <DropdownItem
              key={option.label}
              href={option.href}
              target={option.href.startsWith('http') ? '_blank' : undefined}
            >
              {option.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </NavbarContent>
  );
}
