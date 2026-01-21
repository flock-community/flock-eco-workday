import React, {useState} from 'react';
import {Accordion, AccordionDetails, AccordionSummary, Box, Card, CardHeader, Grid, Typography,} from '@mui/material';
import {AccessTime, AttachMoney, Cancel, CheckCircle, Event, ExpandMore, HourglassEmpty,} from '@mui/icons-material';
import {
  ApprovalStatus,
  BudgetAllocation,
  HackTimeBudgetAllocation,
  StudyTimeBudgetAllocation,
} from './mocks/BudgetAllocationMocks';
import dayjs from "dayjs";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import {mutatePeriod} from "../period/Period";
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
    // sx={{boxShadow: 'none', border: '1px solid', borderColor: 'divider'}}
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
        }}pm sta
        onChange={(period, hours) => {
        }}
        readonly={true}
        // from={dayjs(allocation.dateFrom)}
        // to={dayjs(allocation.dateTo)}
        // reset={reset}
        // value={mutatePeriod({from: dayjs(allocation.dateFrom), to: dayjs(allocation.dateTo), days: undefined}).days}
        // setFieldValue={(field, value) => {}}
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
  // Group allocations by person
  const personAllocations = allocations.reduce((acc, allocation) => {
    const personId = allocation.personId || 'flock';
    if (!acc[personId]) {
      acc[personId] = {
        personName: allocation.personName || 'Flock Company',
        allocations: [],
      };
    }
    acc[personId].allocations.push(allocation);
    return acc;
  }, {} as Record<string, { personName: string; allocations: BudgetAllocation[] }>);

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return <CheckCircle fontSize="small" color="success"/>;
      case ApprovalStatus.REQUESTED:
        return <HourglassEmpty fontSize="small" color="warning"/>;
      case ApprovalStatus.REJECTED:
        return <Cancel fontSize="small" color="error"/>;
    }
  };

  const getStatusColor = (
    status: ApprovalStatus
  ): 'success' | 'warning' | 'error' => {
    switch (status) {
      case ApprovalStatus.APPROVED:
        return 'success';
      case ApprovalStatus.REQUESTED:
        return 'warning';
      case ApprovalStatus.REJECTED:
        return 'error';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleNavigateToEvent = () => {
    // In real implementation, this would navigate to the event page
    console.log('Navigate to event:', eventCode);
    // Example: navigate(`/events/${eventCode}`);
  };

  return (
    <>
      <Grid key={`workday-list-item-${eventCode}`} size={{xs: 12}}>
        <Card onClick={() => {
        }}>
          <CardHeader
            // action={
            //   <StatusMenu
            //     onChange={() => {}}
            //     disabled={true}
            //     value={allocation.status}
            //   />
            // }
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
              .filter(a => a.type !== 'FlockMoney')
              .toSorted((a, b) => a.type === 'StudyMoney' ? -1 : 0)
              .map(allocation => {
                return (
                  <ListItem key={allocation.id}>
                    <Grid container spacing={1} size={{xs: 12}}>
                      {/* Allocation details */}
                      {(allocation.type === 'StudyTime' || allocation.type === 'HackTime') &&
                        getAccordion(expanded, setExpanded, allocation)
                      }
                      {allocation.type === 'StudyMoney' && (
                        <>
                          <Grid>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                              <AttachMoney fontSize="small" color="action"/>
                              <Typography variant="subtitle1" fontWeight="medium">
                                Study Money:{' '}{allocation.amount.toLocaleString('nl-NL')}
                              </Typography>
                            </Box>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </ListItem>)
              })}
          </List>
        </Card>
      </Grid>

      {/*<Card sx={{mb: 2}}>*/}
      {/*  <CardContent>*/}
      {/*    /!* Event header with icon and link *!/*/}
      {/*    <Box sx={{mb: 2}}>*/}
      {/*      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>*/}
      {/*        <Event color="primary"/>*/}
      {/*        <Link*/}
      {/*          component="button"*/}
      {/*          variant="h6"*/}
      {/*          onClick={handleNavigateToEvent}*/}
      {/*          sx={{*/}
      {/*            textAlign: 'left',*/}
      {/*            color: 'text.primary',*/}
      {/*            textDecoration: 'none',*/}
      {/*            '&:hover': {*/}
      {/*              textDecoration: 'underline',*/}
      {/*              color: 'primary.main',*/}
      {/*            },*/}
      {/*          }}*/}
      {/*        >*/}
      {/*          {eventName}*/}
      {/*        </Link>*/}
      {/*        <Tooltip title="Manage event allocations from Events page">*/}
      {/*          <IconButton*/}
      {/*            size="small"*/}
      {/*            onClick={handleNavigateToEvent}*/}
      {/*            sx={{ml: 'auto'}}*/}
      {/*          >*/}
      {/*            <OpenInNew fontSize="small"/>*/}
      {/*          </IconButton>*/}
      {/*        </Tooltip>*/}
      {/*      </Box>*/}
      {/*      /!*<Typography variant="caption" color="text.secondary">*!/*/}
      {/*      /!*  Event Code: {eventCode}*!/*/}
      {/*      /!*</Typography>*!/*/}
      {/*    </Box>*/}

      {/*    <Divider sx={{mb: 2}}/>*/}

      {/*    /!* Person allocations *!/*/}
      {/*    {Object.entries(personAllocations).map(*/}
      {/*      ([personId, {personName, allocations: personAllocs}]) => (*/}
      {/*        <Box key={personId} sx={{mb: 2}}>*/}
      {/*          <Typography variant="subtitle2" sx={{mb: 1}}>*/}
      {/*            {personName}*/}
      {/*          </Typography>*/}

      {/*          <Stack spacing={1}>*/}
      {/*            {personAllocs.map((allocation) => (*/}
      {/*              <Box*/}
      {/*                key={allocation.id}*/}
      {/*                sx={{*/}
      {/*                  display: 'flex',*/}
      {/*                  alignItems: 'center',*/}
      {/*                  gap: 1,*/}
      {/*                  p: 1,*/}
      {/*                  bgcolor: 'background.default',*/}
      {/*                  borderRadius: 1,*/}
      {/*                }}*/}
      {/*              >*/}
      {/*                /!* Icon based on type *!/*/}
      {/*                {allocation.type === 'StudyTime' ||*/}
      {/*                allocation.type === 'HackTime' ? (*/}
      {/*                  <AccessTime fontSize="small" color="action"/>*/}
      {/*                ) : allocation.type === 'FlockMoney' ? (*/}
      {/*                  <Business fontSize="small" color="action"/>*/}
      {/*                ) : (*/}
      {/*                  <AttachMoney fontSize="small" color="action"/>*/}
      {/*                )}*/}

      {/*                /!* Allocation details *!/*/}
      {/*                <Box sx={{flex: 1}}>*/}
      {/*                  <Typography variant="body2">*/}
      {/*                    {allocation.type === 'StudyTime' && (*/}
      {/*                      <>*/}
      {/*                        <strong>Study Time:</strong>{' '}*/}
      {/*                        <pre>{JSON.stringify(allocation.dailyTimeAllocations, null, 0)}</pre>*/}
      {/*                      </>*/}
      {/*                    )}*/}
      {/*                    {allocation.type === 'HackTime' && (*/}
      {/*                      <>*/}
      {/*                        <strong>Hack Time:</strong> {allocation.totalHours}h*/}
      {/*                      </>*/}
      {/*                    )}*/}
      {/*                    {allocation.type === 'StudyMoney' && (*/}
      {/*                      <>*/}
      {/*                        <strong>Study Money:</strong> €*/}
      {/*                        {allocation.amount.toLocaleString('nl-NL')}*/}
      {/*                      </>*/}
      {/*                    )}*/}
      {/*                    {allocation.type === 'FlockMoney' && (*/}
      {/*                      <>*/}
      {/*                        <strong>Flock Money:</strong> €*/}
      {/*                        {allocation.amount.toLocaleString('nl-NL')}*/}
      {/*                      </>*/}
      {/*                    )}*/}
      {/*                  </Typography>*/}
      {/*                  /!*{allocation.description && (*!/*/}
      {/*                  /!*  <Typography*!/*/}
      {/*                  /!*    variant="caption"*!/*/}
      {/*                  /!*    color="text.secondary"*!/*/}
      {/*                  /!*    display="block"*!/*/}
      {/*                  /!*  >*!/*/}
      {/*                  /!*    {allocation.description}*!/*/}
      {/*                  /!*  </Typography>*!/*/}
      {/*                  /!*)}*!/*/}
      {/*                  /!*<Typography variant="caption" color="text.secondary">*!/*/}
      {/*                  /!*  {formatDate(allocation.date)}*!/*/}
      {/*                  /!*</Typography>*!/*/}
      {/*                </Box>*/}

      {/*                /!* Status *!/*/}
      {/*                <Chip*/}
      {/*                  icon={getStatusIcon(allocation.status)}*/}
      {/*                  label={allocation.status}*/}
      {/*                  size="small"*/}
      {/*                  color={getStatusColor(allocation.status)}*/}
      {/*                  variant="outlined"*/}
      {/*                />*/}
      {/*              </Box>*/}
      {/*            ))}*/}
      {/*          </Stack>*/}

      {/*        </Box>*/}
      {/*      )*/}
      {/*    )}*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
    </>
  );
}
