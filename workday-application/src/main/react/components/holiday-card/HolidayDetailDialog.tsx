import HolidayIcon from '@mui/icons-material/WbSunny';
import { Dialog, Divider } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import type { PersonHolidayDetails } from '../../clients/AggregationClient';
import { hoursFormatter } from '../../utils/Hours';

const initialData: PersonHolidayDetails = {
  name: '',
  holidayHoursFromContract: 0,
  plusHours: 0,
  holidayHoursDone: 0,
  holidayHoursApproved: 0,
  holidayHoursRequested: 0,
  totalHoursAvailable: 0,
  totalHoursUsed: 0,
  totalHoursRemaining: 0,
};

type HolidayDetailDialogProps = {
  open: boolean;
  item: PersonHolidayDetails;
  onComplete: () => void;
};

export function HolidayDetailDialog({
  open,
  item,
  onComplete,
}: HolidayDetailDialogProps) {
  const [state, setState] = useState<PersonHolidayDetails>(initialData);

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
        icon={<HolidayIcon />}
        headline={'Holiday hours details'}
      />
      <DialogBody>
        {state?.plusHours > 0 && (
          <List dense={true}>
            <ListItem>
              <ListItemText primary={'Contract'} />
              <ListItemSecondaryAction>
                {hoursFormatter.format(state?.holidayHoursFromContract)}
              </ListItemSecondaryAction>
            </ListItem>
            <ListItem>
              <ListItemText primary={'Plus'} />
              <ListItemSecondaryAction>
                {hoursFormatter.format(state?.plusHours)}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            <ListItem style={{ fontStyle: 'italic' }}>
              <ListItemText primary={'Total'} />
              <ListItemSecondaryAction style={{ fontStyle: 'italic' }}>
                {hoursFormatter.format(state?.totalHoursAvailable)}
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
          </List>
        )}

        <List dense={true}>
          {state?.plusHours === 0 && (
            <ListItem>
              <ListItemText primary={'Contract'} />
              <ListItemSecondaryAction>
                {hoursFormatter.format(state?.holidayHoursFromContract)}
              </ListItemSecondaryAction>
            </ListItem>
          )}
          <ListItem>
            <ListItemText primary={'Used'} />
            <ListItemSecondaryAction>
              {hoursFormatter.format(state?.totalHoursUsed)}
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

        {state?.holidayHoursRequested > 0 && (
          <List dense={true}>
            <ListItem style={{ fontStyle: 'italic' }}>
              {state.holidayHoursRequested === 1 && (
                <ListItemText
                  primary={`You have ${state.holidayHoursRequested} hour requested that are not yet approved.`}
                />
              )}
              {state.holidayHoursRequested > 1 && (
                <ListItemText
                  primary={`You have ${state.holidayHoursRequested} hours requested that is not yet approved.`}
                />
              )}
            </ListItem>
          </List>
        )}
      </DialogBody>
    </Dialog>
  );
}
