import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
} from "@material-ui/core";
import { Expense } from "../../models/Expense";
import { ExpenseTableItem } from "./ExpenseTableItem";

type ExpenseTableProps = {
  tableItems: Expense[];
  page: number;
  handleChangePageCallBack: (event, newPage) => void;
};

export function ExpenseTable({
  tableItems,
  page,
  handleChangePageCallBack,
}: ExpenseTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(4);

  return (
    <Table size={"small"}>
      <TableHead>
        <TableRow>
          <TableCell>Description</TableCell>
          <TableCell align={"right"}>Date</TableCell>
          <TableCell align={"right"}>Amount</TableCell>
          <TableCell align={"right"}>Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tableItems.length > 0 &&
          tableItems
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((item, key) => <ExpenseTableItem item={item} key={key} />)}
        {tableItems.length === 0 && (
          <TableRow data-testid={"expense-empty"}>
            <TableCell colSpan={4} align={"center"}>
              No expenses found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      {tableItems.length > rowsPerPage && (
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
        </TableFooter>
      )}
    </Table>
  );
}
