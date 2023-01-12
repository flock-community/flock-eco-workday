import React from "react";
import { TableCell, TableHead, TableRow } from "@material-ui/core";

const headCells = [
  {
    id: "name",
    align: false,
    disablePadding: false,
    label: "name".toUpperCase(),
  },
  {
    id: "email",
    align: false,
    disablePadding: false,
    label: "email".toUpperCase(),
  },
  {
    id: "active",
    align: false,
    disablePadding: false,
    label: "active".toUpperCase(),
  },
  { id: "holidays", label: "holidays".toUpperCase() },
  {
    id: "clients",
    align: false,
    disablePadding: false,
    label: "clients".toUpperCase(),
  },
  {
    id: "hours",
    align: false,
    disablePadding: false,
    label: "hours".toUpperCase(),
  },
];

export const PersonTableHead = () => {
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

PersonTableHead.propTypes = {};
