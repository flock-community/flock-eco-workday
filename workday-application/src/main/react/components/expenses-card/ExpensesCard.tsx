import { Box, Card, CardContent, CardHeader } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { getOpenExpenses, getRecentExpenses } from '../../hooks/expenseFilters';
import type { Expense } from '../../models/Expense';
import { ExpenseTable } from './ExpenseTable';

type ExpenseCardProps = {
  items: Expense[];
};

export function ExpensesCard({ items }: ExpenseCardProps) {
  const [openExpenses, setOpenExpenses] = useState<Expense[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [openPage, setOpenPage] = useState(0);
  const [recentPage, setRecentPage] = useState(0);

  useEffect(() => {
    if (items) {
      setOpenExpenses(getOpenExpenses(items));
      setRecentExpenses(getRecentExpenses(items, 30));
    }
  }, [items]);

  const handleChangeOpenItemPage = (_event: unknown, newPage: number) => {
    setOpenPage(newPage);
  };

  const handleChangeRecentItemPage = (_event: unknown, newPage: number) => {
    setRecentPage(newPage);
  };

  return (
    <Card
      variant={'outlined'}
      style={{ borderRadius: 0 }}
      data-testid={'expenses-card'}
    >
      <CardHeader title={'Expenses'} />
      <CardContent className={'flow'}>
        <Box>
          <Typography variant={'h6'}>open</Typography>
          <ExpenseTable
            tableItems={openExpenses}
            page={openPage}
            handleChangePageCallBack={handleChangeOpenItemPage}
          />
        </Box>
        <Box>
          <Typography variant={'h6'}>most recent</Typography>
          <ExpenseTable
            tableItems={recentExpenses}
            page={recentPage}
            handleChangePageCallBack={handleChangeRecentItemPage}
          />
        </Box>
      </CardContent>
    </Card>
  );
}
