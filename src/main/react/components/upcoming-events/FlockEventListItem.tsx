import React, {useEffect, useState} from 'react';
import {FlockEvent} from "../../clients/EventClient";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import {DMY_DATE} from "../../clients/util/DateFormats";
import {FormControlLabel, FormGroup} from "@material-ui/core";
import Switch from "@material-ui/core/Switch";
import {isPersonAttending} from "../../utils/EventUtils";
import {usePerson} from "../../hooks/PersonHook";

type FlockEventListItemProps = {
  event: FlockEvent,
  onEventToggle: (FlockEvent, boolean) => void
}

export function FlockEventListItem({event, onEventToggle}: FlockEventListItemProps) {
  const [person] = usePerson();
  const [dateString, setDateString] = useState<string>('');
  const [btnState, setBtnState] = useState<boolean>(false);

  useEffect(() => {
    if (event) {
      initDateString();
      initButtonState();
    }
  }, [event]);

  const initDateString = (): void => {
    if (event.days.length === 1) {
      setDateString(`date: ${event.from.format(DMY_DATE)}`);
    } else {
      setDateString(`from: ${event.from.format(DMY_DATE)} to: ${event.to.format(DMY_DATE)}`);
    }
  }

  const initButtonState = (): void => {
    if (person?.uuid) {
      setBtnState(isPersonAttending(event, person.uuid));
    }
  }

  const handleChange = () => {
    setBtnState(!btnState);
    onEventToggle(event, !btnState);
  }

  return (
    <ListItem data-testid={'flock-event-list-item'}>
      <ListItemText primary={event.description}
                    secondary={dateString}/>
      <FormGroup row>
        <FormControlLabel
          control={<Switch checked={btnState} onChange={handleChange} size="small" name="presentToggle"/>}
          label="present" labelPlacement="start"
        />
      </FormGroup>
    </ListItem>
  )
}
