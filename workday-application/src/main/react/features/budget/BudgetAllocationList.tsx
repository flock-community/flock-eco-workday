import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import {Info, OpenInNew} from '@mui/icons-material';
import {EventAllocationListItem} from './EventAllocationListItem';
import {StudyMoneyAllocationListItem} from './StudyMoneyAllocationListItem';
import type {BudgetAllocation} from '../../wirespec/model';

interface BudgetAllocationListProps {
  allocations: BudgetAllocation[];
  hasWritePermission?: boolean;
  onDelete?: (allocation: BudgetAllocation) => void;
  onEdit?: (allocation: BudgetAllocation) => void;
  onCreate?: () => void;
}

export function BudgetAllocationList({
  allocations,
  hasWritePermission = false,
  onDelete,
  onEdit,
}: BudgetAllocationListProps) {
  // Group event-linked allocations by eventCode
  const eventAllocations: Record<string, {
    eventCode: string;
    allocations: BudgetAllocation[];
  }> = {};

  const freeFormStudyMoney: BudgetAllocation[] = [];

  allocations.forEach((allocation) => {
    if (allocation.eventCode) {
      const key = allocation.eventCode;
      if (!eventAllocations[key]) {
        eventAllocations[key] = {
          eventCode: key,
          allocations: [],
        };
      }
      eventAllocations[key].allocations.push(allocation);
    } else if (allocation.type === 'STUDY_MONEY') {
      freeFormStudyMoney.push(allocation);
    }
  });

  // Combine and sort all items by date (most recent first)
  const allItems: Array<
    | {type: 'event'; data: typeof eventAllocations[string]}
    | {type: 'freeform'; data: BudgetAllocation}
  > = [
    ...Object.values(eventAllocations).map((event) => ({
      type: 'event' as const,
      data: event,
    })),
    ...freeFormStudyMoney.map((allocation) => ({
      type: 'freeform' as const,
      data: allocation,
    })),
  ].sort((a, b) => {
    const dateA = a.type === 'event' ? a.data.allocations[0]?.date : a.data.date;
    const dateB = b.type === 'event' ? b.data.allocations[0]?.date : b.data.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <Paper sx={{mb: 3}}>
      <Box sx={{p: 3}}>
        <Stack spacing={2}>
          {/* Header */}
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography variant="h6">
              Budget Allocations ({allItems.length})
            </Typography>
          </Box>

          {/* Info alert about event allocations */}
          {allItems.some((item) => item.type === 'event') && (
            <Alert severity="info" icon={<Info />}>
              Event allocations are managed from the Events page. Click the event
              name or{' '}
              <OpenInNew
                sx={{fontSize: 14, verticalAlign: 'middle', mx: 0.5}}
              />{' '}
              icon to navigate to the event.
            </Alert>
          )}

          {/* Unified list of all allocations */}
          {allItems.length === 0 ? (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              sx={{py: 4}}
            >
              No budget allocations yet
            </Typography>
          ) : (
            allItems.map((item) =>
              item.type === 'event' ? (
                <EventAllocationListItem
                  key={item.data.eventCode}
                  eventCode={item.data.eventCode}
                  allocations={item.data.allocations}
                />
              ) : (
                <StudyMoneyAllocationListItem
                  key={item.data.id ?? item.data.date}
                  allocation={item.data}
                  hasWritePermission={hasWritePermission}
                  onEdit={hasWritePermission && onEdit ? () => onEdit(item.data) : undefined}
                  onDelete={hasWritePermission && onDelete ? () => onDelete(item.data) : undefined}
                />
              ),
            )
          )}
        </Stack>
      </Box>
    </Paper>
  );
}
