import { EventType } from '../clients/EventClient';

export const EventTypeMapping: Record<EventType, string> = {
  [EventType.GENERAL_EVENT]: 'General event',
  [EventType.FLOCK_HACK_DAY]: 'Flock. Hack Day',
  [EventType.FLOCK_COMMUNITY_DAY]: 'Flock. Community Day',
  [EventType.CONFERENCE]: 'Conference',
  [EventType.PERIODIC_REVIEW]: 'Periodic review',
};

export const EventTypeMappingToBillable: Record<EventType, boolean> = {
  [EventType.GENERAL_EVENT]: false,
  [EventType.FLOCK_HACK_DAY]: false,
  [EventType.FLOCK_COMMUNITY_DAY]: true,
  [EventType.CONFERENCE]: false,
  [EventType.PERIODIC_REVIEW]: false,
};

// Mirrors backend Event.budgetCategory; keep in sync.
export const EventTypeBudgetLabel: Record<EventType, string | null> = {
  [EventType.GENERAL_EVENT]: null,
  [EventType.FLOCK_HACK_DAY]: 'Deducts from your hack day budget',
  [EventType.FLOCK_COMMUNITY_DAY]: null,
  [EventType.CONFERENCE]: 'Deducts from your training budget',
  [EventType.PERIODIC_REVIEW]: null,
};
