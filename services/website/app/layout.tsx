import './global.css';
import { Providers } from './providers';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import Script from 'next/script';
import { siteOrigin } from './data/site';

export const metadata = {
  title: 'Craig Watt — Platform Engineer focused on Observability',
  description:
    'Building reliable platforms with observability, automation, Kubernetes, Terraform, and CI/CD.',
  metadataBase: new URL(siteOrigin),
  openGraph: {
    title: 'Craig Watt — Platform Engineer focused on Observability',
    description:
      'Building reliable platforms with observability, automation, Kubernetes, Terraform, and CI/CD.',
    url: siteOrigin,
    siteName: 'Craig Watt',
    images: [
      {
        url: `${siteOrigin}/images/og/craig-watt-share-card-v2.png`,
        width: 1200,
        height: 630,
        alt: 'Craig Watt brand card with circular avatar and name',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Craig Watt — Platform Engineer focused on Observability',
    description:
      'Building reliable platforms with observability, automation, Kubernetes, Terraform, and CI/CD.',
    images: [`${siteOrigin}/images/og/craig-watt-share-card-v2.png`],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* THIS MUST RUN BEFORE ANY CSS OR HYDRATION */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (
                    theme === 'dark' ||
                    (!theme &&
                      window.matchMedia('(prefers-color-scheme: dark)').matches)
                  ) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />    
        {siteKey && (
          <Script
            src={`https://www.google.com/recaptcha/api.js?render=${siteKey}`}
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)]">
        <Providers>
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
