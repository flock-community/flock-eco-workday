import { EventType } from '../clients/EventClient';
import { BudgetAllocationType } from '../features/budget/mocks/BudgetAllocationTypes';

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

export const EventTypeMappingToDefaultBudgetType: Record<EventType, BudgetAllocationType | null> = {
  [EventType.GENERAL_EVENT]: null,
  [EventType.FLOCK_HACK_DAY]: BudgetAllocationType.HACK,
  [EventType.FLOCK_COMMUNITY_DAY]: null,
  [EventType.CONFERENCE]: BudgetAllocationType.STUDY,
};
