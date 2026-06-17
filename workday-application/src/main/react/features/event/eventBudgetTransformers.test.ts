import dayjs from 'dayjs';
import type {
  BudgetAllocation,
  DailyTimeAllocationItem,
  HackTimeAllocationInput,
} from '../../wirespec/model';
import type { PersonTimeAllocation } from './EventTimeAllocationSection';
import {
  apiAllocationsToMoneyParticipants,
  apiAllocationsToTimeParticipants,
  dailyAllocationsToPeriod,
  diffTimeOverrides,
  periodToDailyAllocations,
} from './eventBudgetTransformers';

describe('dailyAllocationsToPeriod', () => {
  it('converts daily allocation items back to a period with correct days array', () => {
    const dailyAllocations: DailyTimeAllocationItem[] = [
      { date: '2026-03-10', hours: 8, type: 'HACK' },
      { date: '2026-03-12', hours: 4, type: 'HACK' },
    ];
    const eventFrom = dayjs('2026-03-10');
    const eventTo = dayjs('2026-03-12');

    const result = dailyAllocationsToPeriod(
      dailyAllocations,
      eventFrom,
      eventTo,
    );

    expect(result.from.format('YYYY-MM-DD')).toBe('2026-03-10');
    expect(result.to.format('YYYY-MM-DD')).toBe('2026-03-12');
    expect(result.days).toEqual([8, 0, 4]);
  });

  it('initializes missing days to zero', () => {
    const dailyAllocations: DailyTimeAllocationItem[] = [
      { date: '2026-03-11', hours: 6, type: 'TRAINING' },
    ];
    const eventFrom = dayjs('2026-03-10');
    const eventTo = dayjs('2026-03-13');

    const result = dailyAllocationsToPeriod(
      dailyAllocations,
      eventFrom,
      eventTo,
    );

    expect(result.days).toEqual([0, 6, 0, 0]);
  });

  it('ignores allocations outside the event date range', () => {
    const dailyAllocations: DailyTimeAllocationItem[] = [
      { date: '2026-03-09', hours: 8, type: 'HACK' },
      { date: '2026-03-10', hours: 4, type: 'HACK' },
      { date: '2026-03-14', hours: 2, type: 'HACK' },
    ];
    const eventFrom = dayjs('2026-03-10');
    const eventTo = dayjs('2026-03-12');

    const result = dailyAllocationsToPeriod(
      dailyAllocations,
      eventFrom,
      eventTo,
    );

    expect(result.days).toEqual([4, 0, 0]);
  });
});

describe('apiAllocationsToTimeParticipants', () => {
  const persons = [
    { uuid: 'p1', firstname: 'Alice', lastname: 'Smith' },
    { uuid: 'p2', firstname: 'Bob', lastname: 'Jones' },
  ];
  const eventFrom = dayjs('2026-03-10');
  const eventTo = dayjs('2026-03-12');

  it('groups hack and training time allocations by person', () => {
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
        trainingTimeDetails: undefined,
        trainingMoneyDetails: undefined,
      },
      {
        id: 'a2',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'TRAINING_TIME',
        hackTimeDetails: undefined,
        trainingTimeDetails: {
          totalHours: 4,
          dailyAllocations: [
            { date: '2026-03-12', hours: 4, type: 'TRAINING' },
          ],
        },
        trainingMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToTimeParticipants(
      allocations,
      persons,
      eventFrom,
      eventTo,
    );

    expect(result).toHaveLength(1);
    expect(result[0].personId).toBe('p1');
    expect(result[0].personName).toBe('Alice Smith');
    expect(result[0].hackPeriod).not.toBeNull();
    expect(result[0].hackPeriod!.days).toEqual([8, 8, 0]);
    expect(result[0].trainingPeriod).not.toBeNull();
    expect(result[0].trainingPeriod!.days).toEqual([0, 0, 4]);
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
        trainingTimeDetails: undefined,
        trainingMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToTimeParticipants(
      allocations,
      persons,
      eventFrom,
      eventTo,
    );

    expect(result).toHaveLength(1);
    expect(result[0].personId).toBe('p2');
    expect(result[0].hackPeriod).not.toBeNull();
    expect(result[0].trainingPeriod).toBeNull();
  });

  it('excludes money allocations from time participants', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'TRAINING_MONEY',
        hackTimeDetails: undefined,
        trainingTimeDetails: undefined,
        trainingMoneyDetails: { amount: 500, files: [] },
      },
    ];

    const result = apiAllocationsToTimeParticipants(
      allocations,
      persons,
      eventFrom,
      eventTo,
    );

    expect(result).toHaveLength(0);
  });
});

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
        type: 'TRAINING_MONEY',
        hackTimeDetails: undefined,
        trainingTimeDetails: undefined,
        trainingMoneyDetails: { amount: 500, files: [] },
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
        trainingTimeDetails: undefined,
        trainingMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToMoneyParticipants(allocations, persons);

    expect(result).toHaveLength(0);
  });

  it('defaults amount to 0 when trainingMoneyDetails is undefined', () => {
    const allocations: BudgetAllocation[] = [
      {
        id: 'a1',
        personId: 'p1',
        eventCode: 'EVT1',
        date: '2026-03-10',
        description: undefined,
        type: 'TRAINING_MONEY',
        hackTimeDetails: undefined,
        trainingTimeDetails: undefined,
        trainingMoneyDetails: undefined,
      },
    ];

    const result = apiAllocationsToMoneyParticipants(allocations, persons);

    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(0);
  });
});

describe('periodToDailyAllocations', () => {
  it('maps positional days to dates and drops zero-hour days', () => {
    const period = {
      from: dayjs('2026-03-10'),
      to: dayjs('2026-03-12'),
      days: [8, 0, 4],
    };

    expect(periodToDailyAllocations(period, 'HACK')).toEqual([
      { date: '2026-03-10', hours: 8, type: 'HACK' },
      { date: '2026-03-12', hours: 4, type: 'HACK' },
    ]);
  });

  it('returns an empty array when the period has no days', () => {
    const period = {
      from: dayjs('2026-03-10'),
      to: dayjs('2026-03-10'),
      days: [],
    };
    expect(periodToDailyAllocations(period, 'TRAINING')).toEqual([]);
  });
});

describe('diffTimeOverrides', () => {
  const eventFrom = dayjs('2026-03-10');
  const eventDefaultDays = [8, 8]; // 2-day event, 8h/day
  const defaultBudgetType = 'HACK' as const;

  const defaultHackDaily: DailyTimeAllocationItem[] = [
    { date: '2026-03-10', hours: 8, type: 'HACK' },
    { date: '2026-03-11', hours: 8, type: 'HACK' },
  ];

  const fullDay = (days: number[]) => ({
    from: eventFrom,
    to: eventFrom.add(days.length - 1, 'day'),
    days,
  });

  const hackAllocation = (
    id: string,
    personId: string,
    daily: DailyTimeAllocationItem[],
  ): BudgetAllocation => ({
    id,
    personId,
    eventCode: 'EVT1',
    date: '2026-03-10',
    description: undefined,
    type: 'HACK_TIME',
    hackTimeDetails: {
      totalHours: daily.reduce((sum, d) => sum + d.hours, 0),
      dailyAllocations: daily,
    },
    trainingTimeDetails: undefined,
    trainingMoneyDetails: undefined,
  });

  const run = (
    fresh: BudgetAllocation[],
    participants: PersonTimeAllocation[],
  ) =>
    diffTimeOverrides(
      fresh,
      participants,
      eventDefaultDays,
      defaultBudgetType,
      'EVT1',
      eventFrom,
    );

  it('leaves a participant on the default untouched', () => {
    const diff = run(
      [hackAllocation('a1', 'p1', defaultHackDaily)],
      [
        {
          personId: 'p1',
          personName: 'Alice Smith',
          hackPeriod: fullDay([8, 8]),
          trainingPeriod: null,
        },
      ],
    );

    expect(diff.toCreate).toHaveLength(0);
    expect(diff.toUpdate).toHaveLength(0);
    expect(diff.toDelete).toHaveLength(0);
  });

  it('updates the fresh row when a participant deviates from the default', () => {
    const { toCreate, toUpdate, toDelete } = run(
      [hackAllocation('a1', 'p1', defaultHackDaily)],
      [
        {
          personId: 'p1',
          personName: 'Alice Smith',
          hackPeriod: fullDay([8, 4]),
          trainingPeriod: null,
        },
      ],
    );

    expect(toCreate).toHaveLength(0);
    expect(toDelete).toHaveLength(0);
    expect(toUpdate).toHaveLength(1);
    expect(toUpdate[0].type).toBe('hack');
    expect(toUpdate[0].id).toBe('a1');
    const input = toUpdate[0].input as HackTimeAllocationInput;
    expect(input.dailyAllocations).toEqual([
      { date: '2026-03-10', hours: 8, type: 'HACK' },
      { date: '2026-03-11', hours: 4, type: 'HACK' },
    ]);
  });

  it('creates an override when no fresh row exists for the deviation', () => {
    const diff = run(
      [],
      [
        {
          personId: 'p1',
          personName: 'Alice Smith',
          hackPeriod: fullDay([8, 4]),
          trainingPeriod: null,
        },
      ],
    );

    expect(diff.toUpdate).toHaveLength(0);
    expect(diff.toCreate).toHaveLength(1);
    expect(diff.toCreate[0].type).toBe('hack');
  });

  it('switches type: deletes the default-type row and creates the other type', () => {
    const diff = run(
      [hackAllocation('a1', 'p1', defaultHackDaily)],
      [
        {
          personId: 'p1',
          personName: 'Alice Smith',
          hackPeriod: null,
          trainingPeriod: fullDay([8, 8]),
        },
      ],
    );

    expect(diff.toDelete).toEqual(['a1']);
    expect(diff.toCreate).toHaveLength(1);
    expect(diff.toCreate[0].type).toBe('training');
  });
});
