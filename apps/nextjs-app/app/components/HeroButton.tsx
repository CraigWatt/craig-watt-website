// apps/nextjs-app/app/components/HeroButton.tsx
import React from 'react';
import { Button as HeroButton } from '@heroui/react';

export const CustomHeroButton: React.FC<
  React.ComponentProps<typeof HeroButton>
> = (props) => {
  return <HeroButton {...props}>Click Me!</HeroButton>;
};
