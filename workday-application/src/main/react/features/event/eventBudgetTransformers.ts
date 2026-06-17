import dayjs, { type Dayjs } from 'dayjs';
import type { EventBudgetType } from '../../utils/mappings';
import type {
  BudgetAllocation,
  DailyAllocationType,
  DailyTimeAllocationItem,
  HackTimeAllocationInput,
  TrainingTimeAllocationInput,
} from '../../wirespec/model';
import type { Period } from '../period/Period';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';

// days[] is positional from period.from; zero-hour days are dropped (only allocated days persist).
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
      const trainingAlloc = personAllocations.find(
        (a) => a.type === 'TRAINING_TIME',
      );

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
  const moneyAllocations = allocations.filter(
    (a) => a.type === 'TRAINING_MONEY',
  );

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

export type TimeAllocationMutation =
  | { type: 'hack'; input: HackTimeAllocationInput }
  | { type: 'training'; input: TrainingTimeAllocationInput };

export interface TimeOverrideDiff {
  toCreate: TimeAllocationMutation[];
  toUpdate: Array<TimeAllocationMutation & { id: string }>;
  toDelete: string[];
}

function defaultDailyFor(
  budgetType: EventBudgetType,
  forType: DailyAllocationType,
  eventDefaultDays: number[],
  eventFrom: Dayjs,
): DailyTimeAllocationItem[] {
  if (budgetType !== forType) return [];
  const period: Period = {
    from: eventFrom,
    to: eventFrom.add(Math.max(eventDefaultDays.length - 1, 0), 'day'),
    days: eventDefaultDays,
  };
  return periodToDailyAllocations(period, forType);
}

// The backend resets everyone to the event default on each save, so persist ONLY deviations
// (re-applied over the freshly-synced rows); default participants and money are left to it.
export function diffTimeOverrides(
  freshAllocations: BudgetAllocation[],
  participants: PersonTimeAllocation[],
  eventDefaultDays: number[],
  defaultBudgetType: EventBudgetType,
  eventCode: string,
  eventFrom: Dayjs,
): TimeOverrideDiff {
  const defaultHack = defaultDailyFor(
    defaultBudgetType,
    'HACK',
    eventDefaultDays,
    eventFrom,
  );
  const defaultTraining = defaultDailyFor(
    defaultBudgetType,
    'TRAINING',
    eventDefaultDays,
    eventFrom,
  );

  const freshByPersonType = new Map<string, BudgetAllocation>();
  for (const alloc of freshAllocations) {
    freshByPersonType.set(`${alloc.personId}:${alloc.type}`, alloc);
  }

  const toCreate: TimeAllocationMutation[] = [];
  const toUpdate: Array<TimeAllocationMutation & { id: string }> = [];
  const toDelete: string[] = [];
  const date = eventFrom.format('YYYY-MM-DD');

  for (const person of participants) {
    const hackDaily = person.hackPeriod
      ? periodToDailyAllocations(person.hackPeriod, 'HACK')
      : [];
    const trainingDaily = person.trainingPeriod
      ? periodToDailyAllocations(person.trainingPeriod, 'TRAINING')
      : [];

    const usesDefault =
      !hasDailyAllocationsChanged(hackDaily, defaultHack) &&
      !hasDailyAllocationsChanged(trainingDaily, defaultTraining);
    if (usesDefault) continue;

    const freshHack = freshByPersonType.get(`${person.personId}:HACK_TIME`);
    if (hackDaily.length > 0) {
      const input: HackTimeAllocationInput = {
        personId: person.personId,
        eventCode,
        date,
        description: freshHack?.description,
        dailyAllocations: hackDaily,
      };
      if (freshHack?.id) {
        if (
          hasDailyAllocationsChanged(
            freshHack.hackTimeDetails?.dailyAllocations ?? [],
            hackDaily,
          )
        ) {
          toUpdate.push({ type: 'hack', id: freshHack.id, input });
        }
      } else {
        toCreate.push({ type: 'hack', input });
      }
    } else if (freshHack?.id) {
      toDelete.push(freshHack.id);
    }

    const freshTraining = freshByPersonType.get(
      `${person.personId}:TRAINING_TIME`,
    );
    if (trainingDaily.length > 0) {
      const input: TrainingTimeAllocationInput = {
        personId: person.personId,
        eventCode,
        date,
        description: freshTraining?.description,
        dailyAllocations: trainingDaily,
      };
      if (freshTraining?.id) {
        if (
          hasDailyAllocationsChanged(
            freshTraining.trainingTimeDetails?.dailyAllocations ?? [],
            trainingDaily,
          )
        ) {
          toUpdate.push({ type: 'training', id: freshTraining.id, input });
        }
      } else {
        toCreate.push({ type: 'training', input });
      }
    } else if (freshTraining?.id) {
      toDelete.push(freshTraining.id);
    }
  }

  return { toCreate, toUpdate, toDelete };
}

function hasDailyAllocationsChanged(
  loaded: DailyTimeAllocationItem[],
  current: DailyTimeAllocationItem[],
): boolean {
  if (loaded.length !== current.length) return true;
  const loadedMap = new Map(loaded.map((d) => [d.date, d.hours]));
  for (const item of current) {
    if (loadedMap.get(item.date) !== item.hours) return true;
  }
  return false;
}
