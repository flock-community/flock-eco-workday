import type {
  BudgetAllocation,
  BudgetSummaryResponse,
  StudyMoneyAllocationInput,
} from '../wirespec/model';

const basePath = '/api/budget-allocations';
const summaryPath = '/api/budget-summary';

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&');
};

const findAll = async (
  personId?: string,
  year?: number,
  eventCode?: string,
): Promise<BudgetAllocation[]> => {
  const query = buildQueryString({ personId, year, eventCode });
  const res = await fetch(`${basePath}${query}`);
  if (!res.ok) throw new Error(`Failed to fetch budget allocations: ${res.status}`);
  return res.json();
};

const getSummary = async (
  personId?: string,
  year?: number,
): Promise<BudgetSummaryResponse> => {
  const query = buildQueryString({ personId, year });
  const res = await fetch(`${summaryPath}${query}`);
  if (!res.ok) throw new Error(`Failed to fetch budget summary: ${res.status}`);
  return res.json();
};

const createStudyMoney = async (
  input: StudyMoneyAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/study-money`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create study money allocation: ${res.status}`);
  return res.json();
};

const deleteById = async (id: string): Promise<void> => {
  const res = await fetch(`${basePath}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error(`Failed to delete budget allocation: ${res.status}`);
};

const uploadFile = async (file: File): Promise<{ id: string; name: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/budget-allocations/files', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to upload file: ${res.status}`);
  return res.json();
};

const downloadFile = (fileId: string): string => {
  return `/api/budget-allocations/files/${fileId}`;
};

export const BudgetAllocationClient = {
  findAll,
  getSummary,
  createStudyMoney,
  deleteById,
  uploadFile,
  downloadFile,
};
