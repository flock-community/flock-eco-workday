import dayjs, { type Dayjs } from 'dayjs';
import type { EventBudgetType } from '../../utils/mappings';
import type {
  AllocationType,
  BudgetAllocation,
  DailyTimeAllocationItem,
  TimeAllocationInput,
} from '../../wirespec/model';
import type { Period } from '../period/Period';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';

// days[] is positional from period.from; zero-hour days are dropped (only allocated days persist).
export function periodToDailyAllocations(
  period: Period,
  type: AllocationType,
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

// Split each person's typed daily rows into a hack period and a training period; a single day
// can land in both when its hours are split across types.
export function apiAllocationsToTimeParticipants(
  allocations: BudgetAllocation[],
  persons: Array<{ uuid: string; firstname: string; lastname: string }>,
  eventFrom: Dayjs,
  eventTo: Dayjs,
): PersonTimeAllocation[] {
  const dailyByPerson = new Map<string, DailyTimeAllocationItem[]>();
  for (const alloc of allocations) {
    if (alloc.kind !== 'TIME') continue;
    const daily = alloc.timeDetails?.dailyAllocations ?? [];
    const existing = dailyByPerson.get(alloc.personId) ?? [];
    dailyByPerson.set(alloc.personId, existing.concat(daily));
  }

  return persons
    .filter((person) => dailyByPerson.has(person.uuid))
    .map((person) => {
      const daily = dailyByPerson.get(person.uuid) ?? [];
      const hackDaily = daily.filter((d) => d.type === 'HACK');
      const trainingDaily = daily.filter((d) => d.type === 'TRAINING');

      return {
        personId: person.uuid,
        personName: `${person.firstname} ${person.lastname}`,
        hackPeriod: hackDaily.length
          ? dailyAllocationsToPeriod(hackDaily, eventFrom, eventTo)
          : null,
        trainingPeriod: trainingDaily.length
          ? dailyAllocationsToPeriod(trainingDaily, eventFrom, eventTo)
          : null,
      };
    });
}

export function apiAllocationsToMoneyParticipants(
  allocations: BudgetAllocation[],
  persons: Array<{ uuid: string; firstname: string; lastname: string }>,
): PersonMoneyAllocation[] {
  const byPerson = new Map<string, BudgetAllocation>();
  for (const alloc of allocations) {
    if (alloc.kind === 'MONEY') byPerson.set(alloc.personId, alloc);
  }

  return persons
    .filter((person) => byPerson.has(person.uuid))
    .map((person) => {
      const alloc = byPerson.get(person.uuid);
      return {
        personId: person.uuid,
        personName: `${person.firstname} ${person.lastname}`,
        amount: alloc?.moneyDetails?.amount ?? 0,
      };
    });
}

export type TimeAllocationDiffEntry = {
  id: string;
  input: TimeAllocationInput;
};

export interface TimeOverrideDiff {
  toCreate: TimeAllocationInput[];
  toUpdate: TimeAllocationDiffEntry[];
  toDelete: string[];
}

function defaultDailyAllocations(
  eventDefaultDays: number[],
  defaultBudgetType: EventBudgetType,
  eventFrom: Dayjs,
): DailyTimeAllocationItem[] {
  const period: Period = {
    from: eventFrom,
    to: eventFrom.add(Math.max(eventDefaultDays.length - 1, 0), 'day'),
    days: eventDefaultDays,
  };
  return periodToDailyAllocations(period, defaultBudgetType);
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
  const defaultDaily = defaultDailyAllocations(
    eventDefaultDays,
    defaultBudgetType,
    eventFrom,
  );

  const freshByPerson = new Map<string, BudgetAllocation>();
  for (const alloc of freshAllocations) {
    if (alloc.kind === 'TIME') freshByPerson.set(alloc.personId, alloc);
  }

  const toCreate: TimeAllocationInput[] = [];
  const toUpdate: TimeAllocationDiffEntry[] = [];
  const toDelete: string[] = [];
  const date = eventFrom.format('YYYY-MM-DD');

  for (const person of participants) {
    const daily = [
      ...(person.hackPeriod
        ? periodToDailyAllocations(person.hackPeriod, 'HACK')
        : []),
      ...(person.trainingPeriod
        ? periodToDailyAllocations(person.trainingPeriod, 'TRAINING')
        : []),
    ];

    if (!hasDailyAllocationsChanged(daily, defaultDaily)) continue;

    const fresh = freshByPerson.get(person.personId);
    if (daily.length > 0) {
      const input: TimeAllocationInput = {
        personId: person.personId,
        eventCode,
        date,
        description: fresh?.description,
        dailyAllocations: daily,
      };
      if (fresh?.id) {
        if (
          hasDailyAllocationsChanged(
            fresh.timeDetails?.dailyAllocations ?? [],
            daily,
          )
        ) {
          toUpdate.push({ id: fresh.id, input });
        }
      } else {
        toCreate.push(input);
      }
    } else if (fresh?.id) {
      toDelete.push(fresh.id);
    }
  }

  return { toCreate, toUpdate, toDelete };
}

function hasDailyAllocationsChanged(
  loaded: DailyTimeAllocationItem[],
  current: DailyTimeAllocationItem[],
): boolean {
  if (loaded.length !== current.length) return true;
  const key = (d: DailyTimeAllocationItem) => `${d.date}:${d.type}`;
  const loadedMap = new Map(loaded.map((d) => [key(d), d.hours]));
  for (const item of current) {
    if (loadedMap.get(key(item)) !== item.hours) return true;
  }
  return false;
}
