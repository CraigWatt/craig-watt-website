import React from 'react';
import { Meta, Story } from '@storybook/react';
import SiteNavbar from './index'
import { SiteNavbarProps } from './index';

export default {
  component: SiteNavbar,
} as Meta<SiteNavbarProps>

const Template: Story<SiteNavbarProps> = (args) => <SiteNavbar {...args} />;

// export const Primary = Template.bind({});
// Primary.args = {
  
// };

// export const Secondary = Template.bind({});
// Secondary.args = {
  
// };
