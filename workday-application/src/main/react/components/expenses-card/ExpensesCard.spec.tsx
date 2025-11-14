import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import dayjs from 'dayjs';
import {
  createTestCostExpense,
  createTestTravelExpense,
} from '../../utils/tests/test-models';
import type { Expense } from '../../wirespec/model';

import { ExpensesCard } from './ExpensesCard';

describe('ExpensesCard', () => {
  const testExpense001 = createTestCostExpense('item-01', dayjs());
  const testExpense002 = createTestTravelExpense(
    'item-02',
    dayjs().subtract(3, 'months'),
  );
  const testExpense003 = createTestCostExpense(
    'item-03',
    dayjs().subtract(3, 'days'),
    'APPROVED',
  );
  const testExpense004 = createTestTravelExpense(
    'item-04',
    dayjs().subtract(15, 'days'),
    'REJECTED',
  );
  const testExpense005 = createTestCostExpense(
    'item-05',
    dayjs().subtract(25, 'days'),
    'DONE',
  );
  const testExpense006 = createTestCostExpense(
    'item-06',
    dayjs().subtract(31, 'days'),
    'REJECTED',
  );

  const expenses: Expense[] = [
    testExpense001,
    testExpense002,
    testExpense003,
    testExpense004,
    testExpense005,
    testExpense006,
  ];

  afterEach(() => {
    cleanup();
  });

  describe('without expenses', () => {
    let expenseCardElement: HTMLElement | null;
    beforeEach(() => {
      render(<ExpensesCard items={[]} />);
      expenseCardElement = screen.queryByTestId('expenses-card');
    });

    it('renders without crashing', () => {
      expect(expenseCardElement).toBeInTheDocument();
    });

    it('should have no items', () => {
      const emptyElements = screen.queryAllByTestId('expense-empty');
      const rowElements = screen.queryAllByTestId('table-row-expense');
      expect(emptyElements.length).toBe(2);
      expect(rowElements.length).toBe(0);
    });
  });

  describe('with expenses', () => {
    let expenseCardElement: HTMLElement | null;
    beforeEach(() => {
      render(<ExpensesCard items={expenses} />);
      expenseCardElement = screen.queryByTestId('expenses-card');
    });

    it('renders without crashing', () => {
      expect(expenseCardElement).toBeInTheDocument();
    });

    it('should not have expense-empty', () => {
      const emptyElements = screen.queryAllByTestId('expense-empty');
      const rowElements = screen.queryAllByTestId('table-row-expense');
      expect(emptyElements.length).toBe(0);
      expect(rowElements.length).not.toBe(0);
    });

    it('should have the right amount of rows in the table', () => {
      const emptyElements = screen.queryAllByTestId('expense-empty');
      const rowElements = screen.queryAllByTestId('table-row-expense');
      expect(emptyElements.length).toBe(0);
      expect(rowElements.length).not.toBe(expenses.length);
    });
  });
});
