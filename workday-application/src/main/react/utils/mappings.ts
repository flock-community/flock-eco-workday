import { EventType } from '../clients/EventClient';

/**
 * Budget allocation type for event forms.
 * These are UI-level constants used in event defaultTimeAllocationType field.
 * Not to be confused with wirespec BudgetAllocationType (HACK_TIME/STUDY_TIME/STUDY_MONEY).
 */
export const EventBudgetType = {
  STUDY: 'STUDY',
  HACK: 'HACK',
} as const;
export type EventBudgetType = (typeof EventBudgetType)[keyof typeof EventBudgetType];

export const EventTypeMapping: Record<EventType, string> = {
  [EventType.GENERAL_EVENT]: 'General event',
  [EventType.FLOCK_HACK_DAY]: 'Flock. Hack Day',
  [EventType.FLOCK_COMMUNITY_DAY]: 'Flock. Community Day',
  [EventType.CONFERENCE]: 'Conference',
};

export const EventTypeMappingToBillable: Record<EventType, boolean> = {
  [EventType.GENERAL_EVENT]: false,
  [EventType.FLOCK_HACK_DAY]: false,
  [EventType.FLOCK_COMMUNITY_DAY]: true,
  [EventType.CONFERENCE]: false,
};

export const EventTypeMappingToDefaultBudgetType: Record<EventType, EventBudgetType | null> = {
  [EventType.GENERAL_EVENT]: null,
  [EventType.FLOCK_HACK_DAY]: EventBudgetType.HACK,
  [EventType.FLOCK_COMMUNITY_DAY]: null,
  [EventType.CONFERENCE]: EventBudgetType.STUDY,
};
