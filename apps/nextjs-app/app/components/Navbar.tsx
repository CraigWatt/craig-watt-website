'use client';

import React from 'react';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from '@heroui/react';
import { ChevronDown } from './icons';
import { navItems } from '../config/nav.config';
import { NavbarRightIcons } from './NavbarRightIcons';
import Image from 'next/image';
import NextLink from 'next/link';

export const Navbar = () => {
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
          <NavbarItem asChild>
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
            // Dropdown trigger: use variant="light"
            return (
              <Dropdown key={item.label}>
                <NavbarItem asChild>
                  <DropdownTrigger asChild>
                    <Button
                      as="button"
                      variant="light"
                      className="flex items-center space-x-1 p-0 border-none focus:ring-0"
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
              <NavbarItem asChild key={item.label}>
                <Button
                  as="a"
                  href={item.href}
                  variant="light"
                  className="p-0 border-none focus:ring-0"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </Button>
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
                  <Button
                    as="a"
                    href={child.href}
                    variant="ghost"
                    className="w-full justify-start p-0 border-none focus:ring-0"
                    target={isExternal ? '_blank' : undefined}
                    rel={isExternal ? 'noopener noreferrer' : undefined}
                    size="lg"
                  >
                    {child.label}
                  </Button>
                </NavbarMenuItem>
              );
            });
          } else {
            const isExternal = item.href.startsWith('http');
            return (
              <NavbarMenuItem key={item.label}>
                <Button
                  as="a"
                  href={item.href}
                  variant="ghost"
                  className="w-full justify-start p-0 border-none focus:ring-0"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                  size="lg"
                >
                  {item.label}
                </Button>
              </NavbarMenuItem>
            );
          }
        })}
      </NavbarMenu>
    </HeroNavbar>
  );
};
