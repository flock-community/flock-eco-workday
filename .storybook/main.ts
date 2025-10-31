// .storybook/main.ts

// Replace your-framework with the framework you are using (e.g., react-webpack5, vue3-vite)
import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  // Required
  framework: '@storybook/react-vite',

  stories: ['../*/src/storybook/**/*.stories.@(js|jsx|mjs|ts|tsx)'],

  docs: {
    autodocs: 'tag',
  },

  addons: ['@storybook/addon-themes'],

  viteFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@workday-core': resolve(__dirname, '../workday-core/src/main/react'),
        '@workday-user': resolve(__dirname, '../workday-user/src/main/react'),
        // Adjust the path above to match your actual workday-core location
      };
    }
    return config;
  },
};

export default config;
