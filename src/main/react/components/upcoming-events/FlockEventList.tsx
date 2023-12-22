import React from 'react';
import {FlockEvent} from "../../clients/EventClient";
import List from "@material-ui/core/List";
import Typography from "@material-ui/core/Typography";
import {FlockEventListItem} from "./FlockEventListItem";

type FlockEventListProps = {
  events: FlockEvent[]
}

export function FlockEventList({events}: FlockEventListProps) {

  if (events && events.length === 0) {
    return <Typography display={"block"}>No events are planned.</Typography>
  }

  return (
    <List data-testid={'flock-event-list'}>
      {events.map((event, idx) => <FlockEventListItem key={idx} event={event}/>)}
    </List>
  )
}
