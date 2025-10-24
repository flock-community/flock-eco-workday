import { EventClient, FlockEvent } from "../clients/EventClient";

export const subscribeToEvent = (event: FlockEvent): Promise<FlockEvent> => {
  return EventClient.subscribeToEvent(event);
};

export const unsubscribeFromEvent = (
  event: FlockEvent
): Promise<FlockEvent> => {
  return EventClient.unsubscribeFromEvent(event);
};

export const isPersonAttending = (
  event: FlockEvent,
  personUUID: string
): boolean => {
  return (
    event.persons.filter((person) => person.uuid === personUUID).length > 0
  );
};
