import { InfoOutlined, WarningAmberRounded } from '@mui/icons-material';
import { Box, Card, IconButton } from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useCallback, useEffect, useState } from 'react';
import {
  AggregationClient,
  type PersonHackdayDetails,
} from '../../clients/AggregationClient';
import { hoursFormatter } from '../../utils/Hours';
import { HackdayDetailDialog } from './HackdayDetailDialog';

type HackdayCardProps = {
  refreshKey?: number;
};

export function HackdayCard({ refreshKey }: HackdayCardProps) {
  const [hackdayDetailsOpen, setHackdayDetailsOpen] = useState(false);
  const [details, setDetails] = useState<PersonHackdayDetails | undefined>(undefined);

  const fetch = useCallback(() => {
    AggregationClient.hackdayDetailsMeYear(new Date().getFullYear()).then(
      (res) => setDetails(res),
    );
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch, refreshKey]);

  const remaining = details?.totalHoursRemaining ?? 0;
  const isOver = remaining < 0;
  const daysOver = (Math.abs(remaining) / 8).toLocaleString('nl-NL', {
    maximumFractionDigits: 1,
  });

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          p: '20px 22px',
          borderRadius: '14px',
          ...(isOver && {
            borderColor: 'warning.light',
            bgcolor: (t) =>
              t.palette.mode === 'dark'
                ? 'rgba(237,174,0,.07)'
                : 'rgba(252,239,202,.35)',
          }),
        }}
      >
        {details === undefined ? (
          <AlignedLoader />
        ) : (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1.5,
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '.1em',
                  fontWeight: 600,
                  color: isOver ? 'warning.dark' : 'text.secondary',
                }}
              >
                Hack days
              </Box>
              <IconButton
                size="small"
                onClick={() => setHackdayDetailsOpen(true)}
                sx={{ mr: -0.5, mt: -0.5, color: 'text.disabled' }}
              >
                <InfoOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>

            <Box
              sx={{
                fontSize: '2.8rem',
                fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-.03em',
                color: isOver ? 'warning.dark' : 'inherit',
              }}
            >
              {isOver ? '−' : ''}{hoursFormatter.format(Math.abs(remaining))}
              <Box
                component="span"
                sx={{ fontSize: '1.1rem', fontWeight: 400, ml: 0.25 }}
              >
                h
              </Box>
            </Box>

            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                fontSize: '13px',
                mt: 1,
                color: isOver ? 'warning.dark' : 'text.secondary',
              }}
            >
              {isOver && <WarningAmberRounded sx={{ fontSize: 15 }} />}
              {isOver
                ? `${daysOver} days over budget`
                : `${(remaining / 8).toLocaleString('nl-NL', { maximumFractionDigits: 1 })} days remaining`}
            </Box>
          </>
        )}
      </Card>

      {hackdayDetailsOpen && (
        <HackdayDetailDialog
          open={hackdayDetailsOpen}
          item={details}
          onComplete={() => setHackdayDetailsOpen(false)}
        />
      )}
    </>
  );
}
