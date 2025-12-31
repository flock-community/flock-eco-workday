import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import type { PersonHolidayDetails } from '../../clients/AggregationClient';
import { HighlightSpan } from '../../theme/theme-light';
import { hoursFormatter } from '../../utils/Hours';
import { HolidayDetailDialog } from './HolidayDetailDialog';

const PREFIX = 'HolidayCard';

const classes = {
  containerWrapper: `${PREFIX}ContainerWrapper`,
  hoursLeftWrapper: `${PREFIX}HoursLeftWrapper`,
  hoursLeft: `${PREFIX}HoursLeft`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(() => ({
  [`& .${classes.containerWrapper}`]: {
    containerType: 'inline-size',
  },

  [`& .${classes.hoursLeftWrapper}`]: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    '@container (max-width: 500px)': {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },

  [`& .${classes.hoursLeft}`]: {
    fontSize: 'clamp(6rem, 25cqw, 11rem)',
    position: 'relative',
    textAlign: 'center',
    zIndex: 2,
    marginInline: '2.5rem',
    '@container (max-width: 500px)': {
      fontSize: 'clamp(6rem, 40cqw, 9rem)',
    },
  },
}));

type HolidayCardProps = {
  item?: PersonHolidayDetails;
};

export function HolidayCard({ item }: HolidayCardProps) {
  const [available, setAvailable] = useState<number>(0);
  const [holidayHoursDetails, setHolidayHoursDetails] =
    useState<PersonHolidayDetails>();
  const [leaveDayDetailsOpen, setLeaveDayDetailsOpen] =
    useState<boolean>(false);
  const [leaveDayDetailsItem, setLeaveDayDetailsItem] =
    useState<PersonHolidayDetails>();

  useEffect(() => {
    if (item) {
      setHolidayHoursDetails(item);
      setAvailable(item.totalHoursRemaining);
    }
  }, [item]);

  const openLeaveDayDetailsDialog = () => {
    setLeaveDayDetailsOpen(true);
    setLeaveDayDetailsItem(holidayHoursDetails);
  };

  const handleCloseLeaveDayDetailDialog = () => {
    setLeaveDayDetailsOpen(false);
    setLeaveDayDetailsItem(undefined);
  };

  return (
    <Root>
      <Card
        variant={'outlined'}
        style={{ borderRadius: 0, cursor: 'pointer' }}
        onClick={() => openLeaveDayDetailsDialog()}
      >
        <CardHeader title={'Leave days'} />
        <CardContent className={classes.containerWrapper}>
          <div className={classes.hoursLeftWrapper}>
            <Typography variant="body1">You have</Typography>
            <div className={classes.hoursLeft}>
              <HighlightSpan>{hoursFormatter.format(available)}</HighlightSpan>
            </div>
            <Typography variant="body1">hours left</Typography>
          </div>
        </CardContent>
      </Card>
      {leaveDayDetailsItem !== undefined && (
        <HolidayDetailDialog
          open={leaveDayDetailsOpen}
          item={leaveDayDetailsItem}
          onComplete={handleCloseLeaveDayDetailDialog}
        />
      )}
    </Root>
  );
}
