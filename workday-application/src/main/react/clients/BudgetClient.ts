import { checkResponse, validateResponse } from '@workday-core';
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

const getSummary = (
  person?: Person,
  year?: number,
): Promise<BudgetSummaryResponse> => {
  const query = buildQueryString({ personId: person?.uuid, year });
  return fetch(`${summaryPath}${query}`)
    .then((res) => validateResponse<BudgetSummaryResponse>(res))
    .then(checkResponse)
    .then((res) => res.body);
};

export const BudgetClient = {
  getSummary,
};
