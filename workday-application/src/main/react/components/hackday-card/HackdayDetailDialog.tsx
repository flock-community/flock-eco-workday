import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, Divider } from "@mui/material";
import { DialogHeader } from "../dialog";
import EventIcon from "@mui/icons-material/CalendarToday";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
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
