import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Divider } from "@material-ui/core";
import { DialogHeader } from "../dialog";
import EventIcon from "@material-ui/icons/CalendarToday";
import ListItem from "@material-ui/core/ListItem";
import List from "@material-ui/core/List";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import { PersonHackdayDetails } from "../../clients/AggregationClient";
import { hoursFormatter } from "../../utils/Hours";
import { FlockEvent } from "../../clients/EventClient";
import { HackDayList } from "./HackDayList";

const initialData: PersonHackdayDetails = {
  name: "",
  hackHoursFromContract: 0,
  hackHoursUsed: 0,
  totalHoursRemaining: 0,
};

type HackdayDetailDialogProps = {
  open: boolean;
  item: PersonHackdayDetails;
  onComplete: () => void;
  onEventToggle: (event: FlockEvent, isPresent: boolean) => void;
  hackEvents: FlockEvent[];
};

export function HackdayDetailDialog({
  open,
  item,
  onComplete,
  onEventToggle,
  hackEvents,
}: HackdayDetailDialogProps) {
  const [state, setState] = useState<PersonHackdayDetails>(initialData);

  useEffect(() => {
    if (open) {
      setState(item);
    }
  }, [open, item]);

  const handleClose = () => {
    setState(initialData);
    onComplete();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={"sm"}
      fullWidth={true}
      PaperProps={{ square: true }}
    >
      <DialogHeader
        onClose={handleClose}
        icon={<EventIcon />}
        headline={"Hack hours details"}
      />
      <DialogContent style={{ padding: "32px 24px" }}>
        <List dense={true}>
          <ListItem>
            <ListItemText primary={"Contract"} />
            <ListItemSecondaryAction>
              {hoursFormatter.format(state?.hackHoursFromContract)}
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary={"Used"} />
            <ListItemSecondaryAction>
              {hoursFormatter.format(state?.hackHoursUsed)}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem style={{ fontStyle: "italic" }}>
            <ListItemText primary={"Remaining"} />
            <ListItemSecondaryAction style={{ fontStyle: "italic" }}>
              {hoursFormatter.format(state?.totalHoursRemaining)}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
        </List>
        <HackDayList items={hackEvents} onEventToggle={onEventToggle} />
      </DialogContent>
    </Dialog>
  );
}
