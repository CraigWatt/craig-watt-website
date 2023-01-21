/*
FOR DEVELOPER: This will end up being a fairly large
Composite component
Will return to this when Simple Components are better established
In this case Navbar area and footer area etc.
*/

import React from 'react';
import { Meta, Story } from '@storybook/react';
import SiteLayout from './index'
import { SiteLayoutProps } from './index';

export default {
  component: SiteLayout,
} as Meta<SiteLayoutProps>

const Template: Story<SiteLayoutProps> = (args) => <SiteLayout {...args} />;

// export const Primary = Template.bind({});
// Primary.args = {
  
// };

// export const Secondary = Template.bind({});
// Secondary.args = {
  
// };



// ------------------------------------------------------------------


// import React from 'react';
// import { Meta, Story } from '@storybook/react';
// import { SiteLayout, SiteLayoutProps } from './index';

// const meta: Meta = {
//   title: 'SiteLayout',
//   component: SiteLayout,
//   argTypes: {
//     children: {
//       control: {
//         type: 'text',
//       },
//     },
//   },
//   parameters: {
//     controls: { expanded: true },
//   },
// };

// export default meta;

// const Template: Story<SiteLayoutProps> = (args) => <SiteLayout {...args} />;

// // By passing using the Args format for exported stories, you can control the props for a component for reuse in a test
// // https://storybook.js.org/docs/react/workflows/unit-testing
// export const Default = Template.bind({});

// Default.args = {};
