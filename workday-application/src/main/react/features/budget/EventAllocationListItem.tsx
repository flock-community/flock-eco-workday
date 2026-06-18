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
import { useState } from 'react';
import { PeriodInput } from '../../components/inputs/PeriodInput';
import type {
  BudgetAllocation,
  DailyTimeAllocationItem,
} from '../../wirespec/model';

interface EventAllocationListItemProps {
  eventCode: string;
  allocations: BudgetAllocation[];
  isAdmin?: boolean;
}

const daysFor = (daily: DailyTimeAllocationItem[]): number[] => {
  if (daily.length === 0) return [];
  const dates = daily.map((d) => dayjs(d.date));
  const from = dates.reduce((min, d) => (d.isBefore(min) ? d : min), dates[0]);
  const to = dates.reduce((max, d) => (d.isAfter(max) ? d : max), dates[0]);
  const result = new Array(to.diff(from, 'day') + 1).fill(0);
  daily.forEach((d) => {
    result[dayjs(d.date).diff(from, 'day')] = d.hours;
  });
  return result;
};

const rangeFor = (daily: DailyTimeAllocationItem[], fallback: string) => {
  if (daily.length === 0) return { from: dayjs(fallback), to: dayjs(fallback) };
  const dates = daily.map((d) => dayjs(d.date));
  return {
    from: dates.reduce((min, d) => (d.isBefore(min) ? d : min), dates[0]),
    to: dates.reduce((max, d) => (d.isAfter(max) ? d : max), dates[0]),
  };
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

  const timeAccordion = (
    allocation: BudgetAllocation,
    label: string,
    daily: DailyTimeAllocationItem[],
  ) => {
    const id = `${allocation.id ?? allocation.date}-${label}`;
    const { from, to } = rangeFor(daily, allocation.date);
    const total = daily.reduce((sum, d) => sum + d.hours, 0);

    return (
      <Accordion
        key={id}
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
              {label}: {total}h
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <PeriodInput
            period={{ from, to, days: daysFor(daily) }}
            onChange={() => {}}
            readonly={true}
          />
        </AccordionDetails>
      </Accordion>
    );
  };

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
            .toSorted(
              (a, b) =>
                (a.kind === 'MONEY' ? 1 : 0) - (b.kind === 'MONEY' ? 1 : 0),
            )
            .map((allocation) => {
              const daily = allocation.timeDetails?.dailyAllocations ?? [];
              const hackDaily = daily.filter((d) => d.type === 'HACK');
              const trainingDaily = daily.filter((d) => d.type === 'TRAINING');

              return (
                <ListItem
                  key={allocation.id ?? `${allocation.kind}-${allocation.date}`}
                >
                  <Grid container spacing={1} size={{ xs: 12 }}>
                    {allocation.kind === 'TIME' &&
                      hackDaily.length > 0 &&
                      timeAccordion(allocation, 'Hack Time', hackDaily)}
                    {allocation.kind === 'TIME' &&
                      trainingDaily.length > 0 &&
                      timeAccordion(allocation, 'Training Time', trainingDaily)}
                    {allocation.kind === 'MONEY' && (
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
                              Training Money:{'  '}€{''}
                              {(
                                allocation.moneyDetails?.amount ?? 0
                              ).toLocaleString('nl-NL')}
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    )}
                  </Grid>
                </ListItem>
              );
            })}
        </List>
      </Card>
    </Grid>
  );
}
