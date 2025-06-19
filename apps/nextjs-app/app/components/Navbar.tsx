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
} from '@heroui/react';
import { ChevronDown } from './icons';
import { navItems } from '../config/nav.config';
import { NavbarRightIcons } from './NavbarRightIcons';
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
        {navItems.map((item) => {
          if (Array.isArray(item.children)) {
            return (
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
            );
          } else {
            const isExternal = item.href.startsWith('http');
            return (
              <NavbarItem key={item.label}>
                <Link
                  href={item.href}
                  className="text-inherit"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </Link>
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
            return item.children.map((child) => (
              <NavbarMenuItem key={child.label}>
                <Link
                  href={child.href}
                  className="w-full text-inherit"
                  size="lg"
                >
                  {child.label}
                </Link>
              </NavbarMenuItem>
            ));
          } else {
            const isExternal = item.href.startsWith('http');
            return (
              <NavbarMenuItem key={item.label}>
                <Link
                  href={item.href}
                  className="w-full text-inherit"
                  size="lg"
                  target={isExternal ? '_blank' : undefined}
                  rel={isExternal ? 'noopener noreferrer' : undefined}
                >
                  {item.label}
                </Link>
              </NavbarMenuItem>
            );
          }
        })}
      </NavbarMenu>
    </HeroNavbar>
  );
};
