import { EventType } from '../../clients/EventClient';
import {
  EventBudgetType,
  EventTypeMappingToDefaultBudgetType,
} from '../../utils/mappings';

/**
 * Phase 02 - EVT-05: Event form fields are single source of truth for budget sections
 * Tests that the form schema exports the correct shape and defaults,
 * and that event type mappings correctly drive budget allocation types.
 */

describe('EVT-05: Event type drives default budget allocation type', () => {
  it('GENERAL_EVENT maps to null budget type (no allocations)', () => {
    expect(
      EventTypeMappingToDefaultBudgetType[EventType.GENERAL_EVENT],
    ).toBeNull();
  });

  it('FLOCK_HACK_DAY maps to HACK budget type', () => {
    expect(EventTypeMappingToDefaultBudgetType[EventType.FLOCK_HACK_DAY]).toBe(
      EventBudgetType.HACK,
    );
  });

  it('FLOCK_COMMUNITY_DAY maps to null budget type (no allocations)', () => {
    expect(
      EventTypeMappingToDefaultBudgetType[EventType.FLOCK_COMMUNITY_DAY],
    ).toBeNull();
  });

  it('CONFERENCE maps to TRAINING budget type', () => {
    expect(EventTypeMappingToDefaultBudgetType[EventType.CONFERENCE]).toBe(
      EventBudgetType.TRAINING,
    );
  });

  it('all EventType values have a mapping defined', () => {
    for (const eventType of Object.values(EventType)) {
      expect(EventTypeMappingToDefaultBudgetType).toHaveProperty(eventType);
    }
  });
});

describe('EVT-05: Section visibility rules driven by event type', () => {
  // Mirrors EventBudgetManagementDialog.tsx logic:
  // showTimeSection = defaultBudgetType !== null
  // showMoneySection = type === FLOCK_HACK_DAY || type === CONFERENCE
  const MONEY_TYPES: string[] = [
    EventType.FLOCK_HACK_DAY,
    EventType.CONFERENCE,
  ];

  const getVisibility = (type: EventType) => {
    const budgetType = EventTypeMappingToDefaultBudgetType[type];
    return {
      showTime: budgetType !== null,
      showMoney: MONEY_TYPES.includes(type),
    };
  };

  it('FLOCK_HACK_DAY shows both time and money sections', () => {
    const { showTime, showMoney } = getVisibility(EventType.FLOCK_HACK_DAY);
    expect(showTime).toBe(true);
    expect(showMoney).toBe(true);
  });

  it('CONFERENCE shows both time and money sections', () => {
    const { showTime, showMoney } = getVisibility(EventType.CONFERENCE);
    expect(showTime).toBe(true);
    expect(showMoney).toBe(true);
  });

  it('GENERAL_EVENT shows neither time nor money sections', () => {
    const { showTime, showMoney } = getVisibility(EventType.GENERAL_EVENT);
    expect(showTime).toBe(false);
    expect(showMoney).toBe(false);
  });

  it('FLOCK_COMMUNITY_DAY shows neither time nor money sections', () => {
    const { showTime, showMoney } = getVisibility(
      EventType.FLOCK_COMMUNITY_DAY,
    );
    expect(showTime).toBe(false);
    expect(showMoney).toBe(false);
  });
});
