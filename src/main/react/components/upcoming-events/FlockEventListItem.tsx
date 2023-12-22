import React, {useEffect, useState} from 'react';
import {FlockEvent} from "../../clients/EventClient";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {DMY_DATE} from "../../clients/util/DateFormats";
import dayjs from "dayjs";

type FlockEventListItemProps = {
  event: FlockEvent
}

export function FlockEventListItem({event}: FlockEventListItemProps) {
  const [dateString, setDateString] = useState<string>('');

  useEffect(() => {
    if (event.days.length === 1) {
      setDateString(`date: ${event.from.format(DMY_DATE)}`);
    } else {
      setDateString(`from: ${event.from.format(DMY_DATE)} to: ${event.to.format(DMY_DATE)}`);
    }
  }, [event]);

  return (
    <ListItem data-testid={'flock-event-list-item'}>
      <ListItemText primary={event.description}
                    secondary={dateString}/>
    </ListItem>
  )
}
