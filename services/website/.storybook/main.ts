import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../app/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@chromatic-com/storybook'],
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
};

export default config;
