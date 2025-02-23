// apps/nextjs-app/app/components/HeroButton.stories.tsx
import React from 'react';
import { Meta, Story } from '@storybook/react';
import { CustomHeroButton } from './HeroButton';

export default {
  title: 'Components/HeroButton',
  component: CustomHeroButton,
} as Meta;

const Template: Story = (args) => <CustomHeroButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  // You can set default props here
};
