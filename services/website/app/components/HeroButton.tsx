import React from 'react';
import { Button } from '@heroui/react';

export const HeroButton = (props: React.ComponentProps<typeof Button>) => {
  return <Button {...props} />;
};
