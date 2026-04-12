import { Meta, StoryObj } from '@storybook/react';
import { HeroButton } from './HeroButton';

const meta: Meta<typeof HeroButton> = {
  title: 'Components/HeroButton',
  component: HeroButton,
};

export default meta;

type Story = StoryObj<typeof HeroButton>;

export const Default: Story = {
  args: {},
};
