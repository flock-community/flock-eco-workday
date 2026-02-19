import EventIcon from '@mui/icons-material/CalendarToday';
import { Dialog, Divider } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import type { PersonHackdayDetails } from '../../clients/AggregationClient';
import { hoursFormatter } from '../../utils/Hours';

const initialData: PersonHackdayDetails = {
  name: '',
  hackHoursFromContract: 0,
  hackHoursUsed: 0,
  totalHoursRemaining: 0,
};

type HackdayDetailDialogProps = {
  open: boolean;
  item: PersonHackdayDetails;
  onComplete: () => void;
};

export function HackdayDetailDialog({
  open,
  item,
  onComplete,
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
      maxWidth={'sm'}
      fullWidth={true}
      PaperProps={{ square: true }}
    >
      <DialogHeader
        onClose={handleClose}
        icon={<EventIcon />}
        headline={'Hack hours details'}
      />
      <DialogBody>
        <List dense={true}>
          <ListItem>
            <ListItemText primary={'Contract'} />
            <ListItemSecondaryAction>
              {hoursFormatter.format(state?.hackHoursFromContract)}
            </ListItemSecondaryAction>
          </ListItem>
          <ListItem>
            <ListItemText primary={'Used'} />
            <ListItemSecondaryAction>
              {hoursFormatter.format(state?.hackHoursUsed)}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
          <ListItem style={{ fontStyle: 'italic' }}>
            <ListItemText primary={'Remaining'} />
            <ListItemSecondaryAction style={{ fontStyle: 'italic' }}>
              {hoursFormatter.format(state?.totalHoursRemaining)}
            </ListItemSecondaryAction>
          </ListItem>
          <Divider />
        </List>
      </DialogBody>
    </Dialog>
  );
}
