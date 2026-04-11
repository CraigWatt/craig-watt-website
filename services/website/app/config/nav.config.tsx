import { ReactNode } from 'react';

// Define types for navigation items
export type NavLink = {
  label: string;
  href: string;
  external?: boolean;
  children?: undefined;
};

export type NavGroup = {
  label: string;
  children: Array<
    NavLink & {
      description: string;
      icon: ReactNode;
    }
  >;
};

export type NavItem = {
  label: string;
  href: string;
  children?: Array<{
    label: string;
    href: string;
    description: string;
    icon: ReactNode;
  }>;
};

import { ReceiptTextIcon, CpuIcon, CookingPotIcon } from '../components/icons';

export const navItems: NavItem[] = [
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Credentials',
    href: '/credentials',
  },
  {
    label: 'Experience',
    href: '/experience',
  },
  {
    label: 'CV',
    href: '/cv',
  },
  {
    label: 'Writing',
    href: '/blog',
    children: [
      {
        label: 'All Writing',
        href: '/blog',
        description: 'Technical notes, case studies, and a few personal posts',
        icon: (
          <ReceiptTextIcon
            className="text-secondary"
            fill="currentColor"
            size={30}
          />
        ),
      },
      {
        label: 'Tech',
        href: '/blog?category=Tech',
        description: 'System notes, experiments, and project write-ups',
        icon: (
          <CpuIcon className="text-secondary" fill="currentColor" size={30} />
        ),
      },
      {
        label: 'Cooking & Recipes',
        href: '/blog?category=Cooking',
        description: 'Personal recipes and slow-cooker experiments',
        icon: (
          <CookingPotIcon
            className="text-primary"
            fill="currentColor"
            size={30}
          />
        ),
      },
    ],
  },
];

export const frameworkSwitcher = {
  current: 'Next.js',
  options: [
    { label: 'Next.js', href: '/' },
    { label: 'Vue', href: 'https://your-vue-site.com', disabled: true },
    { label: 'Svelte', href: 'https://your-svelte-site.com', disabled: true },
  ],
};
