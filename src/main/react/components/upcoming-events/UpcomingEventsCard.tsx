import React, {useState} from 'react';
import {Card, CardActions, CardHeader} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import {FlockEvent} from "../../clients/EventClient";
import {EventList} from "./EventList";
import {FlockPagination} from "../pagination/FlockPagination";

type UpcomingEventsCardProps = {
  items: FlockEvent[],
  onEventToggle: (FlockEvent, boolean) => void
}

export function UpcomingEventsCard({items, onEventToggle}: UpcomingEventsCardProps) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  return (
    <Card variant={'outlined'} style={{borderRadius: 0, display: "flex", flexDirection: "column"}}>
      <CardHeader title={'Upcoming Events'}/>
      <CardContent>
        <EventList events={items.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
                   onEventToggle={onEventToggle}/>
      </CardContent>
      {(items.length > rowsPerPage) &&
        <CardActions style={{justifyContent: "end", marginTop: "auto"}}>
          <FlockPagination
            currentPage={page + 1}
            itemsPerPage={rowsPerPage}
            numberOfItems={items.length}
            changePageCb={setPage}/>
        </CardActions>}
    </Card>
  )
}
