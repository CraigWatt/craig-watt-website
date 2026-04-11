// app/components/ThemeSwitcher.tsx
'use client';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Button } from '@heroui/react';
import { Moon, Sun } from 'lucide-react';

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <Button
      isIconOnly
      variant="flat"
      aria-label="Toggle theme"
      onPress={() => setTheme(isDark ? 'light' : 'dark')}
      className={`h-10 w-10 min-w-10 rounded-medium bg-[var(--color-card)] border border-[var(--color-border)] hover:bg-[var(--color-background)] ${className ?? ''}`}
    >
      {isDark ? (
        <Sun size={20} className="text-[var(--color-foreground)]" />
      ) : (
        <Moon size={20} className="text-[var(--color-foreground)]" />
      )}
    </Button>
  );
}
