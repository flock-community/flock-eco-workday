import {TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";

const headCells = [
  {
    id: "person",
    align: false,
    disablePadding: false,
    label: "person".toUpperCase(),
  },
  {
    id: "from",
    align: false,
    disablePadding: false,
    label: "from".toUpperCase(),
  },
  { id: "to",
    label: "to".toUpperCase() },
];

export const ContractReportTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((cell) => (
          <TableCell
            key={cell.id}
            align={cell.align ? "right" : "left"}
            padding={cell.disablePadding ? "none" : "normal"}
          >
            {cell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
