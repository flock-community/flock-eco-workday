import DriveEtaIcon from '@mui/icons-material/DriveEta';
import EuroIcon from '@mui/icons-material/Euro';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { Box, Card, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { EXPENSE_PAGE_SIZE, ExpenseClient } from '../../clients/ExpenseClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { StatusMenu } from '../../components/status/StatusMenu';
import type { DayListProps } from '../../types';
import type { Expense, ExpenseStatus } from '../../wirespec/model';

export function ExpenseList({
  personId,
  refresh,
  onClickRow,
}: Readonly<DayListProps>) {
  const [items, setItems] = useState<Expense[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Memoize the load function to avoid recreating it on every render
  const loadState = useCallback(() => {
    if (!personId) return;

    setLoading(true);
    ExpenseClient.findAllByPersonId(personId, page).then((res) => {
      setItems(res.list);
      setCount(res.count);
      setLoading(false);
    });
  }, [personId, page]);

  // Load data when dependencies change
  // Note: 'refresh' is intentionally in dependencies to trigger reloads when parent changes it
  // biome-ignore lint/correctness/useExhaustiveDependencies: refresh is used as a trigger
  useEffect(() => {
    loadState();
  }, [loadState, refresh]);

  const isAdmin = () =>
    !UserAuthorityUtil.hasAuthority('ExpenseAuthority.ADMIN');

  const handleClickRow = (item: Expense) => {
    return () => {
      if (onClickRow) onClickRow(item);
    };
  };

  const handleStatusChange = (item: Expense) => (status: ExpenseStatus) => {
    ExpenseClient.put(item.id, {
      ...item,
      status,
    }).then(() => loadState());
  };

  const renderItem = (item: Expense, key: number) => {
    const totalAmount: number =
      item.expenseType === 'COST'
        ? item?.costDetails?.amount
        : item?.travelDetails?.distance * item?.travelDetails?.allowance;

    const formattedAmount = totalAmount?.toLocaleString('nl-NL', {
      style: 'currency',
      currency: 'EUR',
    });

    return (
      <Grid key={`workday-list-item-${item.id}`} size={{ xs: 12 }}>
        <Card
          onClick={handleClickRow(item)}
          sx={{
            cursor: 'pointer',
            transition:
              'transform 160ms ease, box-shadow 200ms ease, border-color 160ms ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: 4,
              borderColor: 'text.disabled',
            },
          }}
        >
          <CardHeader
            slotProps={{
              title: { component: 'div' },
              subheader: { component: 'div' },
            }}
            action={
              <StatusMenu
                onChange={handleStatusChange(item)}
                disabled={isAdmin()}
                value={item.status}
              />
            }
            title={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.expenseType === 'TRAVEL' ? (
                  <DriveEtaIcon fontSize="small" color="action" />
                ) : (
                  <EuroIcon fontSize="small" color="action" />
                )}
                <span>{item.description ? item.description : 'Untitled'}</span>
              </Box>
            }
            subheader={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>{dayjs(item.date).format('DD-MM-YYYY')}</span>
                <span aria-hidden>&middot;</span>
                <Box
                  component="span"
                  sx={{ fontWeight: 600, color: 'text.primary' }}
                >
                  {formattedAmount}
                </Box>
              </Box>
            }
          />
          <List>
            {item.costDetails?.files?.map((file) => (
              <ListItemButton
                key={file.file}
                component="a"
                target="_blank"
                href={`/api/expenses/files/${file.file}/${file.name}`}
                onClick={(event) => event.stopPropagation()}
              >
                <ListItemText primary={file.name} />
              </ListItemButton>
            ))}
          </List>
        </Card>
      </Grid>
    );
  };

  // Don't show "No expenses" while still loading
  if (items.length === 0 && !loading) {
    return (
      <Card>
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: 1,
            py: 6,
          }}
        >
          <ReceiptLongIcon
            sx={{ fontSize: 40, color: 'text.disabled' }}
            aria-hidden
          />
          <Typography variant="h6">No expenses</Typography>
          <Typography variant="body2" color="text.secondary">
            Expenses you add will show up here.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      sx={{
        opacity: loading ? 0.5 : 1,
        transition: 'opacity 160ms ease',
      }}
    >
      <Grid container spacing={1}>
        {items.map(renderItem)}
      </Grid>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={EXPENSE_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </Box>
  );
}
