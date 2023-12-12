import {Expense} from "../models/Expense";
import {Status} from "../models/Status";
import dayjs from "dayjs";

export function useExpenseFilters(): [
    (items: Expense[]) => Expense[],
    (items: Expense[], numberOfDays: number) => Expense[]] {

    const openExpensesStatusFilter = [Status.REQUESTED];
    const recentExpensesStatusFilter = [Status.REJECTED, Status.APPROVED, Status.DONE];

    const _filterExpenseOnStatus: (items: Expense[], statusFilter: string[]) => Expense[] = (items: Expense[], statusFilter: string[]) => {
        return items.filter(item => statusFilter.includes(item.status))
    }

    const _filterOnNumberOfDays: (items: Expense[], numberOfDays: number) => Expense[] = (items: Expense[], numberOfDays: number) => {
        return items.filter(item => item.date > dayjs().startOf('day').subtract(numberOfDays, 'days'))
    }

    const getOpenExpenses: (items: Expense[]) => Expense[] = (items: Expense[]) => {
        return _filterExpenseOnStatus(items, openExpensesStatusFilter);
    }

    const getRecentExpenses: (items: Expense[], numberOfDays: number) => Expense[] = (items: Expense[], numberOfDays: number) => {
        const expensesFilteredOnStatus = _filterExpenseOnStatus(items, recentExpensesStatusFilter);
        return _filterOnNumberOfDays(expensesFilteredOnStatus, numberOfDays);
    }

    return [getOpenExpenses, getRecentExpenses];
}
