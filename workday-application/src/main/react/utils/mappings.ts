import { EventType } from '../clients/EventClient';

// UI-level constant for an event's default time-allocation type; values match the wire AllocationType.
export const EventBudgetType = {
  TRAINING: 'TRAINING',
  HACK: 'HACK',
} as const;
export type EventBudgetType =
  (typeof EventBudgetType)[keyof typeof EventBudgetType];

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

export const EventTypeMappingToDefaultBudgetType: Record<
  EventType,
  EventBudgetType | null
> = {
  [EventType.GENERAL_EVENT]: null,
  [EventType.FLOCK_HACK_DAY]: EventBudgetType.HACK,
  [EventType.FLOCK_COMMUNITY_DAY]: null,
  [EventType.CONFERENCE]: EventBudgetType.TRAINING,
};
