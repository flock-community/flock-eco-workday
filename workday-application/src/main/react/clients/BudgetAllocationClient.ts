import type {
  BudgetAllocation,
  BudgetSummaryResponse,
  HackTimeAllocationInput,
  TrainingMoneyAllocationInput,
  TrainingTimeAllocationInput,
} from '../wirespec/model';
import type { Person } from './PersonClient';

const basePath = '/api/budget-allocations';
const summaryPath = '/api/budget-summary';

const buildQueryString = (
  params: Record<string, string | number | undefined>,
): string => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return '';
  return (
    '?' +
    entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
  );
};

const findAll = async (
  personId?: Person,
  year?: number,
  eventCode?: string,
): Promise<BudgetAllocation[]> => {
  const query = buildQueryString({ personId: personId?.uuid, year, eventCode });
  const res = await fetch(`${basePath}${query}`);
  if (!res.ok)
    throw new Error(`Failed to fetch budget allocations: ${res.status}`);
  return res.json();
};

const getSummary = async (
  personId?: Person,
  year?: number,
): Promise<BudgetSummaryResponse> => {
  const query = buildQueryString({ personId: personId?.uuid, year });
  const res = await fetch(`${summaryPath}${query}`);
  if (!res.ok) throw new Error(`Failed to fetch budget summary: ${res.status}`);
  return res.json();
};

const createTrainingMoney = async (
  input: TrainingMoneyAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/training-money`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(
      `Failed to create training money allocation: ${res.status}`,
    );
  return res.json();
};

const createHackTime = async (
  input: HackTimeAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/hack-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(`Failed to create hack time allocation: ${res.status}`);
  return res.json();
};

const updateHackTime = async (
  id: string,
  input: HackTimeAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/hack-time/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(`Failed to update hack time allocation: ${res.status}`);
  return res.json();
};

const createTrainingTime = async (
  input: TrainingTimeAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/training-time`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(`Failed to create training time allocation: ${res.status}`);
  return res.json();
};

const updateTrainingTime = async (
  id: string,
  input: TrainingTimeAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/training-time/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(`Failed to update training time allocation: ${res.status}`);
  return res.json();
};

const updateTrainingMoney = async (
  id: string,
  input: TrainingMoneyAllocationInput,
): Promise<BudgetAllocation> => {
  const res = await fetch(`${basePath}/training-money/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok)
    throw new Error(
      `Failed to update training money allocation: ${res.status}`,
    );
  return res.json();
};

const deleteById = async (id: string): Promise<void> => {
  const res = await fetch(`${basePath}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok)
    throw new Error(`Failed to delete budget allocation: ${res.status}`);
};

const uploadFile = async (
  file: File,
): Promise<{ id: string; name: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('/api/budget-allocations/files', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error(`Failed to upload file: ${res.status}`);
  return res.json();
};

const downloadFile = (fileId: string, fileName: string): string => {
  return `/api/budget-allocations/files/${fileId}/${fileName}`;
};

export const BudgetAllocationClient = {
  findAll,
  getSummary,
  createHackTime,
  updateHackTime,
  createTrainingTime,
  updateTrainingTime,
  createTrainingMoney,
  updateTrainingMoney,
  deleteById,
  uploadFile,
  downloadFile,
};
