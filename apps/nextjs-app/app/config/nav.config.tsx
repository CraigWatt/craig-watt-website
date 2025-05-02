import { Activity, Flash, Scale, Server, TagUser } from '../components/icons';

export const navItems = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'CV',
    href: '/cv',
  },
  {
    label: 'Projects',
    href: '/projects',
  },
  {
    label: 'Blog',
    children: [
      {
        label: 'All Posts',
        href: '/blog',
        description: 'Technical musings and more',
        icon: (
          <Activity className="text-secondary" fill="currentColor" size={30} />
        ),
      },
      {
        label: 'Cooking & Recipes',
        href: '/blog/recipes',
        description: 'Slow cooker ideas and food hacks',
        icon: <Flash className="text-primary" fill="currentColor" size={30} />,
      },
    ],
  },
  {
    label: 'Grafana',
    href: 'https://your-grafana-url.com',
    external: true,
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
