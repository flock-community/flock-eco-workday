import { EventType } from '../../clients/EventClient';
import {
  initParticipants,
  type Participant,
  toEventDayForms,
} from './EventParticipants';

const participant = (over: Partial<Participant>): Participant => ({
  personId: 'a',
  hours: 16,
  ...over,
});

describe('toEventDayForms', () => {
  it('non-split conference emits one TRAINING row carrying the blueprint days', () => {
    const forms = toEventDayForms(
      [participant({ hours: 16, cost: 1200 })],
      EventType.CONFERENCE,
      [8, 8],
    );
    expect(forms).toEqual([
      {
        personId: 'a',
        hours: 16,
        cost: 1200,
        budgetCategory: null,
        days: [8, 8],
      },
    ]);
  });

  it('a hack split emits a HACK and a TRAINING row, each with its own per-day shape', () => {
    const forms = toEventDayForms(
      [participant({ hours: 16, days: [8, 0], hackDays: [0, 8], cost: 1200 })],
      EventType.CONFERENCE,
      [8, 8],
    );
    expect(forms).toEqual([
      {
        personId: 'a',
        hours: 8,
        cost: null,
        budgetCategory: 'HACK',
        days: [0, 8],
      },
      {
        personId: 'a',
        hours: 8,
        cost: 1200,
        budgetCategory: null,
        days: [8, 0],
      },
    ]);
  });

  it('hack-day event is hours-only with no money', () => {
    const forms = toEventDayForms(
      [participant({ hours: 8 })],
      EventType.FLOCK_HACK_DAY,
      [8],
    );
    expect(forms).toEqual([
      { personId: 'a', hours: 8, cost: null, budgetCategory: null, days: [8] },
    ]);
  });
});

describe('initParticipants', () => {
  it('aggregates a split person HACK + TRAINING event days back into one participant', () => {
    const parts = initParticipants(
      [
        { personId: 'a', hours: 8, budgetCategory: 'HACK', days: [0, 8] },
        {
          personId: 'a',
          hours: 8,
          cost: 1200,
          budgetCategory: 'TRAINING',
          days: [8, 0],
        },
      ],
      16,
      EventType.CONFERENCE,
      1200,
      [8, 8],
    );
    expect(parts).toHaveLength(1);
    expect(parts[0]).toMatchObject({
      personId: 'a',
      hours: 16,
      hackDays: [0, 8],
      cost: 1200,
      days: [8, 0],
    });
  });

  it('keeps a hack-day event-category row in the primary bucket so a round-trip does not zero its hours', () => {
    const parts = initParticipants(
      [{ personId: 'a', hours: 8, budgetCategory: 'HACK', days: [8] }],
      8,
      EventType.FLOCK_HACK_DAY,
      0,
      [8],
    );
    expect(parts[0]).toMatchObject({ hours: 8, days: undefined });
    expect(parts[0].hackDays).toBeUndefined();

    const forms = toEventDayForms(parts, EventType.FLOCK_HACK_DAY, [8]);
    expect(forms).toEqual([
      { personId: 'a', hours: 8, cost: null, budgetCategory: null, days: [8] },
    ]);
  });

  it('treats a saved per-day array equal to the blueprint as inherited (no override)', () => {
    const parts = initParticipants(
      [
        {
          personId: 'a',
          hours: 16,
          cost: 1200,
          budgetCategory: 'TRAINING',
          days: [8, 8],
        },
      ],
      16,
      EventType.CONFERENCE,
      1200,
      [8, 8],
    );
    expect(parts[0].days).toBeUndefined();
    expect(parts[0].hackDays).toBeUndefined();
  });
});
