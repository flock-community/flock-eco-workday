import React, { useState, useEffect } from 'react';
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
import { ExpandMore, Info, AccountBalance } from '@mui/icons-material';
import type { FullFlockEvent } from '../../clients/EventClient';
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

interface EventBudgetManagementSectionProps {
  event: FullFlockEvent | null;
  expanded?: boolean;
  onChange?: (expanded: boolean) => void;
}

export function EventBudgetManagementSection({
  event,
  expanded = false,
  onChange,
}: EventBudgetManagementSectionProps) {
  // Separate state for money and time allocations
  const [moneyParticipants, setMoneyParticipants] = useState<PersonMoneyAllocation[]>([]);
  const [timeParticipants, setTimeParticipants] = useState<PersonTimeAllocation[]>([]);
  const [flockAmount, setFlockAmount] = useState<number>(0);

  // Mock data - in real implementation, fetch from backend
  const mockEventData = mockEvents.find((e) => e.code === event?.code);
  const defaultBudgetType =
    mockEventData?.defaultTimeAllocationType || BudgetAllocationType.STUDY;
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

      // Initialize time participants (default to no overrides = using defaults)
      const initialTimeParticipants: PersonTimeAllocation[] = event.persons.map(
        (person) => {
          // Check if existing time allocation with custom days exists
          const existingTimeAllocation = mockEventData?.budgetAllocations.find(
            (a) =>
              (a.type === 'StudyTime' || a.type === 'HackTime') &&
              (a as any).personId === person.uuid
          );

          // Only store overrides (days that differ from default)
          const dailyOverrides = existingTimeAllocation && 'dailyTimeAllocations' in existingTimeAllocation
            ? (existingTimeAllocation as any).dailyTimeAllocations
            : [];

          return {
            personId: person.uuid,
            personName: `${person.firstname} ${person.lastname}`,
            dailyOverrides: dailyOverrides,
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

    // Add time allocations (only for participants with overrides or all if needed)
    timeParticipants.forEach((participant) => {
      if (participant.dailyOverrides.length > 0) {
        // Has custom time allocation
        allocations.push({
          type: 'CustomTime',
          eventCode: event?.code,
          personId: participant.personId,
          personName: participant.personName,
          dailyOverrides: participant.dailyOverrides,
        });
      } else {
        // Using defaults - could optionally log this
        allocations.push({
          type: 'DefaultTime',
          eventCode: event?.code,
          personId: participant.personId,
          personName: participant.personName,
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
    <Accordion
      expanded={expanded}
      onChange={(_, isExpanded) => onChange?.(isExpanded)}
      sx={{ boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: 'action.hover',
          '&:hover': { bgcolor: 'action.selected' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalance color="action" />
          <Typography variant="subtitle1" fontWeight="medium">
            Budget Allocations
          </Typography>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Info Alert */}
          <Alert severity="info" icon={<Info />}>
            <Typography variant="body2">
              Allocate event budget (money) and time separately. Money allocations
              must sum to the total event budget. Time allocations are individual
              and don't sum.
            </Typography>
          </Alert>

          {/* Money Allocation Section */}
          <EventMoneyAllocationSection
            totalBudget={totalBudget}
            participants={moneyParticipants}
            flockAmount={flockAmount}
            onParticipantsChange={setMoneyParticipants}
            onFlockAmountChange={setFlockAmount}
          />

          <Divider />

          {/* Time Allocation Section */}
          <EventTimeAllocationSection
            eventDates={eventDates}
            defaultHoursPerDay={defaultHoursPerDay}
            defaultBudgetType={defaultBudgetType}
            participants={timeParticipants}
            onParticipantsChange={setTimeParticipants}
          />

          <Divider />

          {/* Save Button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleSave} variant="contained" color="primary">
              Save Allocations
            </Button>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
