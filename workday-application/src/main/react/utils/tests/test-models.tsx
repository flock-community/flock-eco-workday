import type { Dayjs } from 'dayjs';
import {
  EventType,
  type FlockEvent,
  type FullFlockEvent,
} from '../../clients/EventClient';
import type { Person } from '../../clients/PersonClient';
import { CostExpense, TravelExpense } from '../../models/Expense';
import { Status } from '../../models/Status';

function getMonthStringFromDate(date: Dayjs): string {
  return date.format('MMMM');
}

export function createTestCostExpense(
  id: string,
  date: Dayjs,
  status: Status = Status.REQUESTED,
  amount: number = 120,
): CostExpense {
  const dateMonth = getMonthStringFromDate(date);
  return new CostExpense(
    id,
    date,
    `Cost expense ${dateMonth}`,
    {} as Person,
    status,
    amount,
    [],
  );
}

export function createTestTravelExpense(
  id: string,
  date: Dayjs,
  status: Status = Status.REQUESTED,
  distance: number = 120,
  allowance: number = 0.23,
): TravelExpense {
  const dateMonth = getMonthStringFromDate(date);
  return new TravelExpense(
    id,
    date,
    `Travel expense ${dateMonth}`,
    {} as Person,
    status,
    [],
    allowance,
    distance,
  );
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
