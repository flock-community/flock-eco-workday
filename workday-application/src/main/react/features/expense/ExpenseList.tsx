import DriveEtaIcon from '@mui/icons-material/DriveEta';
import MoneyIcon from '@mui/icons-material/Money';
import { Box, Card, Typography } from '@mui/material';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { styled } from '@mui/material/styles';
import UserAuthorityUtil from '@workday-user/user_utils/UserAuthorityUtil';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { EXPENSE_PAGE_SIZE, ExpenseClient } from '../../clients/ExpenseClient';
import { FlockPagination } from '../../components/pagination/FlockPagination';
import { StatusMenu } from '../../components/status/StatusMenu';
import type { DayListProps } from '../../types';
import type { Expense, ExpenseStatus } from '../../wirespec/model';

const PREFIX = 'ExpenseList';

const classes = {
  list: `${PREFIX}List`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
  [`& .${classes.list}`]: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

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

    return (
      <Grid key={`workday-list-item-${item.id}`} size={{ xs: 12 }}>
        <Card onClick={handleClickRow(item)}>
          <CardHeader
            action={
              <StatusMenu
                onChange={handleStatusChange(item)}
                disabled={isAdmin()}
                value={item.status}
              />
            }
            title={
              <>
                {item.expenseType === 'TRAVEL' ? (
                  <DriveEtaIcon sx={{ verticalAlign: 'middle' }} />
                ) : (
                  <MoneyIcon sx={{ verticalAlign: 'middle' }} />
                )}
                {item.description ? item.description : 'empty'}
              </>
            }
            subheader={
              <Typography>
                Date: {dayjs(item.date).format('DD-MM-YYYY')} | Total:{' '}
                {totalAmount?.toLocaleString('nl-NL', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </Typography>
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
        <CardContent>
          <Typography>No expenses</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Root>
      <Grid
        container
        spacing={1}
        className={classes.list}
        style={{ opacity: loading ? 0.5 : 1 }}
      >
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
    </Root>
  );
}
