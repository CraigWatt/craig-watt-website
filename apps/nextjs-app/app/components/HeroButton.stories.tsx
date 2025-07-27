// apps/nextjs-app/app/components/HeroButton.stories.tsx
// import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { HeroButton } from './HeroButton'; // Updated name

const meta: Meta<typeof HeroButton> = {
  title: 'Components/HeroButton',
  component: HeroButton,
};

export default meta;

type Story = StoryObj<typeof HeroButton>;

export const Default: Story = {
  args: {
    // Set any default props here
  },
};
