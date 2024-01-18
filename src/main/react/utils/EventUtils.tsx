import {FlockEvent, EventClient} from "../clients/EventClient";

export const handleEventToggle = (event: FlockEvent, isPresent: boolean): Promise<FlockEvent> => {
  if (isPresent) {
    return EventClient.subscribeToEvent(event);
  } else {
    return EventClient.unsubscribeFromEvent(event);
  }
}

export const isPersonAttending = (event: FlockEvent, personUUID: string): boolean => {
  return event.persons.filter((person) => person.uuid === personUUID).length > 0;
}
