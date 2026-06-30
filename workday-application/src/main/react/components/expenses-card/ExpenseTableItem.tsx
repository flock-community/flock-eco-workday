import DriveEtaIcon from '@mui/icons-material/DriveEta';
import PaymentsIcon from '@mui/icons-material/Payments';
import { Box, TableCell, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { DMY_DATE } from '../../clients/util/DateFormats';
import type { Expense } from '../../wirespec/model';

type ExpenseTableItemProps = {
  item: Expense;
};

export function ExpenseTableItem({ item }: ExpenseTableItemProps) {
  return (
    <TableRow data-testid={'table-row-expense'}>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {item.expenseType === 'TRAVEL' ? (
            <DriveEtaIcon fontSize="small" color="action" />
          ) : (
            <PaymentsIcon fontSize="small" color="action" />
          )}
          <span>{item.description}</span>
        </Box>
      </TableCell>
      <TableCell width={120} align={'right'}>
        {dayjs(item.date).format(DMY_DATE)}
      </TableCell>
      <TableCell width={110} align={'right'}>
        {item.costDetails?.amount?.toLocaleString('nl-NL', {
          style: 'currency',
          currency: 'EUR',
        })}
      </TableCell>
      <TableCell width={110} align={'right'}>
        {item.status.toLowerCase()}
      </TableCell>
    </TableRow>
  );
}
