import dayjs from 'dayjs';
import type { ExpenseStatus } from '../wirespec/model';
import type { Expense } from '../wirespec/model/Expense';

const openExpensesStatusFilter: ExpenseStatus[] = ['REQUESTED'];
const recentExpensesStatusFilter: ExpenseStatus[] = [
  'REJECTED',
  'APPROVED',
  'DONE',
];

const _filterExpenseOnStatus: (
  items: Expense[],
  statusFilter: string[],
) => Expense[] = (items: Expense[], statusFilter: string[]) => {
  return items.filter((item) => statusFilter.includes(item.status));
};

const _filterOnNumberOfDays: (
  items: Expense[],
  numberOfDays: number,
) => Expense[] = (items: Expense[], numberOfDays: number) => {
  return items.filter(
    (item) =>
      dayjs(item.date) >= dayjs().startOf('day').subtract(numberOfDays, 'days'),
  );
};

export const getOpenExpenses: (items: Expense[]) => Expense[] = (
  items: Expense[],
) => {
  return _filterExpenseOnStatus(items, openExpensesStatusFilter);
};

export const getRecentExpenses: (
  items: Expense[],
  numberOfDays: number,
) => Expense[] = (items: Expense[], numberOfDays: number) => {
  const expensesFilteredOnStatus = _filterExpenseOnStatus(
    items,
    recentExpensesStatusFilter,
  );
  return _filterOnNumberOfDays(expensesFilteredOnStatus, numberOfDays);
};
