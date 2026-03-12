import dayjs, { type Dayjs } from 'dayjs';
import type {
  BudgetAllocation,
  DailyTimeAllocationItem,
  DailyAllocationType,
  HackTimeAllocationInput,
  StudyTimeAllocationInput,
  StudyMoneyAllocationInput,
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
 * Compute the diff between loaded API allocations and current UI state.
 * Returns lists of allocations to create, update, and delete.
 */
export function diffAllocations(
  loaded: BudgetAllocation[],
  currentTime: PersonTimeAllocation[],
  currentMoney: PersonMoneyAllocation[],
  eventCode: string,
  eventFrom: Dayjs,
  defaultBudgetType: EventBudgetType | null,
): {
  toCreate: Array<{ type: 'hack' | 'study' | 'money'; input: HackTimeAllocationInput | StudyTimeAllocationInput | StudyMoneyAllocationInput }>;
  toUpdate: Array<{ type: 'hack' | 'study' | 'money'; id: string; input: HackTimeAllocationInput | StudyTimeAllocationInput | StudyMoneyAllocationInput }>;
  toDelete: string[];
} {
  const toCreate: Array<{ type: 'hack' | 'study' | 'money'; input: HackTimeAllocationInput | StudyTimeAllocationInput | StudyMoneyAllocationInput }> = [];
  const toUpdate: Array<{ type: 'hack' | 'study' | 'money'; id: string; input: HackTimeAllocationInput | StudyTimeAllocationInput | StudyMoneyAllocationInput }> = [];
  const toDelete: string[] = [];

  // Build map of loaded allocations by personId+type
  const loadedMap = new Map<string, BudgetAllocation>();
  for (const alloc of loaded) {
    loadedMap.set(`${alloc.personId}:${alloc.type}`, alloc);
  }

  // Track which loaded allocations are accounted for
  const accountedKeys = new Set<string>();

  const dateStr = eventFrom.format('YYYY-MM-DD');

  // Process time allocations
  for (const person of currentTime) {
    // Hack time
    const hackKey = `${person.personId}:HACK_TIME`;
    const loadedHack = loadedMap.get(hackKey);

    if (person.hackPeriod !== null) {
      const dailyAllocations = periodToDailyAllocations(person.hackPeriod, 'HACK');
      const input: HackTimeAllocationInput = {
        personId: person.personId,
        eventCode,
        date: dateStr,
        description: undefined,
        dailyAllocations,
      };

      if (loadedHack?.id) {
        accountedKeys.add(hackKey);
        // Check if changed
        const loadedDaily = loadedHack.hackTimeDetails?.dailyAllocations || [];
        if (hasDailyAllocationsChanged(loadedDaily, dailyAllocations)) {
          toUpdate.push({ type: 'hack', id: loadedHack.id, input });
        } else {
          accountedKeys.add(hackKey); // unchanged, but accounted for
        }
      } else {
        toCreate.push({ type: 'hack', input });
      }
    } else if (loadedHack?.id) {
      // Period removed -> delete
      toDelete.push(loadedHack.id);
      accountedKeys.add(hackKey);
    }

    // Study time
    const studyKey = `${person.personId}:STUDY_TIME`;
    const loadedStudy = loadedMap.get(studyKey);

    if (person.studyPeriod !== null) {
      const dailyAllocations = periodToDailyAllocations(person.studyPeriod, 'STUDY');
      const input: StudyTimeAllocationInput = {
        personId: person.personId,
        eventCode,
        date: dateStr,
        description: undefined,
        dailyAllocations,
      };

      if (loadedStudy?.id) {
        accountedKeys.add(studyKey);
        const loadedDaily = loadedStudy.studyTimeDetails?.dailyAllocations || [];
        if (hasDailyAllocationsChanged(loadedDaily, dailyAllocations)) {
          toUpdate.push({ type: 'study', id: loadedStudy.id, input });
        }
      } else {
        toCreate.push({ type: 'study', input });
      }
    } else if (loadedStudy?.id) {
      toDelete.push(loadedStudy.id);
      accountedKeys.add(studyKey);
    }
  }

  // Process money allocations
  for (const person of currentMoney) {
    const moneyKey = `${person.personId}:STUDY_MONEY`;
    const loadedMoney = loadedMap.get(moneyKey);

    if (person.amount > 0) {
      const input: StudyMoneyAllocationInput = {
        personId: person.personId,
        eventCode,
        date: dateStr,
        description: undefined,
        amount: person.amount,
        files: [],
      };

      if (loadedMoney?.id) {
        accountedKeys.add(moneyKey);
        if (loadedMoney.studyMoneyDetails?.amount !== person.amount) {
          toUpdate.push({ type: 'money', id: loadedMoney.id, input });
        }
      } else {
        toCreate.push({ type: 'money', input });
      }
    } else if (loadedMoney?.id) {
      toDelete.push(loadedMoney.id);
      accountedKeys.add(moneyKey);
    }
  }

  // Delete loaded allocations whose person is no longer in current lists
  const currentTimePersonIds = new Set(currentTime.map((p) => p.personId));
  const currentMoneyPersonIds = new Set(currentMoney.map((p) => p.personId));

  for (const alloc of loaded) {
    const key = `${alloc.personId}:${alloc.type}`;
    if (accountedKeys.has(key)) continue;

    if (
      (alloc.type === 'HACK_TIME' || alloc.type === 'STUDY_TIME') &&
      !currentTimePersonIds.has(alloc.personId)
    ) {
      if (alloc.id) toDelete.push(alloc.id);
    } else if (alloc.type === 'STUDY_MONEY' && !currentMoneyPersonIds.has(alloc.personId)) {
      if (alloc.id) toDelete.push(alloc.id);
    }
  }

  return { toCreate, toUpdate, toDelete };
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

// Helper: check if daily allocations have changed
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
