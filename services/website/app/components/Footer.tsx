import Image from 'next/image';
import { Github, Linkedin, ExternalLink } from 'lucide-react';
import { Button } from '@heroui/react';
import { siteTechStack } from '../data/profile';
import { TechIconRow } from './TechIconRow';
import { siteUrl } from '../data/site';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/CraigWatt',
    icon: Github,
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/craigwatt-dev/',
    icon: Linkedin,
  },
];

const navLinks = [
  { label: 'Projects', href: '/projects' },
  { label: 'Experience', href: '/experience' },
  { label: 'Credentials', href: '/credentials' },
  { label: 'Writing', href: '/blog' },
  { label: 'Trading', href: '/trading212' },
];

export function Footer() {
  return (
    <footer className="site-footer print:hidden border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-24 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 md:col-span-5 space-y-6">
            <a href={siteUrl('/')} className="inline-flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-full overflow-hidden ring-1 ring-[var(--color-border)]">
                <Image
                  src="/images/avatar.jpg"
                  alt="Craig Watt"
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
              <span className="font-semibold text-[var(--color-foreground)] group-hover:text-[var(--color-accent)] transition-colors">
                Craig Watt
              </span>
            </a>
            <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs leading-relaxed">
              Platform Engineer focused on observability, automation, and reliable delivery.
            </p>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider">
                Website stack
              </h4>
              <TechIconRow icons={siteTechStack} size={20} tileClassName="h-9 w-9" />
            </div>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={siteUrl(link.href)}
                    className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <Button
                as="a"
                href={siteUrl('/cv')}
                variant="flat"
                className="border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-foreground)] hover:bg-[var(--color-background)]"
              >
                Export as CV
              </Button>
            </div>
          </div>

          {/* Social Column */}
          <div className="md:col-span-4">
            <h4 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors group"
                  >
                    <link.icon className="w-4 h-4" />
                    <span>{link.label}</span>
                    <ExternalLink className="w-3 h-3 opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--color-border)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-[var(--color-muted)]">
              {new Date().getFullYear()} Craig Watt. All rights reserved.
            </p>

            {/* reCAPTCHA disclosure */}
            <p className="text-xs text-[var(--color-muted)] max-w-md leading-relaxed">
              Protected by reCAPTCHA.{' '}
              <a
                href="https://policies.google.com/privacy"
                className="hover:text-[var(--color-accent)] transition-colors underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy
              </a>
              {' '}&{' '}
              <a
                href="https://policies.google.com/terms"
                className="hover:text-[var(--color-accent)] transition-colors underline underline-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
