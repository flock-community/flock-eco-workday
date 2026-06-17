import { type ColorMode, createAppTheme } from './createAppTheme';

export function getTheme(mode?: ColorMode) {
  return createAppTheme(mode === 'dark' ? 'dark' : 'light');
}
