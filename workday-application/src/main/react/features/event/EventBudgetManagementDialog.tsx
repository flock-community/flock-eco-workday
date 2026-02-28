import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  Divider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import {ExpandMore, Info, AccountBalance} from '@mui/icons-material';
import dayjs from 'dayjs';
import type {FullFlockEvent} from '../../clients/EventClient';
import {
  EventMoneyAllocationSection,
  type PersonMoneyAllocation,
} from './EventMoneyAllocationSection';
import {
  EventTimeAllocationSection,
  type PersonTimeAllocation,
} from './EventTimeAllocationSection';
import {
  BudgetAllocationType,
  mockEvents,
} from '../budget/mocks/BudgetAllocationMocks';
import type { Period } from '../period/Period';
import Grid from "@mui/material/Grid";

interface EventBudgetManagementSectionProps {
  event: FullFlockEvent | null;
  timeExpanded?: boolean;
  setTimeExpanded?: (expanded: boolean) => void;
  moneyExpanded?: boolean;
  setMoneyExpanded?: (expanded: boolean) => void;
}

export function EventBudgetManagementSection({
                                               event,
                                               timeExpanded = false,
                                               setTimeExpanded,
                                               moneyExpanded = false,
                                               setMoneyExpanded,
                                             }: EventBudgetManagementSectionProps) {
  // Separate state for money and time allocations
  const [moneyParticipants, setMoneyParticipants] = useState<PersonMoneyAllocation[]>([]);
  const [timeParticipants, setTimeParticipants] = useState<PersonTimeAllocation[]>([]);
  const [flockAmount, setFlockAmount] = useState<number>(0);

  // Get default budget type from event (mock for now) or use STUDY as fallback
  const mockEventData = mockEvents.find((e) => e.code === event?.code);
  const defaultBudgetType =
    (event as any)?.defaultTimeAllocationType ||
    mockEventData?.defaultTimeAllocationType ||
    BudgetAllocationType.STUDY;
  const totalBudget = event?.costs || 0; // Event costs = total budget

  useEffect(() => {
    if (event) {
      // Initialize money participants (default to equal share)
      const participantCount = event.persons.length;
      const defaultMoneyShare = participantCount > 0
        ? Math.floor((totalBudget / participantCount) * 100) / 100
        : 0;

      const initialMoneyParticipants: PersonMoneyAllocation[] = event.persons.map(
        (person) => {
          // Check if existing allocation exists in mock data
          const existingMoneyAllocation = mockEventData?.budgetAllocations.find(
            (a) => a.type === 'StudyMoney' && (a as any).personId === person.uuid
          );

          return {
            personId: person.uuid,
            personName: `${person.firstname} ${person.lastname}`,
            amount: existingMoneyAllocation && 'amount' in existingMoneyAllocation
              ? existingMoneyAllocation.amount
              : defaultMoneyShare,
          };
        }
      );

      setMoneyParticipants(initialMoneyParticipants);

      // Initialize time participants (default to no custom periods = using defaults)
      const initialTimeParticipants: PersonTimeAllocation[] = event.persons.map(
        (person) => {
          // Check if existing time allocations exist in mock data
          const existingStudyAllocation = mockEventData?.budgetAllocations.find(
            (a) => a.type === 'StudyTime' && (a as any).personId === person.uuid
          );
          const existingHackAllocation = mockEventData?.budgetAllocations.find(
            (a) => a.type === 'HackTime' && (a as any).personId === person.uuid
          );

          // Convert dailyTimeAllocations to Period format
          const convertToPeriod = (allocation: any): Period | null => {
            if (!allocation || !('dailyTimeAllocations' in allocation)) return null;

            const eventDays = event.to.diff(event.from, 'days') + 1;
            const days = Array(eventDays).fill(0);

            // Map daily allocations to days array
            allocation.dailyTimeAllocations.forEach((daily: any) => {
              const dayIndex = dayjs(daily.date).diff(event.from, 'days');
              if (dayIndex >= 0 && dayIndex < days.length) {
                days[dayIndex] = daily.hours;
              }
            });

            return {
              from: event.from,
              to: event.to,
              days,
            };
          };

          return {
            personId: person.uuid,
            personName: `${person.firstname} ${person.lastname}`,
            studyPeriod: convertToPeriod(existingStudyAllocation),
            hackPeriod: convertToPeriod(existingHackAllocation),
          };
        }
      );

      setTimeParticipants(initialTimeParticipants);

      // Load existing Flock allocation
      const existingFlockAllocation = mockEventData?.budgetAllocations.find(
        (a) => a.type === 'FlockMoney'
      );
      if (existingFlockAllocation && 'amount' in existingFlockAllocation) {
        setFlockAmount(existingFlockAllocation.amount);
      } else {
        setFlockAmount(0);
      }
    }
  }, [event, mockEventData, defaultBudgetType, totalBudget]);

  // Helper: Generate time allocation summary
  const getTimeSummary = (): string => {
    const participantsWithExceptions = timeParticipants.filter(
      (p) => p.studyPeriod !== null || p.hackPeriod !== null
    );
    const participantsWithDefaults = timeParticipants.filter(
      (p) => p.studyPeriod === null && p.hackPeriod === null
    );

    const parts: string[] = [];

    // Default count
    if (participantsWithDefaults.length > 0) {
      parts.push(
        `${participantsWithDefaults.length} using defaults (${defaultHoursPerDay}h/day ${defaultBudgetType})`
      );
    }

    // Exceptions count
    if (participantsWithExceptions.length > 0) {
      parts.push(`${participantsWithExceptions.length} custom allocation${participantsWithExceptions.length !== 1 ? 's' : ''}`);
    }

    return parts.join(', ') || 'No allocations';
  };

  // Helper: Generate money allocation summary
  const getMoneySummary = (): string => {
    const parts: string[] = [];

    // Check if equal share
    const participantAmounts = moneyParticipants.map((p) => p.amount);
    const uniqueAmounts = [...new Set(participantAmounts)].filter((a) => a > 0);
    const isEqualShare =
      uniqueAmounts.length === 1 &&
      participantAmounts.every((a) => a === uniqueAmounts[0]);

    // Flock
    if (flockAmount > 0) {
      parts.push(`Flock: €${flockAmount.toLocaleString('nl-NL')}`);
    }

    // Participants
    if (isEqualShare && uniqueAmounts.length > 0) {
      parts.push(
        `€${uniqueAmounts[0].toLocaleString('nl-NL')}/person (${moneyParticipants.length})`
      );
    } else if (uniqueAmounts.length > 0) {
      const groups = uniqueAmounts
        .map((amount) => ({
          amount,
          count: participantAmounts.filter((a) => a === amount).length,
        }))
        .sort((a, b) => b.amount - a.amount);

      parts.push(
        groups
          .map(
            (g) =>
              `${g.count}×€${g.amount.toLocaleString('nl-NL')}`
          )
          .join(', ')
      );
    }

    return parts.join('; ') || 'No allocations';
  };

  const handleSave = () => {
    // Build allocation payload
    const allocations = [];

    // Add money allocations
    moneyParticipants.forEach((participant) => {
      if (participant.amount > 0) {
        allocations.push({
          type: 'StudyMoney',
          eventCode: event?.code,
          personId: participant.personId,
          personName: participant.personName,
          amount: participant.amount,
        });
      }
    });

    // Add time allocations
    timeParticipants.forEach((participant) => {
      const hasCustomAllocation = participant.studyPeriod !== null || participant.hackPeriod !== null;

      if (hasCustomAllocation) {
        // Convert Period to daily allocations for logging
        // Add study time allocation if exists
        if (participant.studyPeriod && participant.studyPeriod.days) {
          const dailyStudyAllocations = participant.studyPeriod.days
            .map((hours, index) => ({
              date: event.from.add(index, 'days').format('YYYY-MM-DD'),
              hours,
            }))
            .filter(daily => daily.hours > 0); // Only include days with hours

          if (dailyStudyAllocations.length > 0) {
            allocations.push({
              type: 'StudyTime',
              eventCode: event?.code,
              personId: participant.personId,
              personName: participant.personName,
              dailyTimeAllocations: dailyStudyAllocations,
              totalHours: dailyStudyAllocations.reduce((sum, d) => sum + d.hours, 0),
            });
          }
        }

        // Add hack time allocation if exists
        if (participant.hackPeriod && participant.hackPeriod.days) {
          const dailyHackAllocations = participant.hackPeriod.days
            .map((hours, index) => ({
              date: event.from.add(index, 'days').format('YYYY-MM-DD'),
              hours,
            }))
            .filter(daily => daily.hours > 0); // Only include days with hours

          if (dailyHackAllocations.length > 0) {
            allocations.push({
              type: 'HackTime',
              eventCode: event?.code,
              personId: participant.personId,
              personName: participant.personName,
              dailyTimeAllocations: dailyHackAllocations,
              totalHours: dailyHackAllocations.reduce((sum, d) => sum + d.hours, 0),
            });
          }
        }
      } else {
        // Using defaults
        allocations.push({
          type: 'DefaultTime',
          eventCode: event?.code,
          personId: participant.personId,
          personName: participant.personName,
          budgetType: defaultBudgetType,
          note: 'Using event defaults',
        });
      }
    });

    // Add Flock allocation if present
    if (flockAmount > 0) {
      allocations.push({
        type: 'FlockMoney',
        eventCode: event?.code,
        amount: flockAmount,
      });
    }

    console.log('Saving Event Budget Allocations:', {
      eventCode: event?.code,
      totalBudget,
      moneyAllocations: {
        participants: moneyParticipants,
        flock: flockAmount,
        total: moneyParticipants.reduce((sum, p) => sum + p.amount, 0) + flockAmount,
      },
      timeAllocations: {
        participants: timeParticipants,
        defaultHoursPerDay: event?.hours / (event.to.diff(event.from, 'days') + 1),
        defaultType: defaultBudgetType,
      },
    });
  };

  if (!event) return null;

  // Generate event dates
  const eventDays = event.to.diff(event.from, 'days') + 1;
  const eventDates: string[] = [];
  for (let i = 0; i < eventDays; i++) {
    eventDates.push(event.from.add(i, 'days').format('YYYY-MM-DD'));
  }

  // Calculate default hours per day from event total hours
  const defaultHoursPerDay = eventDays > 0 ? event.hours / eventDays : 8;

  return (
    <Grid container spacing={1}>
      <Grid size={{xs: 12}}>
        <Accordion
          expanded={timeExpanded}
          onChange={(_, isExpanded) => setTimeExpanded?.(isExpanded)}

        >
          <AccordionSummary
            expandIcon={<ExpandMore/>}
            sx={{
              bgcolor: 'action.hover',
              '&:hover': {bgcolor: 'action.selected'},
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%'}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <AccountBalance color="action"/>
                <Typography variant="subtitle1" fontWeight="medium">
                  Time Budget Allocations
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {getTimeSummary()}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{p: 3}}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
              {/* Time Allocation Section */}
              <EventTimeAllocationSection
                eventDates={eventDates}
                defaultHoursPerDay={defaultHoursPerDay}
                defaultBudgetType={defaultBudgetType}
                participants={timeParticipants}
                onParticipantsChange={setTimeParticipants}
              />

              {/* Save Button */}
              <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button onClick={handleSave} variant="contained" color="primary">
                  Save Time Allocations
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>
      <Grid size={{xs: 12}}>
        <Accordion
          expanded={moneyExpanded}
          onChange={(_, isExpanded) => setMoneyExpanded?.(isExpanded)}

        >
          <AccordionSummary
            expandIcon={<ExpandMore/>}
            sx={{
              bgcolor: 'action.hover',
              '&:hover': {bgcolor: 'action.selected'},
            }}
          >
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%'}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <AccountBalance color="action"/>
                <Typography variant="subtitle1" fontWeight="medium">
                  Money Budget Allocations
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">
                {getMoneySummary()}
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{p: 3}}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
              {/* Money Allocation Section */}
              <EventMoneyAllocationSection
                totalBudget={totalBudget}
                participants={moneyParticipants}
                flockAmount={flockAmount}
                onParticipantsChange={setMoneyParticipants}
                onFlockAmountChange={setFlockAmount}
              />


              {/* Save Button */}
              <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button onClick={handleSave} variant="contained" color="primary">
                  Save Money Allocations
                </Button>
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Grid>
    </Grid>);
}
