import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import NonProductiveHours from "./NonProductiveHours";
import React, { useState } from "react";
import { AggregationClientPersonAssignmentItem } from "../../../wirespec/Models";
import makeStyles from "@mui/styles/makeStyles";
import { Dayjs } from "dayjs";

const useStyles = makeStyles({
  noWrap: {
    whiteSpace: "nowrap",
  },
});

type AssignmentReportTableRowProps = {
  item: AggregationClientPersonAssignmentItem;
  from: Dayjs;
  to: Dayjs;
};

export default function AssignmentReportTableRow({
  item,
  from,
  to,
}: AssignmentReportTableRowProps) {
  const [showNonProductiveHours, setShowNonProductiveHours] = useState(false);

  const classes = useStyles();

  const toggleShowNonProductiveHours = () =>
    setShowNonProductiveHours(!showNonProductiveHours);

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton size="small" onClick={toggleShowNonProductiveHours}>
            {showNonProductiveHours ? (
              <KeyboardArrowUpIcon />
            ) : (
              <KeyboardArrowDownIcon />
            )}
          </IconButton>
        </TableCell>
        <TableCell className={classes.noWrap}>
          {item.person.name} ({item.assignment.name})
        </TableCell>
        {item.hours.map((val, personHoursIndex) => (
          <TableCell width={10} key={personHoursIndex}>
            {val > 0 ? val.toFixed(1) : ""}
          </TableCell>
        ))}
      </TableRow>
      {showNonProductiveHours && (
        <NonProductiveHours personId={item.person.id} from={from} to={to} />
      )}
    </>
  );
}
