// app/layout.tsx
import './global.css';
import { Providers } from './providers';
import { Navbar } from './components/Navbar';
import Script from 'next/script';

export const metadata = {
  title: 'Welcome to nextjs-app',
  description: '…',
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
