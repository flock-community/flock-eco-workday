import React, { useState } from 'react';
import {
  Box,
  Paper,
  Button,
  Typography,
  Stack,
  Alert,
} from '@mui/material';
import { Add, Info, OpenInNew } from '@mui/icons-material';
import { EventAllocationListItem } from './EventAllocationListItem';
import { StudyMoneyAllocationListItem } from './StudyMoneyAllocationListItem';
import { StudyMoneyAllocationDialog } from './StudyMoneyAllocationDialog';
import {
  BudgetAllocation,
  StudyMoneyBudgetAllocation,
} from './mocks/BudgetAllocationMocks';

interface BudgetAllocationListProps {
  allocations: BudgetAllocation[];
  availableStudyMoney: number;
  personName: string;
  hasWritePermission?: boolean;
  onCreateStudyMoney: (allocation: Partial<StudyMoneyBudgetAllocation>) => void;
  onEditStudyMoney: (allocation: StudyMoneyBudgetAllocation) => void;
  onDeleteStudyMoney: (allocation: StudyMoneyBudgetAllocation) => void;
}

export function BudgetAllocationList({
  allocations,
  availableStudyMoney,
  personName,
  hasWritePermission = false,
  onCreateStudyMoney,
  onEditStudyMoney,
  onDeleteStudyMoney,
}: BudgetAllocationListProps) {
  const [studyMoneyDialogOpen, setStudyMoneyDialogOpen] = useState(false);
  const [editingAllocation, setEditingAllocation] =
    useState<StudyMoneyBudgetAllocation | null>(null);

  // Group allocations by event and date for unified display
  const eventAllocations = allocations.reduce((acc, allocation) => {
    if (allocation.eventCode) {
      const key = allocation.eventCode;
      if (!acc[key]) {
        acc[key] = {
          eventCode: allocation.eventCode,
          eventName: allocation.eventName || allocation.eventCode,
          date: allocation.date,
          allocations: [],
        };
      }
      acc[key].allocations.push(allocation);
    }
    return acc;
  }, {} as Record<string, { eventCode: string; eventName: string; date: string; allocations: BudgetAllocation[] }>);

  // Free-form study money allocations (no event)
  const freeFormStudyMoney = allocations.filter(
    (a) => a.type === 'StudyMoney' && !a.eventCode
  ) as StudyMoneyBudgetAllocation[];

  // Combine and sort all items by date (most recent first)
  const allItems: Array<
    | { type: 'event'; data: typeof eventAllocations[string] }
    | { type: 'freeform'; data: StudyMoneyBudgetAllocation }
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
    const dateA = a.type === 'event' ? a.data.date : a.data.date;
    const dateB = b.type === 'event' ? b.data.date : b.data.date;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const handleOpenCreateDialog = () => {
    setEditingAllocation(null);
    setStudyMoneyDialogOpen(true);
  };

  const handleOpenEditDialog = (allocation: StudyMoneyBudgetAllocation) => {
    setEditingAllocation(allocation);
    setStudyMoneyDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setStudyMoneyDialogOpen(false);
    setEditingAllocation(null);
  };

  const handleSaveAllocation = (
    allocation: Partial<StudyMoneyBudgetAllocation>
  ) => {
    if (editingAllocation) {
      onEditStudyMoney({ ...editingAllocation, ...allocation });
    } else {
      onCreateStudyMoney(allocation);
    }
  };

  return (
    <>
      <Paper sx={{ mb: 3 }}>
        <Box sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Header with add button (only for users with write permission) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">
                Budget Allocations ({allItems.length})
              </Typography>
              {hasWritePermission && (
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenCreateDialog}
                >
                  Add Study Money
                </Button>
              )}
            </Box>

            {/* Info alert about event allocations */}
            {allItems.some((item) => item.type === 'event') && (
              <Alert severity="info" icon={<Info />}>
                Event allocations are managed from the Events page. Click the event
                name or{' '}
                <OpenInNew
                  sx={{ fontSize: 14, verticalAlign: 'middle', mx: 0.5 }}
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
                sx={{ py: 4 }}
              >
                No budget allocations yet
                {hasWritePermission && '. Click "Add Allocation" to create one.'}
              </Typography>
            ) : (
              allItems.map((item, index) =>
                item.type === 'event' ? (
                  <EventAllocationListItem
                    key={item.data.eventCode}
                    eventCode={item.data.eventCode}
                    eventName={item.data.eventName}
                    allocations={item.data.allocations}
                  />
                ) : (
                  <StudyMoneyAllocationListItem
                    key={item.data.id}
                    allocation={item.data}
                    hasWritePermission={hasWritePermission}
                    onEdit={hasWritePermission ? handleOpenEditDialog : undefined}
                    onDelete={hasWritePermission ? onDeleteStudyMoney : undefined}
                  />
                )
              )
            )}
          </Stack>
        </Box>
      </Paper>

      {/* Study Money Dialog */}
      <StudyMoneyAllocationDialog
        open={studyMoneyDialogOpen}
        onClose={handleCloseDialog}
        onSave={handleSaveAllocation}
        allocation={editingAllocation}
        availableBudget={availableStudyMoney}
        personName={personName}
      />
    </>
  );
}