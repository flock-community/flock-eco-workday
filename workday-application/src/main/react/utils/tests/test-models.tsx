import type { Dayjs } from 'dayjs';
import type { FlockEvent, FullFlockEvent } from '../../clients/EventClient';
import { EventType } from '../../clients/EventClient';
import type { Expense, ExpenseStatus } from '../../wirespec/model';

function getMonthStringFromDate(date: Dayjs): string {
  return date.format('MMMM');
}

export function createTestCostExpense(
  id: string,
  date: Dayjs,
  status: ExpenseStatus = 'REQUESTED',
  amount: number = 120,
): Expense {
  const dateMonth = getMonthStringFromDate(date);
  return {
    costDetails: {
      amount,
      files: [],
    },
    date: date.format('YYYY-MM-DD'),
    description: `Cost expense ${dateMonth}`,
    expenseType: 'COST',
    id,
    personId: '0',
    status,
    travelDetails: undefined,
  };
}

export function createTestTravelExpense(
  id: string,
  date: Dayjs,
  status: ExpenseStatus = 'REQUESTED',
  distance: number = 120,
  allowance: number = 0.23,
): Expense {
  const dateMonth = getMonthStringFromDate(date);
  return {
    costDetails: undefined,
    date: date.format('YYYY-MM-DD'),
    description: `Cost expense ${dateMonth}`,
    expenseType: 'COST',
    id,
    personId: '0',
    status,
    travelDetails: {
      distance,
      allowance,
    },
  };
}

export function createTestFlockEvent(
  description: string,
  from: Dayjs,
  to: Dayjs,
  hours: number,
  days: number[],
): FullFlockEvent {
  return {
    description,
    id: 1909,
    code: 'event-code',
    from,
    to,
    hours: hours,
    days: days,
    persons: [],
    costs: 0.0,
    type: EventType.GENERAL_EVENT,
  };
}

export function createTestOneDayFlockEvent(date: Dayjs): FlockEvent {
  return createTestFlockEvent('Single day Flock Event', date, date, 8, [8]);
}

export function createTestMultiDayFlockEvent(
  from: Dayjs,
  to: Dayjs,
): FlockEvent {
  const daysArray: number[] = [];
  const daysBetween = to.diff(from, 'days');
  for (let idx = 0; idx < daysBetween; idx++) {
    daysArray.push(8);
  }
  return createTestFlockEvent(
    'Multiple days Flock Event',
    from,
    to,
    daysBetween * 8,
    daysArray,
  );
}
