import {FlockEvent, EventClient} from "../clients/EventClient";

export const handleEventToggle = (event: FlockEvent, isPresent: boolean) => {
  if (isPresent) {
    EventClient.subscribeToEvent(event);
  } else {
    EventClient.unsubscribeFromEvent(event);
  }
}

export const isPersonAttending = (event: FlockEvent, personUUID: string): boolean => {
  return event.persons.filter((person) => person.uuid === personUUID).length > 0;
}
