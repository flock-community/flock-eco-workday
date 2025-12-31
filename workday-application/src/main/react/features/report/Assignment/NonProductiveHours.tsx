import React, { useEffect, useState } from "react";
import { styled } from "@mui/material/styles";
import { TableCell } from "@mui/material";
import TableRow from "@mui/material/TableRow";
import { AlignedLoader } from "@workday-core/components/AlignedLoader";
import { Dayjs } from "dayjs";
import { ISO_8601_DATE } from "../../../clients/util/DateFormats";

const PREFIX = "NonProductiveHours";

const classes = {
  row: `${PREFIX}-row`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")({
  [`& .${classes.row}`]: {
    fontStyle: "italic",
    backgroundColor: "#EFEFEF",
  },
});

type NonProductiveHoursProps = {
  personId: string;
  from: Dayjs;
  to: Dayjs;
};

type NonProductiveHoursPerDay = {
  sickHours: number;
  holidayHours: number;
  paidParentalLeaveHours: number;
  unpaidParentalLeaveHours: number;
};

export default function NonProductiveHours({
  personId,
  from,
  to,
}: NonProductiveHoursProps) {
  const [days, setDays] = useState<NonProductiveHoursPerDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(
      `/api/aggregations/person-nonproductive-hours-per-day?personId=${personId}&from=${from.format(
        ISO_8601_DATE
      )}&to=${to.format(ISO_8601_DATE)}`
    )
      .then((res) => res.json())
      .then((res) => {
        setDays(res);
        setLoading(false);
      });
  }, [personId, from, to]);

  if (loading) {
    return (
      <TableRow>
        <TableCell colSpan={30}>
          <AlignedLoader />
        </TableCell>
      </TableRow>
    );
  }
  return (
    <Root>
      <TableRow className={classes.row}>
        <TableCell />
        <TableCell>Sickdays</TableCell>
        {days.map((day, index) => (
          <TableCell key={index}>
            {day.sickHours > 0.0 ? day.sickHours : ""}
          </TableCell>
        ))}
      </TableRow>
      <TableRow className={classes.row}>
        <TableCell />
        <TableCell>Leave days</TableCell>
        {days.map((day, index) => (
          <TableCell key={index}>
            {day.holidayHours > 0.0 ? day.holidayHours : ""}
          </TableCell>
        ))}
      </TableRow>
      <TableRow className={classes.row}>
        <TableCell />
        <TableCell>Paid Parental Leave</TableCell>
        {days.map((day, index) => (
          <TableCell key={index}>
            {day.paidParentalLeaveHours > 0.0 ? day.paidParentalLeaveHours : ""}
          </TableCell>
        ))}
      </TableRow>
      <TableRow className={classes.row}>
        <TableCell />
        <TableCell>Unpaid Parental Leave</TableCell>
        {days.map((day, index) => (
          <TableCell key={index}>
            {day.unpaidParentalLeaveHours > 0.0
              ? day.unpaidParentalLeaveHours
              : ""}
          </TableCell>
        ))}
      </TableRow>
    </Root>
  );
}
