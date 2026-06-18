import { Info, OpenInNew } from '@mui/icons-material';
import { Alert, Box, Paper, Stack, Typography } from '@mui/material';
import React from 'react';
import type { BudgetAllocation } from '../../wirespec/model';
import { EventAllocationListItem } from './EventAllocationListItem';
import { TrainingMoneyAllocationListItem } from './TrainingMoneyAllocationListItem';

export type BudgetAllocationFilter = 'HACK' | 'TRAINING' | 'MONEY';

const matchesFilter = (
  allocation: BudgetAllocation,
  filter: BudgetAllocationFilter,
): boolean => {
  if (filter === 'MONEY') return allocation.kind === 'MONEY';
  return (
    allocation.kind === 'TIME' &&
    (allocation.timeDetails?.dailyAllocations ?? []).some(
      (d) => d.type === filter,
    )
  );
};

interface BudgetAllocationListProps {
  allocations: BudgetAllocation[];
  hasWritePermission?: boolean;
  onDelete?: (allocation: BudgetAllocation) => void;
  onEdit?: (allocation: BudgetAllocation) => void;
  onCreate?: () => void;
  isAdmin: boolean;
  typeFilter?: BudgetAllocationFilter | null;
  eventCodeFilter?: string | null;
}

export function BudgetAllocationList({
  allocations,
  hasWritePermission = false,
  onDelete,
  onEdit,
  isAdmin,
  typeFilter = null,
  eventCodeFilter = null,
}: BudgetAllocationListProps) {
  let filteredAllocations = typeFilter
    ? allocations.filter((a) => matchesFilter(a, typeFilter))
    : allocations;

  if (eventCodeFilter) {
    filteredAllocations = filteredAllocations.filter(
      (a) => a.eventCode === eventCodeFilter,
    );
  }

  const eventAllocations: Record<
    string,
    {
      eventCode: string;
      allocations: BudgetAllocation[];
    }
  > = {};

  const freeFormAllocations: BudgetAllocation[] = [];

  filteredAllocations.forEach((allocation) => {
    if (allocation.eventCode) {
      const key = allocation.eventCode;
      if (!eventAllocations[key]) {
        eventAllocations[key] = {
          eventCode: key,
          allocations: [],
        };
      }
      eventAllocations[key].allocations.push(allocation);
    } else {
      freeFormAllocations.push(allocation);
    }
  });

  const allItems: Array<
    | { type: 'event'; data: (typeof eventAllocations)[string] }
    | { type: 'freeform'; data: BudgetAllocation }
  > = [
    ...Object.values(eventAllocations).map((event) => ({
      type: 'event' as const,
      data: event,
    })),
    ...freeFormAllocations.map((allocation) => ({
      type: 'freeform' as const,
      data: allocation,
    })),
  ].sort((a, b) => {
    const dateA =
      a.type === 'event' ? a.data.allocations[0]?.date : a.data.date;
    const dateB =
      b.type === 'event' ? b.data.allocations[0]?.date : b.data.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6">
          Budget Allocations ({allItems.length})
        </Typography>
      </Box>

      {isAdmin && allItems.some((item) => item.type === 'event') && (
        <Alert severity="info" icon={<Info />}>
          Event allocations are managed from the Events page. Click the event
          name or{' '}
          <OpenInNew sx={{ fontSize: 14, verticalAlign: 'middle', mx: 0.5 }} />{' '}
          icon to navigate to the event.
        </Alert>
      )}

      {allItems.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          sx={{ py: 4 }}
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
              isAdmin={isAdmin}
            />
          ) : (
            <TrainingMoneyAllocationListItem
              key={item.data.id ?? item.data.date}
              allocation={item.data}
              hasWritePermission={hasWritePermission}
              onEdit={
                hasWritePermission && onEdit
                  ? () => onEdit(item.data)
                  : undefined
              }
              onDelete={
                hasWritePermission && onDelete
                  ? () => onDelete(item.data)
                  : undefined
              }
            />
          ),
        )
      )}
    </Stack>
  );
}
