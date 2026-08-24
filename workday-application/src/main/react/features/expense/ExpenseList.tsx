import AddIcon from '@mui/icons-material/Add';
import CreateIcon from '@mui/icons-material/Create';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import PaymentsIcon from '@mui/icons-material/Payments';
import {
  Box,
  Button,
  IconButton,
  Link,
  TableCell,
  TableRow,
} from '@mui/material';
import { DataTable } from '@workday-core/components/DataTable';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { EXPENSE_PAGE_SIZE, ExpenseClient } from '../../clients/ExpenseClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { StatusMenu } from '../../components/status/StatusMenu';
import { TableCard } from '../../components/TableCard';
import type { DayListProps } from '../../types';
import type { Expense, ExpenseStatus } from '../../wirespec/model';

export function ExpenseList({
  personId,
  refresh,
  onClickRow,
  onClickAdd,
}: Readonly<DayListProps>) {
  const [items, setItems] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadState = useCallback(() => {
    if (!personId) return;

    setLoading(true);
    ExpenseClient.findAllByPersonId(personId, page).then((res) => {
      setItems(res.list);
      setCount(res.count);
      setLoading(false);
    });
  }, [personId, page]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh is used as a trigger
  useEffect(() => {
    loadState();
  }, [loadState, refresh]);

  const isAdmin = () =>
    !UserAuthorityUtil.hasAuthority('ExpenseAuthority.ADMIN');

  const handleClickRow = (item: Expense) => () => onClickRow?.(item);

  const handleStatusChange = (item: Expense) => (status: ExpenseStatus) => {
    ExpenseClient.put(item.id, {
      ...item,
      status,
    }).then(() => loadState());
  };

  const renderRow = (item: Expense) => {
    const totalAmount: number =
      item.expenseType === 'COST'
        ? item?.costDetails?.amount
        : item?.travelDetails?.distance * item?.travelDetails?.allowance;

    const formattedAmount = totalAmount?.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });

    return (
      <TableRow key={`expense-list-item-${item.id}`} hover>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {item.expenseType === 'TRAVEL' ? (
              <DriveEtaIcon fontSize="small" color="action" />
            ) : (
              <PaymentsIcon fontSize="small" color="action" />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Box>{item.description ? item.description : 'Untitled'}</Box>
              {item.costDetails?.files?.map((file) => (
                <Link
                  key={file.file}
                  href={`/api/expenses/files/${file.file}/${file.name}`}
                  target="_blank"
                  rel="noopener"
                  onClick={(event) => event.stopPropagation()}
                  sx={{ display: 'block', fontSize: 12 }}
                >
                  {file.name}
                </Link>
              ))}
            </Box>
          </Box>
        </TableCell>
        <TableCell>{dayjs(item.date).format('DD-MM-YYYY')}</TableCell>
        <TableCell align="right">{formattedAmount}</TableCell>
        <TableCell>
          <StatusMenu
            onChange={handleStatusChange(item)}
            disabled={isAdmin()}
            value={item.status}
          />
        </TableCell>
        <TableCell align="right">
          <IconButton onClick={handleClickRow(item)} size="small">
            <CreateIcon fontSize="small" />
          </IconButton>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Box>
      <TableCard
        title="Expenses"
        action={
          <Button startIcon={<AddIcon />} onClick={onClickAdd}>
            Add
          </Button>
        }
        loading={loading}
      >
        <DataTable
          columns={[
            { header: 'Description' },
            { header: 'Date' },
            { header: 'Amount', align: 'right' },
            { header: 'Status' },
            {},
          ]}
          items={items}
          renderRow={renderRow}
          emptyMessage="No expenses"
        />
      </TableCard>
      <FlockPagination
        currentPage={page + 1}
        numberOfItems={count}
        itemsPerPage={EXPENSE_PAGE_SIZE}
        changePageCb={setPage}
      />
    </Box>
  );
}
