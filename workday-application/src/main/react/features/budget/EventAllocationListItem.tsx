import React, {useState} from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  Paper,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import {
  Event,
  ExpandMore,
} from '@mui/icons-material';
import type {BudgetAllocation} from '../../wirespec/model';
import dayjs from 'dayjs';
import {PeriodInput} from '../../components/inputs/PeriodInput';

interface EventAllocationListItemProps {
  eventCode: string;
  allocations: BudgetAllocation[];
  isAdmin?: boolean;
}

/**
 * Given a time allocation (HACK_TIME or STUDY_TIME), returns an array of daily hours.
 */
const findDays = (allocation: BudgetAllocation): number[] => {
  const dailyAllocations =
    allocation.hackTimeDetails?.dailyAllocations ??
    allocation.studyTimeDetails?.dailyAllocations ??
    [];

  if (dailyAllocations.length === 0) return [];

  const dates = dailyAllocations.map((d) => dayjs(d.date));
  const from = dates.reduce((min, d) => (d.isBefore(min) ? d : min), dates[0]);
  const to = dates.reduce((max, d) => (d.isAfter(max) ? d : max), dates[0]);
  const n = to.diff(from, 'day') + 1;
  const daysArray = new Array(n).fill(0);

  dailyAllocations.forEach((dailyAllocation) => {
    const day = dayjs(dailyAllocation.date);
    const dayIndex = day.diff(from, 'day');
    daysArray[dayIndex] = dailyAllocation.hours;
  });
  return daysArray;
};

const getDateRange = (allocation: BudgetAllocation): {from: dayjs.Dayjs; to: dayjs.Dayjs} => {
  const dailyAllocations =
    allocation.hackTimeDetails?.dailyAllocations ??
    allocation.studyTimeDetails?.dailyAllocations ??
    [];
  if (dailyAllocations.length === 0) {
    return {from: dayjs(allocation.date), to: dayjs(allocation.date)};
  }
  const dates = dailyAllocations.map((d) => dayjs(d.date));
  return {
    from: dates.reduce((min, d) => (d.isBefore(min) ? d : min), dates[0]),
    to: dates.reduce((max, d) => (d.isAfter(max) ? d : max), dates[0]),
  };
};

const getTotalHours = (allocation: BudgetAllocation): number =>
  allocation.hackTimeDetails?.totalHours ??
  allocation.studyTimeDetails?.totalHours ??
  0;

export function EventAllocationListItem({
  eventCode,
  allocations,
  isAdmin = false,
}: EventAllocationListItemProps) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  // Derive event name from first allocation description
  const eventName = allocations[0]?.description ?? eventCode;

  // Derive date range from allocations
  const allDates = allocations
    .map((a) => a.date)
    .filter(Boolean)
    .sort();
  const dateFrom = allDates[0];
  const dateTo = allDates[allDates.length - 1];
  const isSingleDay = dateFrom === dateTo;

  const sortedAllocations = allocations.toSorted((a, b) => {
    const typeOrder: Record<string, number> = {HACK_TIME: 0, STUDY_TIME: 1, STUDY_MONEY: 2};
    return (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
  });

  const timeAllocations = sortedAllocations.filter(
    (a) => a.type === 'HACK_TIME' || a.type === 'STUDY_TIME',
  );
  const hasTimeAllocations = timeAllocations.length > 0;
  const showTypeLabels = timeAllocations.length > 1;

  // Build summary line
  const summaryParts: string[] = [];
  const hackAllocation = sortedAllocations.find((a) => a.type === 'HACK_TIME');
  const studyTimeAllocation = sortedAllocations.find((a) => a.type === 'STUDY_TIME');
  const studyMoneyAllocation = sortedAllocations.find((a) => a.type === 'STUDY_MONEY');

  if (hackAllocation) {
    summaryParts.push(`Hack: ${getTotalHours(hackAllocation)}h`);
  }
  if (studyTimeAllocation) {
    summaryParts.push(`Study: ${getTotalHours(studyTimeAllocation)}h`);
  }
  if (studyMoneyAllocation) {
    const amount = studyMoneyAllocation.studyMoneyDetails?.amount ?? 0;
    summaryParts.push(`€${amount.toLocaleString('nl-NL')}`);
  }

  return (
    <Grid size={{xs: 12}}>
      <Paper variant="outlined" sx={{borderLeft: '4px solid', borderColor: 'primary.main'}}>
        <CardHeader
          title={
            <>
              <Event sx={{mt: 0.5, mr: 2}} />
              {eventName}
            </>
          }
          subheader={
            dateFrom && (
              <Typography>
                {isSingleDay
                  ? `Date: ${dayjs(dateFrom).format('DD-MM-YYYY')}`
                  : `Dates: ${dayjs(dateFrom).format('DD-MM-YYYY')} - ${dayjs(dateTo).format('DD-MM-YYYY')}`}
              </Typography>
            )
          }
          action={
            isAdmin ? (
              <Button
                variant="outlined"
                size="small"
                href={`/event?code=${eventCode}`}
                sx={{mt: 1, mr: 1}}
              >
                Manage in Events →
              </Button>
            ) : undefined
          }
        />

        <Divider />

        <Box sx={{px: 1.5, py: 1}}>
          <Typography variant="body2" color="text.secondary">
            {summaryParts.join(' · ')}
          </Typography>
        </Box>

        {hasTimeAllocations && (
          <Accordion
            expanded={detailsExpanded}
            onChange={(_, isExpanded) => setDetailsExpanded(isExpanded)}
            sx={{br: 0, m: 0}}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{bgcolor: 'action.hover'}}
            >
              <Typography variant="body2">Daily breakdown</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {timeAllocations.map((allocation) => {
                const {from, to} = getDateRange(allocation);
                return (
                  <Box key={allocation.id ?? `${allocation.type}-${allocation.date}`}>
                    {showTypeLabels && (
                      <Typography variant="caption" color="text.secondary">
                        {allocation.type === 'HACK_TIME' ? 'Hack Time' : 'Study Time'}
                      </Typography>
                    )}
                    <Box
                      sx={{
                        maxWidth: (theme) => theme.breakpoints.values.md,
                        mx: 'auto',
                        '& .MuiTypography-root': {fontSize: '0.75rem'},
                        '& .MuiInputBase-input': {fontSize: '0.75rem', py: '4px', px: '6px'},
                        '& .MuiInputLabel-root': {fontSize: '0.75rem'},
                        '& .MuiFormControl-root': {minWidth: 0},
                      }}
                    >
                      <PeriodInput
                        period={{
                          from,
                          to,
                          days: findDays(allocation),
                        }}
                        onChange={() => {}}
                        readonly={true}
                      />
                    </Box>
                  </Box>
                );
              })}
            </AccordionDetails>
          </Accordion>
        )}
      </Paper>
    </Grid>
  );
}
