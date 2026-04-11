import { BadgeCheck, BriefcaseBusiness, FileText, MonitorSmartphone } from 'lucide-react';
import type { ReactNode } from 'react';

export type TimelineEntry = {
  id: string;
  period: string;
  title: string;
  organisation: string;
  location: string;
  engagement: string;
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
  'Concourse CI',
  'Prometheus',
  'Grafana',
  'Loki',
  'Tempo',
  'Telegraf',
  'Ansible',
  'AWX',
  'Python',
  'C',
  'GitHub Actions',
  'Docker',
  'k3s',
];

export const experienceTimeline: TimelineEntry[] = [
  {
    id: 'sky',
    period: 'Mar 2026 - Present',
    title: 'Content Platform Engineering Specialist',
    organisation: 'Sky',
    location: 'London Area, United Kingdom',
    engagement: 'Full-time · Remote',
    summary:
      'I work on broadcast-critical content platform systems with an observability-first mindset.',
    bullets: [
      'Own monitoring, telemetry, and automation for content platforms that need to stay visible and reliable.',
      'Use Grafana, Telegraf, Docker, Kubernetes, Terraform, Ansible, and Concourse CI as part of the daily platform toolbox.',
      'Focus on practical observability that helps people spot problems early and keep delivery predictable.',
    ],
    tags: ['Grafana', 'Telegraf', 'Kubernetes', 'Terraform'],
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
  {
    id: 'sky-content-systems-engineering-specialist',
    period: 'Jan 2024 - Mar 2026',
    title: 'Content Systems Engineering Specialist Engineer',
    organisation: 'Sky',
    location: 'Greater London, England, United Kingdom',
    engagement: 'Full-time · Hybrid',
    summary:
      'Deployed monitoring and telemetry for broadcast-critical platforms and modernised the observability stack.',
    bullets: [
      'Standardised hybrid AWS/on-prem deployments with IaC using Terraform, Ansible, and Concourse CI.',
      'Built Python exporters to integrate legacy APIs and message queues into observability pipelines.',
      'Migrated Prometheus, Grafana, Loki, Tempo, and Telegraf to Kubernetes to improve scalability, security, and costs.',
    ],
    tags: ['Prometheus', 'Grafana', 'Loki', 'Tempo', 'Telegraf'],
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
  {
    id: 'sky-content-systems-engineering-support',
    period: 'Mar 2023 - Jan 2024',
    title: 'Content Systems Engineering Support Engineer',
    organisation: 'Sky',
    location: 'Greater London, England, United Kingdom',
    engagement: 'Full-time · On-site',
    summary:
      'Delivered 24/7 support for media asset management and content platforms, turning incidents into platform improvements.',
    bullets: [
      'Proactively monitored performance and prevented incidents through data analysis and operational awareness.',
      'Resolved AWS and on-prem issues with scripting and root-cause analysis.',
      'Contributed automation and monitoring improvements across teams, leading to promotion.',
    ],
    tags: ['AWS', 'Monitoring', 'Git', 'Scripting'],
    icon: <BriefcaseBusiness className="h-5 w-5" />,
  },
  {
    id: 'open-source',
    period: 'Nov 2021 - Mar 2023',
    title: 'Open Source Software Engineer',
    organisation: 'Freelance',
    location: 'Remote',
    engagement: 'Freelance',
    summary:
      'Built vfo and contributed to open source to sharpen systems thinking and delivery discipline.',
    bullets: [
      'Built vfo, a C/FFmpeg batch encoder with device-aware processing.',
      'Contributed to open source in C, React, Next.js, and TypeScript.',
      'Used portfolio projects to secure the engineering role at Sky.',
    ],
    tags: ['C', 'FFmpeg', 'React', 'Next.js', 'TypeScript'],
    href: '/projects/vfo',
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    id: 'zudu-product',
    period: 'Oct 2019 - Nov 2021',
    title: 'Software Product Manager',
    organisation: 'Zudu | Award Winning Int’l Digital Agency | Apps | Websites | Digital Marketing',
    location: 'Greater Dundee Area',
    engagement: 'Full-time · On-site',
    summary:
      'Directed delivery of SaaS platforms and introduced process discipline across product and delivery.',
    bullets: [
      'Directed delivery of SaaS platforms, including web and mobile products such as Talbase recruitment software.',
      'Defined product roadmaps and collaborated cross-functionally to ship features.',
      'Introduced Agile practices and Jira workflows across teams.',
    ],
    tags: ['Scrum', 'Agile', 'Jira', 'Product Delivery'],
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'mtc',
    period: 'Jun 2016 - Apr 2017',
    title: 'Frontend Web Developer',
    organisation: 'mtc.',
    location: 'Greater Dundee Area',
    engagement: 'Full-time · On-site',
    summary:
      'Built responsive websites and apps with JavaScript, HTML5, and CSS in a fast-paced agency environment.',
    bullets: [
      'Built responsive websites and applications with JavaScript, HTML5, and CSS.',
      'Delivered multiple client projects under agency deadlines.',
    ],
    tags: ['JavaScript', 'HTML5', 'CSS', 'Responsive Design'],
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    id: 'dundee-tutor',
    period: 'Sep 2015 - May 2016',
    title: 'Tutor',
    organisation: 'The University of Dundee',
    location: 'Greater Dundee Area',
    engagement: 'Part-time · On-site',
    summary:
      'Delivered computing tutorials and labs for undergraduate students.',
    bullets: [
      'Supported coursework in web development and programming fundamentals.',
      'Helped students work through labs, assignments, and practical exercises.',
    ],
    tags: ['Teaching', 'Programming', 'Labs'],
    icon: <BadgeCheck className="h-5 w-5" />,
  },
  {
    id: 'zudu-junior',
    period: 'Sep 2015 - Mar 2016',
    title: 'Junior Developer',
    organisation: 'Zudu',
    location: 'Greater Dundee Area',
    engagement: 'Full-time',
    summary:
      'Assisted in full-stack web and mobile app development while learning production delivery.',
    bullets: [
      'Supported full-stack web and mobile application development.',
      'Contributed to internal projects and agency client work.',
    ],
    tags: ['Full-Stack Development', 'Mobile Application Development', 'JavaScript'],
    icon: <MonitorSmartphone className="h-5 w-5" />,
  },
  {
    id: 'zudu-intern',
    period: 'Jul 2015 - Sep 2015',
    title: 'Internship',
    organisation: 'Zudu',
    location: 'Greater Dundee Area',
    engagement: 'Internship',
    summary:
      'Supported development projects and gained experience in modern frameworks.',
    bullets: [
      'Helped on full-stack web and mobile development tasks.',
      'Learned practical delivery habits from the team’s production workflow.',
    ],
    tags: ['Full-Stack Development', 'Mobile Application Development', 'Learning'],
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
