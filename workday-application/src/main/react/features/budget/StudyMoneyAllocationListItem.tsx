import React from 'react';
import {
  Card,
  Typography,
  CardHeader,
} from '@mui/material';
import {
  Description,
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
    <>
      <Grid key={`workday-list-item-${allocation.id}`} size={{xs: 12}}>
        <Card onClick={() => {
        }}>
          <CardHeader
            title={
              <>
                {/*Free-form icon*/}
                <Description color="action" sx={{mt: 0.5, mr: 2}}/>
                {allocation.description ? allocation.description : 'empty'}
              </>
            }
            subheader={
              <Typography>
                Date: {dayjs(allocation.date).format('DD-MM-YYYY')} | Total:{' '}
                €
                {allocation.amount.toLocaleString('nl-NL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}              </Typography>
            }
          />
        </Card>
      </Grid>
    </>
  );
}
