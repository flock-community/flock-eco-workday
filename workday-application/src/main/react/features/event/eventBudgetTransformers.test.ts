import dayjs from 'dayjs';
import type {
  BudgetAllocation,
  DailyTimeAllocationItem,
} from '../../wirespec/model';
import {
  apiAllocationsToMoneyParticipants,
  apiAllocationsToTimeParticipants,
  dailyAllocationsToPeriod,
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
          dailyAllocations: [{ date: '2026-03-12', hours: 4, type: 'TRAINING' }],
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
