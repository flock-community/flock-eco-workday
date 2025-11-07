import React from "react";
import { TableCell, TableHead, TableRow } from "@material-ui/core";

const headCells = [
  {
    id: "name",
    disablePadding: false,
    label: "name".toUpperCase(),
  },
  {
    id: "email",
    disablePadding: false,
    label: "email".toUpperCase(),
  },
  {
    id: "active",
    disablePadding: false,
    label: "active".toUpperCase(),
  },
];

export const PersonTableHead = () => {
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

PersonTableHead.propTypes = {};
