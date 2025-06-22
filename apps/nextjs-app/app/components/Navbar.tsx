// app/components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import NextLink from 'next/link';
import Image from 'next/image';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
} from '@heroui/react';
import { ChevronDown } from './icons';
import { navItems, frameworkSwitcher } from '../config/nav.config';
import { NavbarRightIcons, externalTools } from './NavbarRightIcons';
import { ThemeSwitcher } from './ThemeSwitcher';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileBlogOpen, setMobileBlogOpen] = useState(false);
  const [mobileFrameworkOpen, setMobileFrameworkOpen] = useState(false);

  // When mobile menu opens/closes, auto-expand/collapse sections
  useEffect(() => {
    if (isMenuOpen) {
      setMobileBlogOpen(true);
      setMobileFrameworkOpen(true);
    } else {
      setMobileBlogOpen(false);
      setMobileFrameworkOpen(false);
    }
  }, [isMenuOpen]);

  // Common classes
  const hoverBgClass = 'hover:bg-default/20 dark:hover:bg-default/30';
  const itemRounded = 'rounded';
  const mobileItemPadding = 'px-4 py-3'; // approx 48px height for fat-finger
  const iconBtnSizeClass = 'h-11 w-11'; // ~44px square for icon buttons

  return (
    // Controlled open state. Use `open` prop per HeroUI API.
    <HeroNavbar isMenuOpen={isMenuOpen} onMenuOpenChange={setIsMenuOpen}>
      {/* ===== Mobile Header: toggle, centered brand, theme switcher ===== */}
      <NavbarContent className="sm:hidden flex justify-between items-center w-full px-4">
        {/* Menu toggle on left */}
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="p-2"
        />
        {/* Center: Brand */}
        <NavbarBrand className="flex-1 flex justify-center">
          <NavbarItem>
            <NextLink
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="group flex items-center space-x-2 p-0"
            >
              <div
                className={`
                  relative h-11 w-11 rounded-full overflow-hidden
                  transition-shadow transition-filter
                  group-hover:shadow-outline
                  group-hover:brightness-90
                `}
              >
                <Image
                  src="/images/avatar.jpg"
                  alt="Craig Watt’s avatar"
                  fill
                  sizes="44px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <span className="font-bold text-base transition-opacity group-hover:opacity-80">
                Craig Watt
              </span>
            </NextLink>
          </NavbarItem>
        </NavbarBrand>
        {/* Right: theme switcher */}
        <NavbarItem>
          <div
            className={`${iconBtnSizeClass} flex items-center justify-center ${itemRounded} ${hoverBgClass}`}
          >
            <ThemeSwitcher />
          </div>
        </NavbarItem>
      </NavbarContent>

      {/* ===== Desktop Left: Logo / Home (avatar + name) ===== */}
      <NavbarContent className="hidden sm:flex items-center">
        <NavbarBrand>
          <NavbarItem>
            <NextLink
              href="/"
              className="group flex items-center space-x-2 p-0"
            >
              <div
                className={`
                  relative h-10 w-10 rounded-full overflow-hidden
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
              <span className="font-bold text-base transition-opacity group-hover:opacity-80">
                Craig Watt
              </span>
            </NextLink>
          </NavbarItem>
        </NavbarBrand>
      </NavbarContent>

      {/* ===== Desktop Center: Menu Items ===== */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item) => {
          if (Array.isArray(item.children)) {
            // Dropdown for items with children (e.g. Blog)
            return (
              <Dropdown key={item.label}>
                <NavbarItem>
                  <DropdownTrigger>
                    <Button
                      as="button"
                      variant="light"
                      className={`
                        px-4 py-2 ${itemRounded}
                        text-base text-inherit
                        ${hoverBgClass}
                        flex items-center space-x-1
                        focus:ring-0
                      `}
                      aria-label={`${item.label} menu`}
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={16} />
                    </Button>
                  </DropdownTrigger>
                </NavbarItem>
                <DropdownMenu
                  aria-label={`${item.label} dropdown`}
                  itemClasses={{ base: 'gap-4' }}
                >
                  {item.children.map((child) => (
                    <DropdownItem
                      key={child.label}
                      description={child.description}
                      startContent={child.icon}
                      href={child.href}
                      className={`${itemRounded} ${hoverBgClass}`}
                    >
                      {child.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            );
          } else {
            // Simple link
            const isExternal = item.href.startsWith('http');
            return (
              <NavbarItem key={item.label}>
                <Button
                  as="a"
                  href={item.href}
                  variant="light"
                  className={`
              px-4 py-2 ${itemRounded}
              text-base text-inherit
              ${hoverBgClass}
              `}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  onPress={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Button>
              </NavbarItem>
            );
          }
        })}
      </NavbarContent>

      {/* ===== Desktop Right: External tools + theme + framework ===== */}
      <NavbarRightIcons />

      {/* ===== Mobile Menu Panel ===== */}
      <NavbarMenu>
        {/* 1) Projects (top-level links without children) */}
        {navItems.map((item) => {
          if (!Array.isArray(item.children)) {
            const isExternal = item.href.startsWith('http');
            return (
              <NavbarMenuItem key={item.label}>
                <NextLink
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    w-full flex items-center
                    ${mobileItemPadding} ${itemRounded}
                    text-inherit text-base
                    ${hoverBgClass}
                  `}
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            );
          }
          return null;
        })}

        {/* 2) Blog collapsible section */}
        {navItems.map((item) => {
          if (Array.isArray(item.children) && item.label === 'Blog') {
            return (
              <React.Fragment key={item.label}>
                <NavbarMenuItem>
                  <button
                    type="button"
                    onClick={() => setMobileBlogOpen((prev) => !prev)}
                    className={`
                      w-full flex items-center justify-between
                      ${mobileItemPadding} ${itemRounded}
                      text-inherit text-base font-medium
                      ${hoverBgClass}
                    `}
                  >
                    <span>Blog</span>
                    <ChevronDown
                      size={16}
                      fill="currentColor"
                      className={`transform transition-transform ${
                        mobileBlogOpen ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </button>
                </NavbarMenuItem>
                {mobileBlogOpen &&
                  item.children.map((child) => {
                    const childExternal = child.href.startsWith('http');
                    const isCurrent = false; // optionally detect current route
                    return (
                      <NavbarMenuItem key={child.label}>
                        <NextLink
                          href={child.href}
                          onClick={() => setIsMenuOpen(false)}
                          className={`
                            w-full flex items-center gap-2
                            pl-8 ${mobileItemPadding}
                            ${itemRounded}
                            ${
                              isCurrent
                                ? 'font-semibold bg-default/20 dark:bg-default/30'
                                : hoverBgClass
                            }
                            text-inherit text-base
                          `}
                          target={childExternal ? '_blank' : undefined}
                          rel={
                            childExternal ? 'noopener noreferrer' : undefined
                          }
                          aria-current={isCurrent ? 'page' : undefined}
                        >
                          <span className="flex-shrink-0">{child.icon}</span>
                          <span>{child.label}</span>
                        </NextLink>
                      </NavbarMenuItem>
                    );
                  })}
              </React.Fragment>
            );
          }
          return null;
        })}

        {/* 3) Frontend Framework collapsible */}
        <NavbarMenuItem>
          <button
            type="button"
            onClick={() => setMobileFrameworkOpen((prev) => !prev)}
            className={`
              w-full flex items-center justify-between
              ${mobileItemPadding} ${itemRounded}
              text-inherit text-base font-medium
              ${hoverBgClass}
            `}
          >
            <span>Frontend Framework</span>
            <ChevronDown
              size={16}
              fill="currentColor"
              className={`transform transition-transform ${
                mobileFrameworkOpen ? 'rotate-180' : 'rotate-0'
              }`}
            />
          </button>
        </NavbarMenuItem>
        {mobileFrameworkOpen &&
          frameworkSwitcher.options.map((option) => {
            const ext = option.href.startsWith('http');
            const isCurrent = option.label === frameworkSwitcher.current;
            return (
              <NavbarMenuItem key={option.label}>
                {option.disabled ? (
                  // render non-link
                  <div
                    className={`
                            w-full flex items-center
                            pl-8 ${mobileItemPadding}
                            ${itemRounded}
                            opacity-50 pointer-events-none cursor-not-allowed
                            text-inherit text-base
                          `}
                  >
                    {option.label}
                  </div>
                ) : (
                  // existing NextLink
                  <NextLink
                    href={option.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                            w-full flex items-center
                            pl-8 ${mobileItemPadding}
                            ${itemRounded}
                            ${
                              isCurrent
                                ? 'font-semibold bg-default/20 dark:bg-default/30'
                                : hoverBgClass
                            }
                            text-inherit text-base
                          `}
                    target={
                      option.href.startsWith('http') ? '_blank' : undefined
                    }
                    rel={
                      option.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                    aria-current={isCurrent ? 'page' : undefined}
                  >
                    {option.label}
                  </NextLink>
                )}
              </NavbarMenuItem>
            );
          })}

        {/* 4) External tool icons row */}
        <NavbarMenuItem>
          <div className="px-4 py-3 flex items-center space-x-4">
            {externalTools.map((tool) => (
              <NextLink
                key={tool.alt}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMenuOpen(false)}
                className={`
                  flex items-center justify-center
                  ${iconBtnSizeClass} ${itemRounded} ${hoverBgClass}
                `}
                aria-label={tool.ariaLabel}
              >
                {tool.lightSrc && tool.darkSrc ? (
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
                ) : tool.src ? (
                  <Image
                    src={tool.src}
                    alt={tool.alt}
                    width={tool.size ?? 24}
                    height={tool.size ?? 24}
                    priority={false}
                  />
                ) : null}
              </NextLink>
            ))}
          </div>
        </NavbarMenuItem>
      </NavbarMenu>
    </HeroNavbar>
  );
};
