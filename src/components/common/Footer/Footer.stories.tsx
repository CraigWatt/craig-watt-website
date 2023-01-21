import React from 'react';
import { Meta, Story } from '@storybook/react';
import Footer from './index'
import { FooterProps } from './index';

export default {
  component: Footer,
} as Meta<FooterProps>

const Template: Story<FooterProps> = (args) => <Footer {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  
};

export const Secondary = Template.bind({});
Secondary.args = {
  
};
