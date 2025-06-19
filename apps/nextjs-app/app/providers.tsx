// app/providers.tsx
'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { HeroUIProvider } from '@heroui/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // toggles class="dark" on <html>
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {/* HeroUIProvider just needs to wrap children */}
      <HeroUIProvider>{children}</HeroUIProvider>
    </NextThemesProvider>
  );
}
