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
import { useChartColors } from '../../theme/chartColors';
import type { AggregationPersonObject } from './MissingHoursCard';

const PREFIX = 'MissingHoursDetailDialog';

const classes = {
  flexDataContainer: `${PREFIX}flexDataContainer`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(() => ({
  [`& .${classes.flexDataContainer}`]: {
    display: 'flex',
    height: '2rem',
    '& > *': {
      flexBasis: '0%',
    },
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
  const colors = useChartColors();
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
                  style={{
                    flexGrow: state?.workDays,
                    backgroundColor: colors.worked,
                  }}
                ></div>
                <div
                  style={{
                    flexGrow: state?.leaveDayUsed,
                    backgroundColor: colors.leave,
                  }}
                ></div>
                <div
                  style={{
                    flexGrow: state?.paidParentalLeaveUsed,
                    backgroundColor: colors.paidParentalLeave,
                  }}
                ></div>
                <div
                  style={{
                    flexGrow: state?.unpaidParentalLeaveUsed,
                    backgroundColor: colors.unpaidParentalLeave,
                  }}
                ></div>
                <div
                  style={{
                    flexGrow: state?.sickDays,
                    backgroundColor: colors.sick,
                  }}
                ></div>
                <div
                  style={{
                    flexGrow: state?.event,
                    backgroundColor: colors.event,
                  }}
                ></div>
                <div
                  style={{
                    flexGrow: state?.missing,
                    backgroundColor: colors.missing,
                  }}
                ></div>
              </div>

              <List dense={true}>
                <ListItem>
                  <ListItemIcon style={{ color: colors.worked }}>
                    <WorkdayIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Worked hours'} />
                  <ListItemSecondaryAction>
                    {state?.workDays}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: colors.leave }}>
                    <HolidayIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Holiday hours'} />
                  <ListItemSecondaryAction>
                    {state?.leaveDayUsed}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: colors.paidParentalLeave }}>
                    <ChildCare />
                  </ListItemIcon>
                  <ListItemText primary={'Paid Parental leave'} />
                  <ListItemSecondaryAction>
                    {state?.paidParentalLeaveUsed}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: colors.unpaidParentalLeave }}>
                    <ChildCare />
                  </ListItemIcon>
                  <ListItemText primary={'Unpaid Parental leave'} />
                  <ListItemSecondaryAction>
                    {state?.unpaidParentalLeaveUsed}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: colors.sick }}>
                    <HealingIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Sick hours'} />
                  <ListItemSecondaryAction>
                    {state?.sickDays}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: colors.event }}>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText primary={'Event hours'} />
                  <ListItemSecondaryAction>
                    {state?.event}
                  </ListItemSecondaryAction>
                </ListItem>
                <ListItem>
                  <ListItemIcon style={{ color: colors.missing }}>
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
