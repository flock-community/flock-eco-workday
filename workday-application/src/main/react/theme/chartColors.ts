import { useTheme } from '@mui/material/styles';
import type { ColorMode } from './createAppTheme';

// Keyed by series meaning (not hue) so a concept reads the same across charts.
// Two ramps: mid-saturation for the warm light paper, brighter for dark.
export type ChartColors = {
  worked: string;
  forecast: string;
  leave: string;
  paidParentalLeave: string;
  unpaidParentalLeave: string;
  paidLeave: string;
  sick: string;
  event: string;
  missing: string;
  contract: string;
  plus: string;
  available: string;
  revenue: string;
  cost: string;
  profit: string;
  loss: string;
  count: string;
};

const light: ChartColors = {
  worked: '#1f9e8a',
  forecast: '#79c7b8',
  leave: '#3f7cac',
  paidParentalLeave: '#cf7fa2',
  unpaidParentalLeave: '#8fbce4',
  paidLeave: '#5aa873',
  sick: '#c0392b',
  event: '#c8791b',
  missing: '#b5b2a4',
  contract: '#9a978a',
  plus: '#6e6b60',
  available: '#d8d5c8',
  revenue: '#1f9e8a',
  cost: '#48566a',
  profit: '#3a8a4a',
  loss: '#c0392b',
  count: '#9a978a',
};

const dark: ChartColors = {
  worked: '#4fd1bb',
  forecast: '#2e9483',
  leave: '#6fa8d6',
  paidParentalLeave: '#e3a0bd',
  unpaidParentalLeave: '#a9cdf0',
  paidLeave: '#6cc48f',
  sick: '#e57368',
  event: '#e0973a',
  missing: '#8a877a',
  contract: '#9c9888',
  plus: '#c2bdac',
  available: '#4f4d44',
  revenue: '#4fd1bb',
  cost: '#8c98ab',
  profit: '#5cb96b',
  loss: '#e57368',
  count: '#9c9888',
};

export function chartColors(mode: ColorMode): ChartColors {
  return mode === 'dark' ? dark : light;
}

export function useChartColors(): ChartColors {
  return chartColors(useTheme().palette.mode as ColorMode);
}
