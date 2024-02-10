import { Box, Card, CardContent, CardHeader } from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import React, { useEffect, useState } from "react";
import { useExpenseFilters } from "../../hooks/useExpenseFiltersHook";
import { Expense } from "../../models/Expense";
import { ExpenseTable } from "./ExpenseTable";

type ExpenseCardProps = {
  items: Expense[];
};

export function ExpensesCard({ items }: ExpenseCardProps) {
  const [openExpenses, setOpenExpenses] = useState<Expense[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [openPage, setOpenPage] = useState(0);
  const [recentPage, setRecentPage] = useState(0);
  const [getOpenExpenses, getRecentExpenses] = useExpenseFilters();

  useEffect(() => {
    if (items) {
      setOpenExpenses(getOpenExpenses(items));
      setRecentExpenses(getRecentExpenses(items, 30));
    }
  }, [items]);

  const handleChangeOpenItemPage = (event: unknown, newPage: number) => {
    setOpenPage(newPage);
  };

  const handleChangeRecentItemPage = (event: unknown, newPage: number) => {
    setRecentPage(newPage);
  };

  return (
    <Card
      variant={"outlined"}
      style={{ borderRadius: 0 }}
      data-testid={"expenses-card"}
    >
      <CardHeader title={"Expenses"} />
      <CardContent className={"flow"}>
        <Box>
          <Typography variant={"h6"}>open</Typography>
          <ExpenseTable
            tableItems={openExpenses}
            page={openPage}
            handleChangePageCallBack={handleChangeOpenItemPage}
          />
        </Box>
        <Box>
          <Typography variant={"h6"}>most recent</Typography>
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
