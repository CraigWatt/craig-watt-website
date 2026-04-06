// apps/nextjs-app/app/components/Button.tsx
'use client';

import { styled } from '../stitches.config';

export const Button = styled('button', {
  all: 'unset',
  borderRadius: '$md',
  padding: '$md $lg',
  fontWeight: 500,
  fontSize: '1rem',
  lineHeight: 1.5,
  backgroundColor: '$primary',
  color: 'white',
  cursor: 'pointer',
  transition: 'background-color 0.2s ease',

  '&:hover': {
    backgroundColor: '$secondary',
  },
});
