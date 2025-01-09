// .storybook/preview.js

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import '@fontsource/material-icons';

import { CssBaseline, ThemeProvider } from '@material-ui/core';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { themeLight } from '../src/main/react/theme/theme-light';
import { darkTheme } from './themes';
import { MemoryRouter } from "react-router";
import React from "react";

/* snipped for brevity */

export const decorators = [
  withThemeFromJSXProvider({
    themes: {
      light: themeLight,
      dark: darkTheme,
    },
    defaultTheme: 'light',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Story />
        </MemoryRouter>
    ),

  ];
