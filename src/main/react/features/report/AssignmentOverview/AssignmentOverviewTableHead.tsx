import {TableCell, TableHead, TableRow} from "@material-ui/core";
import React from "react";

const headcells = [
  {
    id: "person",
    label: "person".toUpperCase()
  },
  {
    id: "client",
    label: "client".toUpperCase()
  },
  {
    id: "from",
    label: "from".toUpperCase()
  },
  {
    id: "to",
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
          >
            {cell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};
