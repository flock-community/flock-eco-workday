import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  AttachFile,
  Edit,
  Delete,
  CheckCircle,
  HourglassEmpty,
  Cancel,
  Description,
} from '@mui/icons-material';
import {
  StudyMoneyBudgetAllocation,
  ApprovalStatus,
} from './mocks/BudgetAllocationMocks';

interface StudyMoneyAllocationListItemProps {
  allocation: StudyMoneyBudgetAllocation;
  hasWritePermission?: boolean;
  onEdit?: (allocation: StudyMoneyBudgetAllocation) => void;
  onDelete?: (allocation: StudyMoneyBudgetAllocation) => void;
}

export function StudyMoneyAllocationListItem({
  allocation,
  hasWritePermission = false,
  onEdit,
  onDelete,
}: StudyMoneyAllocationListItemProps) {
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

  const handleEdit = () => {
    console.log('Edit StudyMoneyBudgetAllocation:', allocation.id);
    onEdit?.(allocation);
  };

  const handleDelete = () => {
    console.log('Delete StudyMoneyBudgetAllocation:', allocation.id);
    onDelete?.(allocation);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          {/* Free-form icon */}
          <Description color="action" sx={{ mt: 0.5 }} />

          {/* Main content */}
          <Box sx={{ flex: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="h6">
                €
                {allocation.amount.toLocaleString('nl-NL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Typography>
              <Chip
                icon={getStatusIcon(allocation.status)}
                label={allocation.status}
                size="small"
                color={getStatusColor(allocation.status)}
                variant="outlined"
              />
            </Box>

            <Typography variant="body1" sx={{ mb: 1 }}>
              {allocation.description}
            </Typography>

            <Typography variant="caption" color="text.secondary" display="block">
              {formatDate(allocation.date)}
            </Typography>

            {/* Files */}
            {allocation.files && allocation.files.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                {allocation.files.map((file) => (
                  <Chip
                    key={file.id}
                    icon={<AttachFile fontSize="small" />}
                    label={file.name}
                    size="small"
                    variant="outlined"
                    onClick={() => console.log('Open file:', file.url)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Actions (only show if user has write permission) */}
          {hasWritePermission && (
            <Box>
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={handleEdit}
                  aria-label="Edit allocation"
                >
                  <Edit fontSize="small" />
                </IconButton>
              )}
              {onDelete && allocation.status !== ApprovalStatus.APPROVED && (
                <IconButton
                  size="small"
                  onClick={handleDelete}
                  aria-label="Delete allocation"
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}