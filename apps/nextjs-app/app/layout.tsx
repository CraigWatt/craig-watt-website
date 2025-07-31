// app/layout.tsx
import './global.css';
import { Providers } from './providers';
import { Navbar } from './components/Navbar';
import Script from 'next/script';

export const metadata = {
  title: 'Craig Watt — Observability Engineer',
  description:
    'Building scalable monitoring with Grafana, writing about code & tackling hard challenges.',
  openGraph: {
    title: 'Craig Watt — Observability Engineer',
    description:
      'Building scalable monitoring with Grafana, writing about code & tackling hard challenges.',
    url: 'https://craigwatt.co.uk',
    siteName: 'Craig Watt Website',
    images: [
      {
        url: 'https://craigwatt.co.uk/images/avatar.jpg',
        width: 1200,
        height: 630,
        alt: 'Craig Watt avatar & code screenshot',
      },
    ],
    locale: 'en_GB',
    type: 'website',
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
      <body className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
