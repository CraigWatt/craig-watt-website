import React from 'react';
import { Providers } from '../app/providers'; // adjust the path as needed
import type { Preview } from '@storybook/react';

const preview: Preview = {
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
  tags: ['autodocs'],
};

export default preview;
