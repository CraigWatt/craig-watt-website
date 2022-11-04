import React from 'react';
import { Meta, Story } from '@storybook/react';
import { SiteLayout, SiteLayoutProps } from './index';

const meta: Meta = {
  title: 'SiteLayout',
  component: SiteLayout,
  argTypes: {
    children: {
      control: {
        type: 'text',
      },
    },
  },
  parameters: {
    controls: { expanded: true },
  },
};

export default meta;

const Template: Story<SiteLayoutProps> = (args) => <SiteLayout {...args} />;

// By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// https://storybook.js.org/docs/react/workflows/unit-testing
export const Default = Template.bind({});

Default.args = {};