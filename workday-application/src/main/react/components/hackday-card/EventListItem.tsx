import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { FlockEvent } from "../../clients/EventClient";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { DMY_DATE } from "../../clients/util/DateFormats";
import { FormGroup } from "@mui/material";
import Switch from "@mui/material/Switch";
import { isPersonAttending } from "../../utils/EventUtils";
import { usePerson } from "../../hooks/PersonHook";
const PREFIX = "EventListItem";

const classes = {
  active: `${PREFIX}-active`,
};

const StyledListItem = styled(ListItem)(() => ({
  [`& .${classes.active}`]: {
    backgroundColor: "rgba(252, 222, 0, .1);",
  },
}));

type FlockEventListItemProps = {
  event: FlockEvent;
  onEventToggle: (flockEvent: FlockEvent, isSubscribed: boolean) => void;
};

export function EventListItem({
  event,
  onEventToggle,
}: FlockEventListItemProps) {
  const [person] = usePerson();
  const [dateString, setDateString] = useState<string>("");
  const [btnState, setBtnState] = useState<boolean>(false);

  useEffect(() => {
    if (event) {
      initDateString();
      initButtonState();
    }
  }, [event]);

  const initDateString = (): void => {
    if (event.from.isSame(event.to, "day")) {
      setDateString(`date: ${event.from.format(DMY_DATE)}`);
    } else {
      setDateString(
        `from: ${event.from.format(DMY_DATE)} to: ${event.to.format(DMY_DATE)}`
      );
    }
  };

  const initButtonState = (): void => {
    if (person?.uuid) {
      setBtnState(isPersonAttending(event, person.uuid));
    }
  };

  const handleChange = () => {
    setBtnState(!btnState);
    onEventToggle(event, !btnState);
  };

  const getClasses = (): string => {
    return btnState ? classes.active : "";
  };

  return (
    <StyledListItem
      data-testid={"flock-event-list-item"}
      className={getClasses()}
    >
      <ListItemText primary={event.description} secondary={dateString} />
      <FormGroup row>
        <Switch
          checked={btnState}
          onChange={handleChange}
          name="presentToggle"
          color="primary"
        />
      </FormGroup>
    </StyledListItem>
  );
}
