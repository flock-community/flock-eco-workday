import React from 'react';
import {FlockEvent} from "../../clients/EventClient";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import {EventListItem} from "./EventListItem";

type FlockEventListProps = {
  events: FlockEvent[],
  onEventToggle: (FlockEvent, boolean) => void
}

export function EventList({events, onEventToggle}: FlockEventListProps) {

  if (events && events.length === 0) {
    return <Typography display={"block"}>There are no events planned.</Typography>
  }

  return (
    <List data-testid={'flock-event-list'}>
      {events.map((event) => <EventListItem key={event.id} event={event} onEventToggle={onEventToggle}/>)}
    </List>
  )
}
