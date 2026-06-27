import { InfoOutlined, WarningAmberRounded } from '@mui/icons-material';
import { Box, Card, IconButton } from '@mui/material';
import { AlignedLoader } from '@workday-core/components/AlignedLoader';
import { useEffect, useState } from 'react';
import type { PersonHolidayDetails } from '../../clients/AggregationClient';
import { hoursFormatter } from '../../utils/Hours';
import { HolidayDetailDialog } from './HolidayDetailDialog';

type HolidayCardProps = {
  item?: PersonHolidayDetails;
};

export function HolidayCard({ item }: HolidayCardProps) {
  const [leaveDayDetailsOpen, setLeaveDayDetailsOpen] = useState(false);

  const available = item?.totalHoursRemaining ?? 0;
  const days = (available / 8).toLocaleString('nl-NL', { maximumFractionDigits: 1 });
  const resetYear = new Date().getFullYear() + 1;

  return (
    <>
      <Card
        variant="outlined"
        sx={{ p: '20px 16px', borderRadius: '14px', position: 'relative' }}
      >
        {item === undefined ? (
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
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                Leave remaining
              </Box>
              <IconButton
                size="small"
                onClick={() => setLeaveDayDetailsOpen(true)}
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
              }}
            >
              {hoursFormatter.format(available)}
              <Box
                component="span"
                sx={{ fontSize: '1.1rem', fontWeight: 400, ml: 0.25 }}
              >
                h
              </Box>
            </Box>

            <Box sx={{ fontSize: '13px', color: 'text.secondary', mt: 1 }}>
              {days} days · resets Jan {resetYear}
            </Box>
          </>
        )}
      </Card>

      {item !== undefined && (
        <HolidayDetailDialog
          open={leaveDayDetailsOpen}
          item={item}
          onComplete={() => setLeaveDayDetailsOpen(false)}
        />
      )}
    </>
  );
}
