import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../app/**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: [
    '@chromatic-com/storybook'
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {}
  },
  core: {
    builder: {
      // Option A: use Vite
      name: '@storybook/builder-vite',
      options: {}
      
      // Option B: (if you want Webpack instead)
      // name: '@storybook/builder-webpack5',
      // options: {}
    }
  }
};

export default config;
