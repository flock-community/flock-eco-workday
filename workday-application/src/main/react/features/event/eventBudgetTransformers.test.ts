import dayjs from 'dayjs';
import type { BudgetAllocation, DailyTimeAllocationItem } from '../../wirespec/model';
import type { Period } from '../period/Period';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';
import type { PersonMoneyAllocation } from './EventMoneyAllocationSection';
import { EventType } from '../../clients/EventClient';
import {
  periodToDailyAllocations,
  dailyAllocationsToPeriod,
  apiAllocationsToTimeParticipants,
  apiAllocationsToMoneyParticipants,
  diffAllocations,
  eventBudgetTypeToAllocationType,
  eventBudgetTypeToDailyType,
  generateDefaultAllocations,
} from './eventBudgetTransformers';

// --- EVT-01 / EVT-02: periodToDailyAllocations ---

describe('periodToDailyAllocations', () => {
  it('converts a period with days array to daily allocation items', () => {
    const period: Period = {
      from: dayjs('2026-03-10'),
      to: dayjs('2026-03-12'),
      days: [8, 4, 6],
    };

    const result = periodToDailyAllocations(period, 'HACK');

    expect(result).toEqual([
      { date: '2026-03-10', hours: 8, type: 'HACK' },
      { date: '2026-03-11', hours: 4, type: 'HACK' },
      { date: '2026-03-12', hours: 6, type: 'HACK' },
    ]);
  });

  it('filters out entries where hours are zero', () => {
    const period: Period = {
      from: dayjs('2026-03-10'),
      to: dayjs('2026-03-12'),
      days: [8, 0, 6],
    };

    const result = periodToDailyAllocations(period, 'STUDY');

    expect(result).toEqual([
      { date: '2026-03-10', hours: 8, type: 'STUDY' },
      { date: '2026-03-12', hours: 6, type: 'STUDY' },
    ]);
  });

  it('returns empty array when days is undefined', () => {
    const period: Period = {
      from: dayjs('2026-03-10'),
      to: dayjs('2026-03-12'),
    };

    expect(periodToDailyAllocations(period, 'HACK')).toEqual([]);
  });

  it('returns empty array when days is empty', () => {
    const period: Period = {
      from: dayjs('2026-03-10'),
      to: dayjs('2026-03-12'),
      days: [],
    };

    expect(periodToDailyAllocations(period, 'HACK')).toEqual([]);
  });
});

// --- EVT-02: dailyAllocationsToPeriod ---

describe('dailyAllocationsToPeriod', () => {
  it('converts daily allocation items back to a period with correct days array', () => {
    const dailyAllocations: DailyTimeAllocationItem[] = [
      { date: '2026-03-10', hours: 8, type: 'HACK' },
      { date: '2026-03-12', hours: 4, type: 'HACK' },
    ];
    const eventFrom = dayjs('2026-03-10');
    const eventTo = dayjs('2026-03-12');

    const result = dailyAllocationsToPeriod(dailyAllocations, eventFrom, eventTo);

    expect(result.from.format('YYYY-MM-DD')).toBe('2026-03-10');
    expect(result.to.format('YYYY-MM-DD')).toBe('2026-03-12');
    expect(result.days).toEqual([8, 0, 4]);
  });

  it('initializes missing days to zero', () => {
    const dailyAllocations: DailyTimeAllocationItem[] = [
      { date: '2026-03-11', hours: 6, type: 'STUDY' },
    ];
    const eventFrom = dayjs('2026-03-10');
    const eventTo = dayjs('2026-03-13');

    const result = dailyAllocationsToPeriod(dailyAllocations, eventFrom, eventTo);

    expect(result.days).toEqual([0, 6, 0, 0]);
  });

  it('ignores allocations outside the event date range', () => {
    const dailyAllocations: DailyTimeAllocationItem[] = [
      { date: '2026-03-09', hours: 8, type: 'HACK' }, // before event
      { date: '2026-03-10', hours: 4, type: 'HACK' }, // in range
      { date: '2026-03-14', hours: 2, type: 'HACK' }, // after event
    ];
    const eventFrom = dayjs('2026-03-10');
    const eventTo = dayjs('2026-03-12');

    const result = dailyAllocationsToPeriod(dailyAllocations, eventFrom, eventTo);

    expect(result.days).toEqual([4, 0, 0]);
  });
});

// --- EVT-02: apiAllocationsToTimeParticipants ---

describe('apiAllocationsToTimeParticipants', () => {
  const persons = [
    { uuid: 'p1', firstname: 'Alice', lastname: 'Smith' },
    { uuid: 'p2', firstname: 'Bob', lastname: 'Jones' },
  ];
  const eventFrom = dayjs('2026-03-10');
  const eventTo = dayjs('2026-03-12');

  it('groups hack and study time allocations by person', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'HACK_TIME',
        hackTimeDetails: {
          totalHours: 16,
          dailyAllocations: [
            { date: '2026-03-10', hours: 8, type: 'HACK' },
            { date: '2026-03-11', hours: 8, type: 'HACK' },
          ],
        },
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
      {
        id: 'a2',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'STUDY_TIME',
        hackTimeDetails: undefined,
        studyTimeDetails: {
          totalHours: 4,
          dailyAllocations: [{ date: '2026-03-12', hours: 4, type: 'STUDY' }],
        },
        studyMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToTimeParticipants(allocations, persons, eventFrom, eventTo);

    // Only p1 has time allocations, p2 should be excluded
    expect(result).toHaveLength(1);
    expect(result[0].personId).toBe('p1');
    expect(result[0].personName).toBe('Alice Smith');
    expect(result[0].hackPeriod).not.toBeNull();
    expect(result[0].hackPeriod!.days).toEqual([8, 8, 0]);
    expect(result[0].studyPeriod).not.toBeNull();
    expect(result[0].studyPeriod!.days).toEqual([0, 0, 4]);
  });

  it('returns null periods for allocation types a person does not have', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p2',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'HACK_TIME',
        hackTimeDetails: {
          totalHours: 8,
          dailyAllocations: [{ date: '2026-03-10', hours: 8, type: 'HACK' }],
        },
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToTimeParticipants(allocations, persons, eventFrom, eventTo);

    expect(result).toHaveLength(1);
    expect(result[0].personId).toBe('p2');
    expect(result[0].hackPeriod).not.toBeNull();
    expect(result[0].studyPeriod).toBeNull();
  });

  it('excludes money allocations from time participants', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'STUDY_MONEY',
        hackTimeDetails: undefined,
        studyTimeDetails: undefined,
        studyMoneyDetails: { amount: 500, files: [] },
      },
    ];

    const result = apiAllocationsToTimeParticipants(allocations, persons, eventFrom, eventTo);

    expect(result).toHaveLength(0);
  });
});

// --- EVT-03: apiAllocationsToMoneyParticipants ---

describe('apiAllocationsToMoneyParticipants', () => {
  const persons = [
    { uuid: 'p1', firstname: 'Alice', lastname: 'Smith' },
    { uuid: 'p2', firstname: 'Bob', lastname: 'Jones' },
  ];

  it('extracts money allocations per person', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'STUDY_MONEY',
        hackTimeDetails: undefined,
        studyTimeDetails: undefined,
        studyMoneyDetails: { amount: 500, files: [] },
      },
    ];

    const result = apiAllocationsToMoneyParticipants(allocations, persons);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      personId: 'p1',
      personName: 'Alice Smith',
      amount: 500,
    });
  });

  it('excludes time allocations from money participants', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'HACK_TIME',
        hackTimeDetails: {
          totalHours: 8,
          dailyAllocations: [{ date: '2026-03-10', hours: 8, type: 'HACK' }],
        },
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToMoneyParticipants(allocations, persons);

    expect(result).toHaveLength(0);
  });

  it('defaults amount to 0 when studyMoneyDetails is undefined', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'STUDY_MONEY',
        hackTimeDetails: undefined,
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToMoneyParticipants(allocations, persons);

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(0);
  });
});

// --- EVT-01/EVT-02/EVT-03: diffAllocations ---

describe('diffAllocations', () => {
  const eventFrom = dayjs('2026-03-10');

  it('creates new allocations when no loaded allocations exist', () => {
    const currentTime: PersonTimeAllocation[] = [
      {
        personId: 'p1',
        personName: 'Alice Smith',
        hackPeriod: { from: dayjs('2026-03-10'), to: dayjs('2026-03-11'), days: [8, 8] },
        studyPeriod: null,
      },
    ];
    const currentMoney: PersonMoneyAllocation[] = [
      { personId: 'p1', personName: 'Alice Smith', amount: 300 },
    ];

    const { toCreate, toUpdate, toDelete } = diffAllocations(
      [],
      currentTime,
      currentMoney,
      'EVT1',
      eventFrom,
      null,
    );

    expect(toCreate).toHaveLength(2); // hack time + money
    expect(toCreate[0].type).toBe('hack');
    expect(toCreate[1].type).toBe('money');
    expect(toUpdate).toHaveLength(0);
    expect(toDelete).toHaveLength(0);
  });

  it('deletes allocations for removed participants', () => {
    const loaded: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'HACK_TIME',
        hackTimeDetails: {
          totalHours: 8,
          dailyAllocations: [{ date: '2026-03-10', hours: 8, type: 'HACK' }],
        },
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
    ];

    // Empty current lists = participant removed
    const { toCreate, toUpdate, toDelete } = diffAllocations(
      loaded,
      [],
      [],
      'EVT1',
      eventFrom,
      null,
    );

    expect(toCreate).toHaveLength(0);
    expect(toUpdate).toHaveLength(0);
    expect(toDelete).toEqual(['alloc-1']);
  });

  it('updates allocations when hours change', () => {
    const loaded: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'HACK_TIME',
        hackTimeDetails: {
          totalHours: 8,
          dailyAllocations: [{ date: '2026-03-10', hours: 8, type: 'HACK' }],
        },
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
    ];
    const currentTime: PersonTimeAllocation[] = [
      {
        personId: 'p1',
        personName: 'Alice Smith',
        hackPeriod: { from: dayjs('2026-03-10'), to: dayjs('2026-03-10'), days: [4] }, // changed from 8 to 4
        studyPeriod: null,
      },
    ];

    const { toCreate, toUpdate, toDelete } = diffAllocations(
      loaded,
      currentTime,
      [],
      'EVT1',
      eventFrom,
      null,
    );

    expect(toUpdate).toHaveLength(1);
    expect(toUpdate[0].type).toBe('hack');
    expect(toUpdate[0].id).toBe('alloc-1');
    expect(toCreate).toHaveLength(0);
    expect(toDelete).toHaveLength(0);
  });

  it('deletes allocation when period is set to null', () => {
    const loaded: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'HACK_TIME',
        hackTimeDetails: {
          totalHours: 8,
          dailyAllocations: [{ date: '2026-03-10', hours: 8, type: 'HACK' }],
        },
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
    ];
    const currentTime: PersonTimeAllocation[] = [
      {
        personId: 'p1',
        personName: 'Alice Smith',
        hackPeriod: null, // removed
        studyPeriod: null,
      },
    ];

    const { toCreate, toUpdate, toDelete } = diffAllocations(
      loaded,
      currentTime,
      [],
      'EVT1',
      eventFrom,
      null,
    );

    expect(toDelete).toEqual(['alloc-1']);
    expect(toCreate).toHaveLength(0);
    expect(toUpdate).toHaveLength(0);
  });

  it('skips unchanged allocations', () => {
    const loaded: BudgetAllocation[] = [
      {
        id: 'alloc-1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'HACK_TIME',
        hackTimeDetails: {
          totalHours: 8,
          dailyAllocations: [{ date: '2026-03-10', hours: 8, type: 'HACK' }],
        },
        studyTimeDetails: undefined,
        studyMoneyDetails: undefined,
      },
    ];
    const currentTime: PersonTimeAllocation[] = [
      {
        personId: 'p1',
        personName: 'Alice Smith',
        hackPeriod: { from: dayjs('2026-03-10'), to: dayjs('2026-03-10'), days: [8] }, // same
        studyPeriod: null,
      },
    ];

    const { toCreate, toUpdate, toDelete } = diffAllocations(
      loaded,
      currentTime,
      [],
      'EVT1',
      eventFrom,
      null,
    );

    expect(toCreate).toHaveLength(0);
    expect(toUpdate).toHaveLength(0);
    expect(toDelete).toHaveLength(0);
  });

  it('deletes money allocation when amount becomes zero', () => {
    const loaded: BudgetAllocation[] = [
      {
        id: 'alloc-m1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'STUDY_MONEY',
        hackTimeDetails: undefined,
        studyTimeDetails: undefined,
        studyMoneyDetails: { amount: 500, files: [] },
      },
    ];
    const currentMoney: PersonMoneyAllocation[] = [
      { personId: 'p1', personName: 'Alice Smith', amount: 0 },
    ];

    const { toCreate, toUpdate, toDelete } = diffAllocations(
      loaded,
      [],
      currentMoney,
      'EVT1',
      eventFrom,
      null,
    );

    expect(toDelete).toEqual(['alloc-m1']);
  });

  it('updates money allocation when amount changes', () => {
    const loaded: BudgetAllocation[] = [
      {
        id: 'alloc-m1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'STUDY_MONEY',
        hackTimeDetails: undefined,
        studyTimeDetails: undefined,
        studyMoneyDetails: { amount: 500, files: [] },
      },
    ];
    const currentMoney: PersonMoneyAllocation[] = [
      { personId: 'p1', personName: 'Alice Smith', amount: 750 },
    ];

    const { toCreate, toUpdate, toDelete } = diffAllocations(
      loaded,
      [],
      currentMoney,
      'EVT1',
      eventFrom,
      null,
    );

    expect(toUpdate).toHaveLength(1);
    expect(toUpdate[0].type).toBe('money');
    expect(toUpdate[0].id).toBe('alloc-m1');
  });
});

// --- EVT-04: eventBudgetTypeToAllocationType ---

describe('eventBudgetTypeToAllocationType', () => {
  it('maps HACK to HACK_TIME', () => {
    expect(eventBudgetTypeToAllocationType('HACK')).toBe('HACK_TIME');
  });

  it('maps STUDY to STUDY_TIME', () => {
    expect(eventBudgetTypeToAllocationType('STUDY')).toBe('STUDY_TIME');
  });
});

// --- EVT-04: eventBudgetTypeToDailyType ---

describe('eventBudgetTypeToDailyType', () => {
  it('maps HACK to HACK daily allocation type', () => {
    expect(eventBudgetTypeToDailyType('HACK')).toBe('HACK');
  });

  it('maps STUDY to STUDY daily allocation type', () => {
    expect(eventBudgetTypeToDailyType('STUDY')).toBe('STUDY');
  });
});

// --- ALLOC-01 / ALLOC-02: generateDefaultAllocations ---

describe('generateDefaultAllocations', () => {
  const persons = [
    { uuid: 'p1', firstname: 'Alice', lastname: 'Smith' },
    { uuid: 'p2', firstname: 'Bob', lastname: 'Jones' },
  ];
  const eventFrom = dayjs('2026-03-10');
  const days = [8, 8, 8]; // 3-day event

  it('HACK type sets hackPeriod with correct from/to/days and studyPeriod is null', () => {
    const { timeParticipants } = generateDefaultAllocations(
      ['p1'],
      persons,
      eventFrom,
      days,
      'HACK',
      0,
      EventType.FLOCK_HACK_DAY,
    );

    expect(timeParticipants).toHaveLength(1);
    expect(timeParticipants[0].hackPeriod).not.toBeNull();
    expect(timeParticipants[0].hackPeriod!.from.format('YYYY-MM-DD')).toBe('2026-03-10');
    expect(timeParticipants[0].hackPeriod!.to.format('YYYY-MM-DD')).toBe('2026-03-12'); // +2 days (length-1)
    expect(timeParticipants[0].hackPeriod!.days).toEqual([8, 8, 8]);
    expect(timeParticipants[0].studyPeriod).toBeNull();
  });

  it('STUDY type sets studyPeriod with correct from/to/days and hackPeriod is null', () => {
    const { timeParticipants } = generateDefaultAllocations(
      ['p1'],
      persons,
      eventFrom,
      days,
      'STUDY',
      0,
      EventType.CONFERENCE,
    );

    expect(timeParticipants).toHaveLength(1);
    expect(timeParticipants[0].studyPeriod).not.toBeNull();
    expect(timeParticipants[0].studyPeriod!.from.format('YYYY-MM-DD')).toBe('2026-03-10');
    expect(timeParticipants[0].studyPeriod!.to.format('YYYY-MM-DD')).toBe('2026-03-12');
    expect(timeParticipants[0].studyPeriod!.days).toEqual([8, 8, 8]);
    expect(timeParticipants[0].hackPeriod).toBeNull();
  });

  it('null type sets both hackPeriod and studyPeriod to null', () => {
    const { timeParticipants } = generateDefaultAllocations(
      ['p1'],
      persons,
      eventFrom,
      days,
      null,
      0,
      EventType.GENERAL_EVENT,
    );

    expect(timeParticipants).toHaveLength(1);
    expect(timeParticipants[0].hackPeriod).toBeNull();
    expect(timeParticipants[0].studyPeriod).toBeNull();
  });

  it('distributes 500 budget equally: 250.00 per person for 2 people', () => {
    const { moneyParticipants } = generateDefaultAllocations(
      ['p1', 'p2'],
      persons,
      eventFrom,
      days,
      null,
      500,
      EventType.CONFERENCE,
    );

    expect(moneyParticipants).toHaveLength(2);
    expect(moneyParticipants[0].amount).toBe(250);
    expect(moneyParticipants[1].amount).toBe(250);
  });

  it('rounds down to cents: 100 / 3 people = 33.33 (not 33.34)', () => {
    const threePersons = [
      ...persons,
      { uuid: 'p3', firstname: 'Carol', lastname: 'White' },
    ];
    const { moneyParticipants } = generateDefaultAllocations(
      ['p1', 'p2', 'p3'],
      threePersons,
      eventFrom,
      days,
      null,
      100,
      EventType.CONFERENCE,
    );

    expect(moneyParticipants).toHaveLength(3);
    moneyParticipants.forEach((p) => {
      expect(p.amount).toBe(33.33);
    });
  });

  it('zero budget still creates money allocation entries with amount 0', () => {
    const { moneyParticipants } = generateDefaultAllocations(
      ['p1', 'p2'],
      persons,
      eventFrom,
      days,
      null,
      0,
      EventType.CONFERENCE,
    );

    expect(moneyParticipants).toHaveLength(2);
    expect(moneyParticipants[0].amount).toBe(0);
    expect(moneyParticipants[1].amount).toBe(0);
  });

  it('empty personIds returns empty timeParticipants and moneyParticipants arrays', () => {
    const { timeParticipants, moneyParticipants } = generateDefaultAllocations(
      [],
      persons,
      eventFrom,
      days,
      'HACK',
      500,
      EventType.FLOCK_HACK_DAY,
    );

    expect(timeParticipants).toEqual([]);
    expect(moneyParticipants).toEqual([]);
  });

  // gap closure: GENERAL_EVENT and FLOCK_COMMUNITY_DAY must never produce money participants
  it('gap closure: GENERAL_EVENT produces empty moneyParticipants regardless of budget', () => {
    const { moneyParticipants } = generateDefaultAllocations(
      ['p1', 'p2'],
      persons,
      eventFrom,
      days,
      null,
      500,
      EventType.GENERAL_EVENT,
    );

    expect(moneyParticipants).toEqual([]);
  });

  it('gap closure: FLOCK_COMMUNITY_DAY produces empty moneyParticipants regardless of budget', () => {
    const { moneyParticipants } = generateDefaultAllocations(
      ['p1', 'p2'],
      persons,
      eventFrom,
      days,
      null,
      500,
      EventType.FLOCK_COMMUNITY_DAY,
    );

    expect(moneyParticipants).toEqual([]);
  });
});
