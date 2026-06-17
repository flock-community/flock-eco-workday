import {
  AccessTime,
  Euro,
  Event,
  ExpandMore,
  OpenInNew,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardHeader,
  Grid,
  Typography,
} from '@mui/material';
import Link from '@mui/material/Link';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import dayjs from 'dayjs';
import type React from 'react';
import { useState } from 'react';
import { PeriodInput } from '../../components/inputs/PeriodInput';
import type { BudgetAllocation } from '../../wirespec/model';

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

const getDateRange = (
  allocation: BudgetAllocation,
): { from: dayjs.Dayjs; to: dayjs.Dayjs } => {
  const dailyAllocations =
    allocation.hackTimeDetails?.dailyAllocations ??
    allocation.studyTimeDetails?.dailyAllocations ??
    [];
  if (dailyAllocations.length === 0) {
    return { from: dayjs(allocation.date), to: dayjs(allocation.date) };
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

const getAccordion = (
  expanded: Record<string, boolean>,
  setExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  allocation: BudgetAllocation,
) => {
  const id = allocation.id ?? allocation.date;
  const { from, to } = getDateRange(allocation);

  return (
    <Accordion
      expanded={expanded[id] ?? false}
      onChange={(_, isExpanded) =>
        setExpanded((old) => ({ ...old, [id]: isExpanded }))
      }
      sx={{ br: 0, m: 0 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTime fontSize="small" color="action" />
          <Typography variant="subtitle1" fontWeight="medium">
            {allocation.type === 'STUDY_TIME' ? 'Study Time' : 'Hack Time'}:{' '}
            {getTotalHours(allocation)}h
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <PeriodInput
          period={{
            from,
            to,
            days: findDays(allocation),
          }}
          onChange={() => {}}
          readonly={true}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export function EventAllocationListItem({
  eventCode,
  allocations,
  isAdmin = false,
}: EventAllocationListItemProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const eventName = allocations[0]?.description ?? eventCode;

  const allDates = allocations
    .map((a) => a.date)
    .filter(Boolean)
    .sort();
  const dateFrom = allDates[0];
  const dateTo = allDates[allDates.length - 1];
  const isSingleDay = dateFrom === dateTo;

  return (
    <Grid size={{ xs: 12 }}>
      <Card>
        <CardHeader
          title={
            <>
              <Event sx={{ mt: 0.5, mr: 2 }} />
              {isAdmin ? (
                <Link
                  href={`/event?code=${eventCode}`}
                  underline="hover"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {eventName}
                  <OpenInNew sx={{ fontSize: 16 }} />
                </Link>
              ) : (
                eventName
              )}
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
        />
        <List>
          {allocations
            .toSorted((a, b) => {
              const typeOrder: Record<string, number> = {
                HACK_TIME: 0,
                STUDY_TIME: 1,
                STUDY_MONEY: 2,
              };
              return (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
            })
            .map((allocation) => (
              <ListItem
                key={allocation.id ?? `${allocation.type}-${allocation.date}`}
              >
                <Grid container spacing={1} size={{ xs: 12 }}>
                  {(allocation.type === 'STUDY_TIME' ||
                    allocation.type === 'HACK_TIME') &&
                    getAccordion(expanded, setExpanded, allocation)}
                  {allocation.type === 'STUDY_MONEY' && (
                    <Grid>
                      <Grid size={{ xs: 12 }} sx={{ pl: 1 }}>
                        <Box
                          sx={{
                            m: 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          <Euro fontSize="small" color="action" />
                          <Typography variant="subtitle1" fontWeight="medium">
                            Study Money:{'  '}€{''}
                            {(
                              allocation.studyMoneyDetails?.amount ?? 0
                            ).toLocaleString('nl-NL')}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </Grid>
              </ListItem>
            ))}
        </List>
      </Card>
    </Grid>
  );
}
