// app/components/ThemeSwitcher.tsx
'use client';

import { Button } from '@heroui/react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">
        Current theme: <strong>{theme}</strong>
      </span>
      <Button variant="ghost" onPress={() => setTheme('light')}>
        Light
      </Button>
      <Button variant="ghost" onPress={() => setTheme('dark')}>
        Dark
      </Button>
    </div>
  );
}
