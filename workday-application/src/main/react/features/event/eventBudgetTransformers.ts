import dayjs, { type Dayjs } from 'dayjs';
import type {
  BudgetAllocation,
  DailyTimeAllocationItem,
  DailyAllocationType,
} from '../../wirespec/model';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';
import type { Period } from '../period/Period';
import type { EventBudgetType } from '../../utils/mappings';

/**
 * Convert a Period (from/to/days[]) to an array of DailyTimeAllocationItems.
 * days[] is positional: index 0 = period.from, index 1 = period.from + 1 day, etc.
 * Entries with hours <= 0 are filtered out.
 */
export function periodToDailyAllocations(
  period: Period,
  type: DailyAllocationType,
): DailyTimeAllocationItem[] {
  if (!period.days || period.days.length === 0) return [];

  return period.days
    .map((hours, i) => ({
      date: period.from.add(i, 'day').format('YYYY-MM-DD'),
      hours,
      type,
    }))
    .filter((item) => item.hours > 0);
}

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
 * Groups HACK_TIME and STUDY_TIME allocations by person, converting daily allocations to Periods.
 */
export function apiAllocationsToTimeParticipants(
  allocations: BudgetAllocation[],
  persons: Array<{ uuid: string; firstname: string; lastname: string }>,
  eventFrom: Dayjs,
  eventTo: Dayjs,
): PersonTimeAllocation[] {
  const timeAllocations = allocations.filter(
    (a) => a.type === 'HACK_TIME' || a.type === 'STUDY_TIME',
  );

  // Group by personId
  const byPerson = new Map<string, BudgetAllocation[]>();
  for (const alloc of timeAllocations) {
    const existing = byPerson.get(alloc.personId) || [];
    existing.push(alloc);
    byPerson.set(alloc.personId, existing);
  }

  return persons
    .filter((person) => {
      // Only include persons that have time allocations
      return byPerson.has(person.uuid);
    })
    .map((person) => {
      const personAllocations = byPerson.get(person.uuid) || [];
      const hackAlloc = personAllocations.find((a) => a.type === 'HACK_TIME');
      const studyAlloc = personAllocations.find((a) => a.type === 'STUDY_TIME');

      const hackPeriod = hackAlloc?.hackTimeDetails
        ? dailyAllocationsToPeriod(hackAlloc.hackTimeDetails.dailyAllocations, eventFrom, eventTo)
        : null;

      const studyPeriod = studyAlloc?.studyTimeDetails
        ? dailyAllocationsToPeriod(studyAlloc.studyTimeDetails.dailyAllocations, eventFrom, eventTo)
        : null;

      return {
        personId: person.uuid,
        personName: `${person.firstname} ${person.lastname}`,
        hackPeriod,
        studyPeriod,
      };
    });
}

/**
 * Convert API BudgetAllocation[] to PersonMoneyAllocation[] for the UI.
 * Filters to STUDY_MONEY type and maps to person + amount.
 */
export function apiAllocationsToMoneyParticipants(
  allocations: BudgetAllocation[],
  persons: Array<{ uuid: string; firstname: string; lastname: string }>,
): PersonMoneyAllocation[] {
  const moneyAllocations = allocations.filter((a) => a.type === 'STUDY_MONEY');

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
        amount: alloc?.studyMoneyDetails?.amount ?? 0,
      };
    });
}

/**
 * Map EventBudgetType ('HACK'/'STUDY') to BudgetAllocationType ('HACK_TIME'/'STUDY_TIME').
 */
export function eventBudgetTypeToAllocationType(
  budgetType: EventBudgetType,
): 'HACK_TIME' | 'STUDY_TIME' {
  return budgetType === 'HACK' ? 'HACK_TIME' : 'STUDY_TIME';
}

/**
 * Map EventBudgetType to DailyAllocationType (values match directly).
 */
export function eventBudgetTypeToDailyType(
  budgetType: EventBudgetType,
): DailyAllocationType {
  return budgetType as DailyAllocationType;
}
