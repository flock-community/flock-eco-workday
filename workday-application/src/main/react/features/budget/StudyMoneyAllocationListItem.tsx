import React from 'react';
import {
  Card,
  Typography,
  CardHeader,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Description,
  Edit,
  Delete,
} from '@mui/icons-material';
import {
  StudyMoneyBudgetAllocation,
} from './mocks/BudgetAllocationTypes';
import Grid from "@mui/material/Grid";
import dayjs from "dayjs";

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

  const handleEdit = () => {
    console.log('Edit StudyMoneyBudgetAllocation:', allocation.id);
    onEdit?.(allocation);
  };

  const handleDelete = () => {
    console.log('Delete StudyMoneyBudgetAllocation:', allocation.id);
    onDelete?.(allocation);
  };

  return (
    <Grid key={`workday-list-item-${allocation.id}`} size={{xs: 12}}>
      <Card>
        <CardHeader
          title={
            <>
              <Description color="action" sx={{mt: 0.5, mr: 2}}/>
              {allocation.description ? allocation.description : 'empty'}
            </>
          }
          subheader={
            <Typography>
              Date: {dayjs(allocation.dateFrom).format('DD-MM-YYYY')} | Total:{' '}
              €
              {allocation.amount.toLocaleString('nl-NL', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Typography>
          }
          action={
            hasWritePermission ? (
              <Stack direction="row" spacing={0.5}>
                <IconButton size="small" onClick={handleEdit} aria-label="edit">
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleDelete} aria-label="delete">
                  <Delete fontSize="small" />
                </IconButton>
              </Stack>
            ) : undefined
          }
        />
      </Card>
    </Grid>
  );
}
