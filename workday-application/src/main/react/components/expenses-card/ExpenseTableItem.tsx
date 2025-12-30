import React from "react";
import { TableCell, TableRow } from "@mui/material";
import { DMY_DATE } from "../../clients/util/DateFormats";
import { Expense } from "../../models/Expense";

type ExpenseTableItemProps = {
  item: Expense;
};

export function ExpenseTableItem({ item }: ExpenseTableItemProps) {
  return (
    <TableRow data-testid={"table-row-expense"}>
      <TableCell>{item.description}</TableCell>
      <TableCell width={120} align={"right"}>
        {item.date.format(DMY_DATE)}
      </TableCell>
      <TableCell width={110} align={"right"}>
        {item.amount.toLocaleString("nl-NL", {
          style: "currency",
          currency: "EUR",
        })}
      </TableCell>
      <TableCell width={110} align={"right"}>
        {item.status.toLowerCase()}
      </TableCell>
    </TableRow>
  );
}
