import Link from 'next/link';
import Image from 'next/image';
import { Github, ExternalLink } from 'lucide-react';

const socialLinks = [
  {
    label: 'GitHub',
    href: 'https://github.com/CraigWatt',
    icon: Github,
  },
  {
    label: 'Grafana',
    href: 'https://craigwatt.grafana.net/public-dashboards/9f96dfe163484bafbccb7f825a506899',
    iconSrc: '/icons/grafana.svg',
  },
];

const navLinks = [
  { label: 'Projects', href: '/projects' },
  { label: 'Experience', href: '/experience' },
  { label: 'Credentials', href: '/credentials' },
  { label: 'CV', href: '/cv' },
  { label: 'Writing', href: '/blog' },
  { label: 'Trading', href: '/trading212' },
];

export function Footer() {
  return (
    <footer className="site-footer print:hidden border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-6 md:px-12 lg:px-24 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="md:col-span-5 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3 group">
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
            </Link>
            <p className="text-sm text-[var(--color-muted-foreground)] max-w-xs leading-relaxed">
              Platform Engineer focused on observability, automation, and reliable delivery.
            </p>
          </div>

          {/* Navigation Column */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-[var(--color-foreground)] uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-accent)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
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
                    {link.icon ? (
                      <link.icon className="w-4 h-4" />
                    ) : link.iconSrc ? (
                      <Image
                        src={link.iconSrc}
                        alt={link.label}
                        width={16}
                        height={16}
                        className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                    ) : null}
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
