import React from 'react';
import {Card, CardHeader} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import {FlockEvent} from "../../clients/EventClient";
import {FlockEventList} from "./FlockEventList";

type UpcomingEventsCardProps = {
  items: FlockEvent[]
}

export function UpcomingEventsCard({items}: UpcomingEventsCardProps) {

  return (
    <Card variant={'outlined'} style={{borderRadius: 0}}>
      <CardHeader title={'Upcoming Events'}/>
      <CardContent>
        <FlockEventList events={items}/>
      </CardContent>
    </Card>
  )
}
