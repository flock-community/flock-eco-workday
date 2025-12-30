import { TableCell, TableHead, TableRow } from "@mui/material";
import React from "react";

const headCells = [
  {
    id: "person",
    disablePadding: false,
    label: "person".toUpperCase(),
  },
  {
    id: "from",
    disablePadding: false,
    label: "from".toUpperCase(),
  },
  { id: "to", label: "to".toUpperCase() },
  { id: "type", label: "type".toUpperCase() },
];

export const ContractOverviewTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        {headCells.map((cell) => (
          <TableCell
            key={cell.id}
            padding={cell.disablePadding ? "none" : "normal"}
          >
            {cell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
