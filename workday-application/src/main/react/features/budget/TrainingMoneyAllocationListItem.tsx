import { Delete, Description, Edit } from '@mui/icons-material';
import { Card, CardHeader, IconButton, Stack, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';
import React from 'react';
import type { BudgetAllocation } from '../../wirespec/model';

interface TrainingMoneyAllocationListItemProps {
  allocation: BudgetAllocation;
  hasWritePermission?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TrainingMoneyAllocationListItem({
  allocation,
  hasWritePermission = false,
  onEdit,
  onDelete,
}: TrainingMoneyAllocationListItemProps) {
  const amount = allocation.trainingMoneyDetails?.amount ?? 0;
  const fileCount = allocation.trainingMoneyDetails?.files?.length ?? 0;

  return (
    <Grid key={`workday-list-item-${allocation.id}`} size={{ xs: 12 }}>
      <Card>
        <CardHeader
          title={
            <>
              <Description color="action" sx={{ mt: 0.5, mr: 2 }} />
              {allocation.description ? allocation.description : 'Training Money'}
            </>
          }
          subheader={
            <Typography>
              Date: {dayjs(allocation.date).format('DD-MM-YYYY')} | Total:{' '}
              {'\u20AC'}
              {amount.toLocaleString('nl-NL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
              {fileCount > 0 &&
                ` | ${fileCount} file${fileCount > 1 ? 's' : ''}`}
            </Typography>
          }
          action={
            hasWritePermission ? (
              <Stack direction="row" spacing={0.5}>
                {onEdit && (
                  <IconButton size="small" onClick={onEdit} aria-label="edit">
                    <Edit fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton
                    size="small"
                    onClick={onDelete}
                    aria-label="delete"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            ) : undefined
          }
        />
      </Card>
    </Grid>
  );
}
