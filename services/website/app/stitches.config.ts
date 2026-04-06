// apps/nextjs-app/stitches.config.ts
import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  theme,
  createTheme,
  globalCss,
  keyframes,
  getCssText,
  config,
} = createStitches({
  theme: {
    colors: {
      primary: '#2563eb', // Tailwind blue-600
      secondary: '#9333ea', // Tailwind purple-600
      accent: '#14b8a6', // Tailwind teal-500
      background: '#f9fafb', // Tailwind gray-50
      foreground: '#111827', // Tailwind gray-900
    },
    fonts: {
      body: 'system-ui, sans-serif',
      mono: 'Menlo, monospace',
    },
    space: {
      sm: '0.5rem',
      md: '1rem',
      lg: '2rem',
    },
    radii: {
      sm: '0.375rem',
      md: '0.5rem',
      lg: '0.75rem',
    },
  },
});
