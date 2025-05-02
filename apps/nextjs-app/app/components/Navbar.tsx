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
import { ChevronDown } from './icons/ChevronDown';
import { AcmeLogo } from './icons/AcmeLogo';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const mobileMenuItems = [
    'Profile',
    'Dashboard',
    'Activity',
    'Analytics',
    'System',
    'Deployments',
    'My Settings',
    'Team Settings',
    'Help & Feedback',
    'Log Out',
  ];

  return (
    <HeroNavbar onMenuOpenChange={setIsMenuOpen}>
      {/* Left: Logo and Mobile Toggle */}
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          className="sm:hidden"
        />
        <NavbarBrand>
          <AcmeLogo />
          <p className="font-bold text-inherit ml-2">MySite</p>
        </NavbarBrand>
      </NavbarContent>

      {/* Center: Desktop Menu */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <Dropdown>
          <NavbarItem>
            <DropdownTrigger>
              <Button
                disableRipple
                className="p-0 bg-transparent data-[hover=true]:bg-transparent"
                endContent={<ChevronDown fill="currentColor" size={16} />}
                radius="sm"
                variant="light"
              >
                Features
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            aria-label="Site features"
            itemClasses={{ base: 'gap-4' }}
          >
            <DropdownItem
              key="autoscaling"
              description="Scales apps based on demand"
            >
              Autoscaling
            </DropdownItem>
            <DropdownItem
              key="usage_metrics"
              description="Real-time insights to debug and improve"
            >
              Usage Metrics
            </DropdownItem>
            <DropdownItem
              key="production_ready"
              description="Ready for serious workloads"
            >
              Production Ready
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>

        <NavbarItem isActive>
          <Link aria-current="page" href="#">
            Customers
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#">
            Integrations
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Right: Auth actions */}
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link href="#">Login</Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color="primary" href="#" variant="flat">
            Sign Up
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Dropdown Menu */}
      <NavbarMenu>
        {mobileMenuItems.map((item, index) => (
          <NavbarMenuItem key={`${item}-${index}`}>
            <Link
              className="w-full"
              color={
                index === 2
                  ? 'primary'
                  : index === mobileMenuItems.length - 1
                  ? 'danger'
                  : 'foreground'
              }
              href="#"
              size="lg"
            >
              {item}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
    </HeroNavbar>
  );
};
