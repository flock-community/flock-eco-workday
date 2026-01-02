import { ChildCare, MoreHoriz, Timeline } from '@mui/icons-material';
import EventIcon from '@mui/icons-material/CalendarToday';
import HealingIcon from '@mui/icons-material/Healing';
import HolidayIcon from '@mui/icons-material/WbSunny';
import WorkdayIcon from '@mui/icons-material/Work';
import { Box, Dialog, Divider } from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { DialogHeader } from '@workday-core/components/dialog';
import { DialogBody } from '@workday-core/components/dialog/DialogHeader';
import { useEffect, useState } from 'react';
import type { AggregationPersonObject } from './MissingHoursCard';

const PREFIX = 'MissingHoursDetailDialog';

const classes = {
  flexDataContainer: `${PREFIX}flexDataContainer`,
  dataItemWorkDay: `${PREFIX}dataItemWorkDay`,
  dataItemHoliday: `${PREFIX}dataItemHoliday`,
  dataItemPaidPL: `${PREFIX}dataItemPaidPL`,
  dataItemUnpaidPL: `${PREFIX}dataItemUnpaidPL`,
  dataItemSickDay: `${PREFIX}dataItemSickDay`,
  dataItemEventDay: `${PREFIX}dataItemEventDay`,
  dataItemMissing: `${PREFIX}dataItemMissing`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
  [`& .${classes.flexDataContainer}`]: {
    display: 'flex',
    height: '2rem',
    '& > *': {
      flexBasis: '0%',
    },
  },

  [`& .${classes.dataItemWorkDay}`]: {
    backgroundColor: '#1de8b5',
  },

  [`& .${classes.dataItemHoliday}`]: {
    backgroundColor: '#42a5f5',
  },

  [`& .${classes.dataItemPaidPL}`]: {
    backgroundColor: '#ffb6c1',
  },

  [`& .${classes.dataItemUnpaidPL}`]: {
    backgroundColor: '#87cefa',
  },

  [`& .${classes.dataItemSickDay}`]: {
    backgroundColor: '#ef5350',
  },

  [`& .${classes.dataItemEventDay}`]: {
    backgroundColor: '#fed766',
  },

  [`& .${classes.dataItemMissing}`]: {
    backgroundColor: '#9e9e9e',
  },
}));

type MissingHoursDetailDialogProps = {
  open: boolean;
  item: AggregationPersonObject;
  onComplete: () => void;
};

export function MissingHoursDetailDialog({
  open,
  item,
  onComplete,
}: MissingHoursDetailDialogProps) {
  const [state, setState] = useState<any>(null);

  useEffect(() => {
    if (open) {
      setState(item);
    }
  }, [open, item]);

  const handleClose = () => {
    setState(null);
    onComplete();
  };

  return (
    <Root>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth={'sm'}
        fullWidth={true}
        PaperProps={{ square: true }}
      >
        <DialogHeader
          onClose={handleClose}
          icon={<Timeline />}
          headline={'Missing hours details'}
          subheadline={new Date(state?.monthYear).toLocaleString('en-EN', {
            month: 'long',
          })}
        />
        <DialogBody>
          {!item && (
            <Typography align={'center'}>No data to display.</Typography>
          )}
          {item && (
            <Box className={'flow'}>
              <div className={classes.flexDataContainer}>
                <div
                  className={classes.dataItemWorkDay}
                  style={{ flexGrow: state?.workDays }}
                ></div>
                <div
                  className={classes.dataItemHoliday}
                  style={{ flexGrow: state?.leaveDayUsed }}
                ></div>
                <div
                  className={classes.dataItemPaidPL}
                  style={{ flexGrow: state?.paidParentalLeaveUsed }}
                ></div>
                <div
                  className={classes.dataItemUnpaidPL}
                  style={{ flexGrow: state?.unpaidParentalLeaveUsed }}
                ></div>
                <div
                  className={classes.dataItemSickDay}
                  style={{ flexGrow: state?.sickDays }}
                ></div>
                <div
                  className={classes.dataItemEventDay}
                  style={{ flexGrow: state?.event }}
                ></div>
                <div
                  className={classes.dataItemMissing}
                  style={{ flexGrow: state?.missing }}
                ></div>
              </div>

              <List dense={true}>
                <ListItem>
                  <ListItemIcon style={{ color: '#1de8b5' }}>
                    <WorkdayIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Worked hours'} />
                  <ListItemSecondaryAction>
                    {state?.workDays}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: '#42a5f5' }}>
                    <HolidayIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Holiday hours'} />
                  <ListItemSecondaryAction>
                    {state?.leaveDayUsed}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: '#ffb6c1' }}>
                    <ChildCare />
                  </ListItemIcon>
                  <ListItemText primary={'Paid Parental leave'} />
                  <ListItemSecondaryAction>
                    {state?.paidParentalLeaveUsed}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: '#87cefa' }}>
                    <ChildCare />
                  </ListItemIcon>
                  <ListItemText primary={'Unpaid Parental leave'} />
                  <ListItemSecondaryAction>
                    {state?.unpaidParentalLeaveUsed}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: '#ef5350' }}>
                    <HealingIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Sick hours'} />
                  <ListItemSecondaryAction>
                    {state?.sickDays}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: '#fed766' }}>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Event hours'} />
                  <ListItemSecondaryAction>
                    {state?.event}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: '#9E9E9E' }}>
                    <MoreHoriz />
                  </ListItemIcon>
                  <ListItemText primary={'Missing hours'} />
                  <ListItemSecondaryAction>
                    {state?.missing}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemIcon />
                  <ListItemText primary={'Total hours'} />
                  <ListItemSecondaryAction>
                    {state?.total}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </List>
            </Box>
          )}
        </DialogBody>
      </Dialog>
    </Root>
  );
}
