import { BadgeCheck, BriefcaseBusiness, FileText, MonitorSmartphone } from 'lucide-react';
import type { ReactNode } from 'react';

export type TimelineEntry = {
  id: string;
  period: string;
  kind: 'role' | 'project';
  title: string;
  organisation: string;
  summary: string;
  bullets: string[];
  tags: string[];
  href?: string;
  icon?: ReactNode;
};

export type CredentialSection = {
  id: string;
  title: string;
  summary: string;
  items: string[];
  icon: ReactNode;
};

export const profilePositioning = {
  title: 'Platform Engineer focused on observability',
  summary:
    'I build and operate production platforms that stay observable, automatable, and easy to ship.',
};

export const coreSkills = [
  'Observability',
  'Automation',
  'AWS',
  'Kubernetes',
  'Terraform',
  'GitHub Actions',
  'Docker',
  'Next.js',
  'MDX',
  'Python',
  'C',
  'Ansible',
  'k3s',
];

export const experienceTimeline: TimelineEntry[] = [
  {
    id: 'sky',
    period: 'Current',
    kind: 'role',
    title: 'Observability Engineer',
    organisation: 'Sky',
    summary:
      'I help keep media-asset platforms reliable, visible, and ready to scale.',
    bullets: [
      'Work on monitoring and automation around production systems that need to stay predictable.',
      'Use Grafana, Telegraf, Docker, Kubernetes, and Terraform as part of the day-to-day platform toolbox.',
      'Focus on practical observability that helps people spot problems early and ship with confidence.',
    ],
    tags: ['Grafana', 'Telegraf', 'Kubernetes', 'Terraform'],
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
  {
    id: 'website',
    period: 'Selected build',
    kind: 'project',
    title: 'Craig Watt Website',
    organisation: 'Personal platform',
    summary:
      'A live portfolio, writing platform, and deployment showcase that I can evolve myself.',
    bullets: [
      'Built with Next.js, MDX, AWS, and GitHub Actions so the site stays content-driven and maintainable.',
      'Treats deployment, contact handling, and content publishing as part of the product.',
      'Acts as a compact demonstration of how I structure, ship, and operate a small platform.',
    ],
    tags: ['Next.js', 'MDX', 'AWS', 'GitHub Actions'],
    href: '/projects/craig-watt-website',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    id: 'stream',
    period: 'Selected build',
    kind: 'project',
    title: 'stream.craigwatt.win',
    organisation: 'Homelab platform',
    summary:
      'A self-hosted streaming stack on Raspberry Pi k3s that behaves like a small production system.',
    bullets: [
      'Uses Kubernetes, Ansible, Traefik, MetalLB, and persistent storage to keep the platform orderly.',
      'Designed around repeatability, resilience, and predictable local networking.',
      'Shows how I approach infrastructure when I want it to be reliable instead of handcrafted.',
    ],
    tags: ['Kubernetes', 'Ansible', 'Jellyfin', 'Traefik'],
    href: '/projects/stream-craigwatt-win',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    id: 'trading212',
    period: 'Selected build',
    kind: 'project',
    title: 'Trading212 Dashboard',
    organisation: 'Data and caching exercise',
    summary:
      'A dashboard that explores API resilience, caching, and graceful fallback behaviour.',
    bullets: [
      'Built to stay useful when upstream responses are slow or unavailable.',
      'Shows how I think about real-world failure modes and user experience together.',
      'Useful proof that the engineering focus is on reliability, not just the happy path.',
    ],
    tags: ['Caching', 'APIs', 'Resilience', 'UX'],
    href: '/trading212',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    id: 'vfo',
    period: 'Selected build',
    kind: 'project',
    title: 'vfo',
    organisation: 'C utility',
    summary:
      'A command-line tool for batch-encoding video files with predictable operator ergonomics.',
    bullets: [
      'Keeps repetitive encoding work deterministic and easier to reason about.',
      'Shows a willingness to build small, focused tools when they save time.',
      'Good example of designing for a clean user experience even in a low-level tool.',
    ],
    tags: ['C', 'ffmpeg', 'CLI', 'Automation'],
    href: '/projects/vfo',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
];

export const credentialSections: CredentialSection[] = [
  {
    id: 'cloud',
    title: 'Cloud certifications',
    summary:
      'A tidy place for AWS and other cloud certs, with issue dates and renewal details once you add them.',
    items: [
      'AWS certification name',
      'Issue date',
      'Expiry date or renewal status',
    ],
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    id: 'awards',
    title: 'Awards and recognition',
    summary:
      'Use this section for Oracle awards, employer recognition, or anything else that adds external proof.',
    items: [
      'Award name',
      'Issuer',
      'What it was for',
    ],
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'badges',
    title: 'Training and badges',
    summary:
      'Short-form badges, courses, and internal training completions can live here as a quick reference.',
    items: [
      'Badge or course name',
      'Provider',
      'Completion date',
    ],
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
];
