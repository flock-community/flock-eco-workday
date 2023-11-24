// .storybook/main.ts

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-vite)
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  // Required
  framework: '@storybook/react-vite',

  stories: ['../src/storybook/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  docs: {
    autodocs: 'tag',
  },

  addons: ['@storybook/addon-themes']
};

export default config;
