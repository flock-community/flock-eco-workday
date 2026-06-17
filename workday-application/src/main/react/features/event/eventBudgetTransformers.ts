import dayjs, { type Dayjs } from 'dayjs';
import type {
  BudgetAllocation,
  DailyTimeAllocationItem,
} from '../../wirespec/model';
import type { Period } from '../period/Period';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';

/**
 * Convert an array of DailyTimeAllocationItems back to a Period.
 * The Period spans eventFrom to eventTo, with a days[] array sized accordingly.
 */
export function dailyAllocationsToPeriod(
  dailyAllocations: DailyTimeAllocationItem[],
  eventFrom: Dayjs,
  eventTo: Dayjs,
): Period {
  const totalDays = eventTo.diff(eventFrom, 'day') + 1;
  const days = new Array(totalDays).fill(0);

  for (const item of dailyAllocations) {
    const index = dayjs(item.date).diff(eventFrom, 'day');
    if (index >= 0 && index < totalDays) {
      days[index] = item.hours;
    }
  }

  return { from: eventFrom, to: eventTo, days };
}

/**
 * Convert API BudgetAllocation[] to PersonTimeAllocation[] for the UI.
 * Groups HACK_TIME and TRAINING_TIME allocations by person, converting daily allocations to Periods.
 */
export function apiAllocationsToTimeParticipants(
  allocations: BudgetAllocation[],
  persons: Array<{ uuid: string; firstname: string; lastname: string }>,
  eventFrom: Dayjs,
  eventTo: Dayjs,
): PersonTimeAllocation[] {
  const timeAllocations = allocations.filter(
    (a) => a.type === 'HACK_TIME' || a.type === 'TRAINING_TIME',
  );

  const byPerson = new Map<string, BudgetAllocation[]>();
  for (const alloc of timeAllocations) {
    const existing = byPerson.get(alloc.personId) || [];
    existing.push(alloc);
    byPerson.set(alloc.personId, existing);
  }

  return persons
    .filter((person) => byPerson.has(person.uuid))
    .map((person) => {
      const personAllocations = byPerson.get(person.uuid) || [];
      const hackAlloc = personAllocations.find((a) => a.type === 'HACK_TIME');
      const trainingAlloc = personAllocations.find((a) => a.type === 'TRAINING_TIME');

      const hackPeriod = hackAlloc?.hackTimeDetails
        ? dailyAllocationsToPeriod(
            hackAlloc.hackTimeDetails.dailyAllocations,
            eventFrom,
            eventTo,
          )
        : null;

      const trainingPeriod = trainingAlloc?.trainingTimeDetails
        ? dailyAllocationsToPeriod(
            trainingAlloc.trainingTimeDetails.dailyAllocations,
            eventFrom,
            eventTo,
          )
        : null;

      return {
        personId: person.uuid,
        personName: `${person.firstname} ${person.lastname}`,
        hackPeriod,
        trainingPeriod,
      };
    });
}

/**
 * Convert API BudgetAllocation[] to PersonMoneyAllocation[] for the UI.
 * Filters to TRAINING_MONEY type and maps to person + amount.
 */
export function apiAllocationsToMoneyParticipants(
  allocations: BudgetAllocation[],
  persons: Array<{ uuid: string; firstname: string; lastname: string }>,
): PersonMoneyAllocation[] {
  const moneyAllocations = allocations.filter((a) => a.type === 'TRAINING_MONEY');

  const byPerson = new Map<string, BudgetAllocation>();
  for (const alloc of moneyAllocations) {
    byPerson.set(alloc.personId, alloc);
  }

  return persons
    .filter((person) => byPerson.has(person.uuid))
    .map((person) => {
      const alloc = byPerson.get(person.uuid);
      return {
        personId: person.uuid,
        personName: `${person.firstname} ${person.lastname}`,
        amount: alloc?.trainingMoneyDetails?.amount ?? 0,
      };
    });
}
