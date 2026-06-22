import type { BudgetSummaryResponse } from '../wirespec/model';
import type { Person } from './PersonClient';

const summaryPath = '/api/budget-summary';

const buildQueryString = (
  params: Record<string, string | number | undefined>,
): string => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return `?${entries
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')}`;
};

const getSummary = async (
  person?: Person,
  year?: number,
): Promise<BudgetSummaryResponse> => {
  const query = buildQueryString({ personId: person?.uuid, year });
  const res = await fetch(`${summaryPath}${query}`);
  if (!res.ok) throw new Error(`Failed to fetch budget summary: ${res.status}`);
  return res.json();
};

export const BudgetClient = {
  getSummary,
};
