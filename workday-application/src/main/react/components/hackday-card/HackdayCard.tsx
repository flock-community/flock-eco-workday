import { Button, Card, CardContent, CardHeader, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useCallback, useEffect, useState } from 'react';
import {
  AggregationClient,
  type PersonHackdayDetails,
} from '../../clients/AggregationClient';
import { EventClient, type FlockEvent } from '../../clients/EventClient';
import { HighlightSpan } from '../../theme/theme-light';
import { subscribeToEvent, unsubscribeFromEvent } from '../../utils/EventUtils';
import { hoursFormatter } from '../../utils/Hours';
import { HackdayDetailDialog } from './HackdayDetailDialog';

const PREFIX = 'HackdayCard';

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

export function HackdayCard() {
  const [hackdayDetailsOpen, setHackdayDetailsOpen] = useState<boolean>(false);
  const [personHackDayDetails, setPersonHackdayDetails] =
    useState<PersonHackdayDetails>(undefined);
  const [flockEvents, setFlockEvents] = useState<FlockEvent[]>([]);

  const fetchHackdayDetailsForCurrentYear = useCallback(() => {
    AggregationClient.hackdayDetailsMeYear(new Date().getFullYear()).then(
      (res) => setPersonHackdayDetails(res),
    );
  }, []);

  const fetchEvents = useCallback(() => {
    EventClient.getHackDays(new Date().getFullYear()).then((res) =>
      setFlockEvents(res),
    );
  }, []);

  useEffect(() => {
    fetchHackdayDetailsForCurrentYear();
    fetchEvents();
  }, [fetchEvents, fetchHackdayDetailsForCurrentYear]);

  const openLeaveDayDetailsDialog = () => {
    setHackdayDetailsOpen(true);
  };

  const handleCloseLeaveDayDetailDialog = () => {
    setHackdayDetailsOpen(false);
  };

  const eventToggled = (event: FlockEvent, isPresent: boolean) => {
    (isPresent ? subscribeToEvent(event) : unsubscribeFromEvent(event)).then(
      () => {
        fetchHackdayDetailsForCurrentYear();
        fetchEvents();
      },
    );
  };

  return (
    <Root>
      <Card
        variant="outlined"
        style={{ borderRadius: 0 }}
      >
        <CardHeader
          title="Hack days"
          action={
            <Button
              variant="outlined"
              size="small"
              onClick={openLeaveDayDetailsDialog}
              disabled={personHackDayDetails === undefined}
            >
              Update
            </Button>
          }
        />
        <CardContent className={classes.containerWrapper}>
          {personHackDayDetails === undefined ? (
            <AlignedLoader />
          ) : (
            <div className={classes.hoursLeftWrapper}>
              <Typography variant="body1">You have</Typography>
              <div className={classes.hoursLeft}>
                <HighlightSpan>
                  {hoursFormatter.format(
                    personHackDayDetails?.totalHoursRemaining,
                  )}
                </HighlightSpan>
              </div>
              <Typography variant="body1">hours left</Typography>
            </div>
          )}
        </CardContent>
      </Card>
      {hackdayDetailsOpen && (
        <HackdayDetailDialog
          open={hackdayDetailsOpen}
          item={personHackDayDetails}
          hackEvents={flockEvents}
          onComplete={handleCloseLeaveDayDetailDialog}
          onEventToggle={eventToggled}
        />
      )}
    </Root>
  );
}
