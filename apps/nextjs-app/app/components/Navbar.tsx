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
  Link,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from '@heroui/react';
import { ChevronDown } from './icons';
import { navItems, frameworkSwitcher } from '../config/nav.config';
import { ThemeSwitcher } from './ThemeSwitcher';
import Image from 'next/image';

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
          <Link href="/" className="flex items-center space-x-2 text-inherit">
            <div className="relative h-10 w-10 rounded-full overflow-hidden">
              <Image
                src="/images/avatar.jpg"
                alt="Craig Watt’s avatar"
                fill
                sizes="40px"
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
            <span className="font-bold">Craig Watt</span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Center: Desktop Menu */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItems.map((item) =>
          item.children ? (
            <Dropdown key={item.label}>
              <NavbarItem>
                <DropdownTrigger>
                  <Button
                    disableRipple
                    className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                    endContent={<ChevronDown fill="currentColor" size={16} />}
                    radius="sm"
                    variant="light"
                  >
                    {item.label}
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
          ) : (
            <NavbarItem key={item.label}>
              <Link
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </Link>
            </NavbarItem>
          )
        )}
      </NavbarContent>

      {/* Right: Framework Switcher */}
      <NavbarContent justify="end">
        <NavbarItem className="hidden sm:flex">
          <ThemeSwitcher />
        </NavbarItem>

        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                variant="light"
                className="text-sm font-semibold capitalize"
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

      {/* Mobile Menu */}
      <NavbarMenu>
        {navItems.map((item) =>
          item.children ? (
            item.children.map((child) => (
              <NavbarMenuItem key={child.label}>
                <Link href={child.href} className="w-full" size="lg">
                  {child.label}
                </Link>
              </NavbarMenuItem>
            ))
          ) : (
            <NavbarMenuItem key={item.label}>
              <Link
                href={item.href}
                className="w-full"
                size="lg"
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                {item.label}
              </Link>
            </NavbarMenuItem>
          )
        )}
      </NavbarMenu>
    </HeroNavbar>
  );
};
