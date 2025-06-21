// app/components/Navbar.tsx
'use client';

import React from 'react';
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
} from '@heroui/react';
import { ChevronDown } from './icons';
import { navItems } from '../config/nav.config';
import { NavbarRightIcons } from './NavbarRightIcons';

export const Navbar = () => {
  // now this hook is valid because of 'use client' above
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <HeroNavbar onMenuOpenChange={setIsMenuOpen}>
      {/* Left: Logo / Home */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <NavbarItem>
            <NextLink
              href="/"
              className="group flex items-center space-x-2 p-0"
            >
              <div
                className="
                  relative h-10 w-10 rounded-full overflow-hidden
                  transition-shadow transition-filter
                  group-hover:shadow-outline
                  group-hover:brightness-90
                "
              >
                <Image
                  src="/images/avatar.jpg"
                  alt="Craig Watt’s avatar"
                  fill
                  sizes="40px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <span className="font-bold transition-opacity group-hover:opacity-80">
                Craig Watt
              </span>
            </NextLink>
          </NavbarItem>
        </NavbarBrand>
      </NavbarContent>

      {/* Center: Desktop Menu */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item) => {
          if (Array.isArray(item.children)) {
            return (
              <Dropdown key={item.label}>
                <NavbarItem>
                  <DropdownTrigger>
                    <button
                      className="flex items-center space-x-1 p-0 border-none focus:ring-0 text-inherit text-base"
                      aria-label={`${item.label} menu`}
                      type="button"
                    >
                      <span>{item.label}</span>
                      <ChevronDown size={16} />
                    </button>
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
                    >
                      {child.label}
                    </DropdownItem>
                  ))}
                </DropdownMenu>
              </Dropdown>
            );
          } else {
            const isExternal = item.href.startsWith('http');
            return (
              <NavbarItem key={item.label}>
                <NextLink
                  href={item.href}
                  className="text-inherit text-base p-0"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </NextLink>
              </NavbarItem>
            );
          }
        })}
      </NavbarContent>

      {/* Right: External tools + theme + framework */}
      <NavbarRightIcons />

      {/* Mobile Menu */}
      <NavbarMenu>
        {navItems.map((item) => {
          if (Array.isArray(item.children)) {
            return item.children.map((child) => {
              const isExternal = child.href.startsWith('http');
              return (
                <NavbarMenuItem key={child.label}>
                  <NextLink
                    href={child.href}
                    className="w-full text-inherit text-base p-0 text-left"
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                  >
                    {child.label}
                  </NextLink>
                </NavbarMenuItem>
              );
            });
          } else {
            const isExternal = item.href.startsWith('http');
            return (
              <NavbarMenuItem key={item.label}>
                <NextLink
                  href={item.href}
                  className="w-full text-inherit text-base p-0 text-left"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </NextLink>
              </NavbarMenuItem>
            );
          }
        })}
      </NavbarMenu>
    </HeroNavbar>
  );
};
