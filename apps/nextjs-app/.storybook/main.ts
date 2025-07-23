import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../app/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@chromatic-com/storybook',
  ],

  framework: {
    name: '@storybook/nextjs',
    options: {},
  },

  core: {
    builder: {
      name: '@storybook/builder-vite',
      options: {},
    },
  },

  docs: {},
  typescript: { reactDocgen: 'react-docgen-typescript' },
};

export default config;
