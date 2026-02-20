import { InfoOutlined } from '@mui/icons-material';
import {
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useCallback, useEffect, useState } from 'react';
import {
  AggregationClient,
  type PersonHackdayDetails,
} from '../../clients/AggregationClient';
import { HighlightSpan } from '../../theme/theme-light';
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

type HackdayCardProps = {
  refreshKey?: number;
};

export function HackdayCard({ refreshKey }: HackdayCardProps) {
  const [hackdayDetailsOpen, setHackdayDetailsOpen] = useState<boolean>(false);
  const [personHackDayDetails, setPersonHackdayDetails] =
    useState<PersonHackdayDetails>(undefined);

  const fetchHackdayDetailsForCurrentYear = useCallback(() => {
    AggregationClient.hackdayDetailsMeYear(new Date().getFullYear()).then(
      (res) => setPersonHackdayDetails(res),
    );
  }, []);

  useEffect(() => {
    fetchHackdayDetailsForCurrentYear();
  }, [fetchHackdayDetailsForCurrentYear, refreshKey]);

  const openLeaveDayDetailsDialog = () => {
    setHackdayDetailsOpen(true);
  };

  const handleCloseLeaveDayDetailDialog = () => {
    setHackdayDetailsOpen(false);
  };

  return (
    <Root>
      <Card variant="outlined" style={{ borderRadius: 0 }}>
        <CardHeader
          title="Hack days"
          action={
            <IconButton
              onClick={openLeaveDayDetailsDialog}
              disabled={personHackDayDetails === undefined}
            >
              <InfoOutlined />
            </IconButton>
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
          onComplete={handleCloseLeaveDayDetailDialog}
        />
      )}
    </Root>
  );
}
