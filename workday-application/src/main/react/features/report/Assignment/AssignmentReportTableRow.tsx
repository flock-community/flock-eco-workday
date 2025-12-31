import TableRow from "@mui/material/TableRow";
import { styled } from "@mui/material/styles";
import TableCell from "@mui/material/TableCell";
import IconButton from "@mui/material/IconButton";
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from "@mui/icons-material";
import NonProductiveHours from "./NonProductiveHours";
import React, { useState } from "react";
import { AggregationClientPersonAssignmentItem } from "../../../wirespec/Models";
import { Dayjs } from "dayjs";

const PREFIX = "AssignmentReportTableRow";

const classes = {
  noWrap: `${PREFIX}-noWrap`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")({
  [`& .${classes.noWrap}`]: {
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

  const toggleShowNonProductiveHours = () =>
    setShowNonProductiveHours(!showNonProductiveHours);

  return (
    <Root>
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
    </Root>
  );
}
