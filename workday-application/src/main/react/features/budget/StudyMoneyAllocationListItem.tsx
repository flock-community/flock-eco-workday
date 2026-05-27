import React from 'react';
import {
  Box,
  Divider,
  Paper,
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
import type {BudgetAllocation} from '../../wirespec/model';
import Grid from '@mui/material/Grid';
import dayjs from 'dayjs';

interface StudyMoneyAllocationListItemProps {
  allocation: BudgetAllocation;
  hasWritePermission?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function StudyMoneyAllocationListItem({
  allocation,
  hasWritePermission = false,
  onEdit,
  onDelete,
}: StudyMoneyAllocationListItemProps) {
  const amount = allocation.studyMoneyDetails?.amount ?? 0;
  const fileCount = allocation.studyMoneyDetails?.files?.length ?? 0;

  return (
    <Grid key={`workday-list-item-${allocation.id}`} size={{xs: 12}}>
      <Paper variant="outlined" sx={{borderLeft: '4px solid', borderColor: 'success.main'}}>
        <CardHeader
          title={
            <>
              <Description color="action" sx={{mt: 0.5, mr: 2}} />
              {allocation.description ? allocation.description : 'Study Money'}
            </>
          }
          subheader={
            <Typography>
              {dayjs(allocation.date).format('DD-MM-YYYY')}
              {fileCount > 0 && ` | ${fileCount} file${fileCount > 1 ? 's' : ''}`}
            </Typography>
          }
          action={
            hasWritePermission ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                {onEdit && (
                  <IconButton size="small" onClick={onEdit} aria-label="edit">
                    <Edit fontSize="small" />
                  </IconButton>
                )}
                {onDelete && (
                  <IconButton size="small" onClick={onDelete} aria-label="delete">
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Stack>
            ) : undefined
          }
        />

        <Divider />

        <Box sx={{px: 1.5, py: 1}}>
          <Typography variant="body2" color="text.secondary">
            {'\u20AC'}{amount.toLocaleString('nl-NL', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </Typography>
        </Box>
      </Paper>
    </Grid>
  );
}
