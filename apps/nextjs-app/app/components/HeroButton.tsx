// apps/nextjs-app/app/components/HeroButton.tsx
import React from 'react';
import { Button } from '@heroui/react';

export const HeroButton = (props: React.ComponentProps<typeof Button>) => {
  return (
    <Button color="primary" {...props}>
      Hero Button
    </Button>
  );
};
