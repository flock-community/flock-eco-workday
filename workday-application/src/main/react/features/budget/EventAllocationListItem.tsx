import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
  Link,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccessTime,
  AttachMoney,
  Business,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Event,
  OpenInNew,
} from '@mui/icons-material';
import {
  BudgetAllocation,
  ApprovalStatus,
} from './mocks/BudgetAllocationMocks';

interface EventAllocationListItemProps {
  eventCode: string;
  eventName: string;
  allocations: BudgetAllocation[];
}

export function EventAllocationListItem({
  eventCode,
  eventName,
  allocations,
}: EventAllocationListItemProps) {
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
        return <CheckCircle fontSize="small" color="success" />;
      case ApprovalStatus.REQUESTED:
        return <HourglassEmpty fontSize="small" color="warning" />;
      case ApprovalStatus.REJECTED:
        return <Cancel fontSize="small" color="error" />;
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
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {/* Event header with icon and link */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Event color="primary" />
            <Link
              component="button"
              variant="h6"
              onClick={handleNavigateToEvent}
              sx={{
                textAlign: 'left',
                color: 'text.primary',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                  color: 'primary.main',
                },
              }}
            >
              {eventName}
            </Link>
            <Tooltip title="Manage event allocations from Events page">
              <IconButton
                size="small"
                onClick={handleNavigateToEvent}
                sx={{ ml: 'auto' }}
              >
                <OpenInNew fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Event Code: {eventCode}
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Person allocations */}
        {Object.entries(personAllocations).map(
          ([personId, { personName, allocations: personAllocs }]) => (
            <Box key={personId} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {personName}
              </Typography>

              <Stack spacing={1}>
                {personAllocs.map((allocation) => (
                  <Box
                    key={allocation.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      bgcolor: 'background.default',
                      borderRadius: 1,
                    }}
                  >
                    {/* Icon based on type */}
                    {allocation.type === 'StudyTime' ||
                    allocation.type === 'HackTime' ? (
                      <AccessTime fontSize="small" color="action" />
                    ) : allocation.type === 'FlockMoney' ? (
                      <Business fontSize="small" color="action" />
                    ) : (
                      <AttachMoney fontSize="small" color="action" />
                    )}

                    {/* Allocation details */}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2">
                        {allocation.type === 'StudyTime' && (
                          <>
                            <strong>Study Time:</strong>{' '}
                            {allocation.totalHours}h
                          </>
                        )}
                        {allocation.type === 'HackTime' && (
                          <>
                            <strong>Hack Time:</strong> {allocation.totalHours}h
                          </>
                        )}
                        {allocation.type === 'StudyMoney' && (
                          <>
                            <strong>Study Money:</strong> €
                            {allocation.amount.toLocaleString('nl-NL')}
                          </>
                        )}
                        {allocation.type === 'FlockMoney' && (
                          <>
                            <strong>Flock Money:</strong> €
                            {allocation.amount.toLocaleString('nl-NL')}
                          </>
                        )}
                      </Typography>
                      {allocation.description && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                        >
                          {allocation.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(allocation.date)}
                      </Typography>
                    </Box>

                    {/* Status */}
                    <Chip
                      icon={getStatusIcon(allocation.status)}
                      label={allocation.status}
                      size="small"
                      color={getStatusColor(allocation.status)}
                      variant="outlined"
                    />
                  </Box>
                ))}
              </Stack>
            </Box>
          )
        )}
      </CardContent>
    </Card>
  );
}