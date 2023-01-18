import {TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";

const headcells = [
  {
    id: "person",
    align: false,
    disablePadding: false,
    label: "person".toUpperCase()
  },
  {
    id: "client",
    align: false,
    disablePadding: false,
    label: "client".toUpperCase()
  },
  {
    id: "from",
    align: false,
    disablePadding: false,
    label: "from".toUpperCase()
  },
  {
    id: "to",
    align: false,
    disablePadding: false,
    label: "to".toUpperCase()
  }
];

export const AssignmentOverviewTableHead = () => {
  return (
    <TableHead>
      <TableRow>
        {headcells.map((cell) => (
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
