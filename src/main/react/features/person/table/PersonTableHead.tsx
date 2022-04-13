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
    algin: false,
    disablePadding: false,
    label: "email".toUpperCase(),
  },
  {
    id: "active",
    algin: false,
    disablePadding: false,
    label: "active".toUpperCase(),
  },
  { id: "holidays", label: "holidays".toUpperCase() },
  {
    id: "clients",
    algin: false,
    disablePadding: false,
    label: "clients".toUpperCase(),
  },
  {
    id: "hours",
    algin: false,
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
            align={cell.algin ? "right" : "left"}
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
