import { checkResponse, validateResponse } from '@workday-core';
import type { BudgetSummaryResponse } from '../wirespec/model';
import type { Person } from './PersonClient';

const summaryPath = '/api/budget-summary';

const getSummary = (
  person?: Person,
  year?: number,
): Promise<BudgetSummaryResponse> => {
  const params = new URLSearchParams();
  if (person?.uuid) params.set('personId', person.uuid);
  if (year !== undefined) params.set('year', String(year));
  const query = params.toString();
  return fetch(query ? `${summaryPath}?${query}` : summaryPath)
    .then((res) => validateResponse<BudgetSummaryResponse>(res))
    .then(checkResponse)
    .then((res) => res.body);
};

export const BudgetClient = {
  getSummary,
};
