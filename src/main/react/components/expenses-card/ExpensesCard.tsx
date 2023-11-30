import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead, TablePagination,
  TableRow
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import React, {useEffect, useState} from "react";
import {ExpenseProps} from "../../features/expense/ExpenseList";
import {DMY_DATE} from "../../clients/util/DateFormats";
import dayjs from "dayjs";

type ExpenseCardProps = {
  items: ExpenseProps[]
}

export function ExpensesCard({items}: ExpenseCardProps) {
  const [openExpenses, setOpenExpenses] = useState<ExpenseProps[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<ExpenseProps[]>([]);
  const [openPage, setOpenPage] = useState(0);
  const [recentPage, setRecentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(4);

  useEffect(() => {
    if (items) {
      setOpenExpenses(items.filter(it => it.status === "REQUESTED"));
      setRecentExpenses(
          items.filter(it => it.status !== "REQUESTED")
              .filter(it => it.date > dayjs().startOf('day').subtract(30, 'days'))
      );
    }
  }, [items]);

  const handleChangeOpenItemPage = (event: unknown, newPage: number) => {
    setOpenPage(newPage);
  };

  const handleChangeRecentItemPage = (event: unknown, newPage: number) => {
    setRecentPage(newPage);
  };

  function renderTable(tableItems: ExpenseProps[], page: number, handleChangePageCallBack: (event, newPage) => void) {
    return (
      <Table size={'small'}>
        <TableHead>
          <TableRow>
            <TableCell>Description</TableCell>
            <TableCell align={"right"}>Date</TableCell>
            <TableCell align={"right"}>Amount</TableCell>
            <TableCell align={"right"}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { (tableItems.length > 0) && tableItems.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(renderExpense)}
          { (tableItems.length === 0) &&
            <TableRow>
              <TableCell colSpan={4} align={'center'}>No expenses found.</TableCell>
            </TableRow>
          }
        </TableBody>
        {(tableItems.length > rowsPerPage) &&
        <TableFooter>
          <TableRow>
            <TablePagination
              rowsPerPageOptions={[rowsPerPage]}
              count={tableItems.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePageCallBack}
            />
          </TableRow>
        </TableFooter>}
      </Table>
    )
  }

  function renderExpense(item, key) {
    const totalAmount = item.type === "COST" ? item.amount : item.allowance * item.distance;
    return (
      <TableRow key={key}>
        <TableCell>{item.description}</TableCell>
        <TableCell width={120} align={"right"}>{item.date.format(DMY_DATE)}</TableCell>
        <TableCell width={110} align={"right"}>{totalAmount.toLocaleString("nl-NL", {
          style: "currency",
          currency: "EUR",
        })}</TableCell>
        <TableCell width={110} align={"right"}>{item.status.toLowerCase()}</TableCell>
      </TableRow>
    )
  }

  return (
    <Card variant={"outlined"} style={{borderRadius: 0}}>
      <CardHeader title={"Expenses"}/>
      <CardContent className={'flow'}>
        <Box>
          <Typography>open</Typography>
          { renderTable(openExpenses, openPage, handleChangeOpenItemPage) }
        </Box>
        <Box>
          <Typography>most recent</Typography>
          { renderTable(recentExpenses, recentPage, handleChangeRecentItemPage) }
        </Box>
      </CardContent>
    </Card>
  );
}
