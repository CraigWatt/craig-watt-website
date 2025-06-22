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
  // {
  //   label: 'CV',
  //   href: '/cv',
  // },
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Blog',
    href: '/blog',
    children: [
      {
        label: 'All Posts',
        href: '/blog',
        description: 'View them all',
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
        description: 'Technical musings and more',
        icon: (
          <CpuIcon className="text-secondary" fill="currentColor" size={30} />
        ),
      },
      {
        label: 'Cooking & Recipes',
        href: '/blog?category=Cooking',
        description: 'Slow cooker ideas and food hacks',
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
    { label: 'Vue', href: 'https://your-vue-site.com' },
    { label: 'Svelte', href: 'https://your-svelte-site.com' },
  ],
};
