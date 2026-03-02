import React, {useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Box, Card, CardHeader, Grid, Typography,} from '@mui/material';
import {AccessTime, AttachMoney, Event, ExpandMore,} from '@mui/icons-material';
import {
  BudgetAllocation,
  HackTimeBudgetAllocation,
  StudyTimeBudgetAllocation,
} from './mocks/BudgetAllocationTypes';
import dayjs from "dayjs";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import {PeriodInput} from "../../components/inputs/PeriodInput";

interface EventAllocationListItemProps {
  eventCode: string;
  eventName: string;
  allocations: BudgetAllocation[];
  dateFrom: string;
  dateTo: string;
}

/**
 * Given allocation, returns an array of days with hours allocated
 * The array contains an entry for every day between dateFrom and dateTo,
 */
const findDays: (allocation: (StudyTimeBudgetAllocation | HackTimeBudgetAllocation)) => number[] = (allocation: StudyTimeBudgetAllocation | HackTimeBudgetAllocation) => {
  const from = dayjs(allocation.dateFrom);
  const to = dayjs(allocation.dateTo);
  const n = to.diff(from, 'day') + 1;
  const daysArray = new Array(n);

  allocation.dailyTimeAllocations.forEach(dailyAllocation => {
    const day = dayjs(dailyAllocation.date)
    const dayIndex = day.diff(from, 'day');
    daysArray[dayIndex] = dailyAllocation.hours;
  });
  return daysArray;
};
const getAccordion = (expanded: Record<string, boolean>, setExpanded: (value: (((prevState: Record<string, boolean>) => Record<string, boolean>) | Record<string, boolean>)) => void, allocation: StudyTimeBudgetAllocation | HackTimeBudgetAllocation) =>
  <Accordion
    expanded={expanded[allocation.id]}
    onChange={(_, isExpanded) => setExpanded(old => {
      old[allocation.id] = isExpanded;
      return old;
    })}
    sx={{br: 0, m: 0}}
  >

    <AccordionSummary
      expandIcon={<ExpandMore/>}
      sx={{
        bgcolor: 'action.hover',
        '&:hover': {bgcolor: 'action.selected'},
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
        <AccessTime fontSize="small" color="action"/>
        <Typography variant="subtitle1" fontWeight="medium">
          {allocation.type === 'StudyTime' ? "Study Time" : "Hack Time"}:{' '}{allocation.dailyTimeAllocations.reduce((acc, dailyTimeAllocation) => acc + dailyTimeAllocation.hours, 0)}h
        </Typography>
      </Box>
    </AccordionSummary>
    <AccordionDetails>
      <PeriodInput
        period={{
          from: dayjs(allocation.dateFrom),
          to: dayjs(allocation.dateTo),
          days: findDays(allocation)
        }}
        onChange={() => {}}
        readonly={true}
      />

    </AccordionDetails>
  </Accordion>;

export function EventAllocationListItem({
                                          eventCode,
                                          eventName,
                                          allocations,
                                          dateFrom,
                                          dateTo,
                                        }: EventAllocationListItemProps) {
  const [expanded, setExpanded] = useState({} satisfies Record<string, boolean>);

  return (
    <Grid key={`workday-list-item-${eventCode}`} size={{xs: 12}}>
      <Card>
        <CardHeader
          title={<>
            <Event sx={{mt: 0.5, mr: 2}}/>
            {eventName}</>}
          subheader={
            <Typography>
              Dates: {dayjs(dateFrom).format('DD-MM-YYYY')} - {dayjs(dateTo).format('DD-MM-YYYY')}
            </Typography>
          }
        />
        <List>
          {allocations
            .toSorted((a, b) => {
              // Time allocations first, then money
              const typeOrder = {HackTime: 0, StudyTime: 1, StudyMoney: 2};
              return (typeOrder[a.type] ?? 99) - (typeOrder[b.type] ?? 99);
            })
            .map(allocation => {
              return (
                <ListItem key={allocation.id}>
                  <Grid container spacing={1} size={{xs: 12}}>
                    {/* Allocation details */}
                    {(allocation.type === 'StudyTime' || allocation.type === 'HackTime') &&
                      getAccordion(expanded, setExpanded, allocation)
                    }
                    {allocation.type === 'StudyMoney' && (
                      <Grid>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                          <AttachMoney fontSize="small" color="action"/>
                          <Typography variant="subtitle1" fontWeight="medium">
                            Study Money:{' '}{allocation.amount.toLocaleString('nl-NL')}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </ListItem>)
            })}
        </List>
      </Card>
    </Grid>
  );
}
