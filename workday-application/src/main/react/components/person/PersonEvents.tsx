import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@mui/material";
import Typography from "@mui/material/Typography";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import { PersonEvent, PersonEventType } from "../../clients/PersonEventClient";

type PersonEventsProps = {
  withinNWeeks: number;
  personEvents: PersonEvent[];
};

export default function PersonEvents({
  withinNWeeks,
  personEvents,
}: PersonEventsProps) {
  const noContent = (
    <Typography variant="caption">
      No person events within {withinNWeeks} weeks
    </Typography>
  );

  const renderEventType = (eventType: PersonEventType) => {
    switch (eventType) {
      case "BIRTHDAY":
        return "Birthday";
      case "JOIN_DAY":
        return "Join day";
      default:
        throw Error(`Unknown event type: ${eventType}`);
    }
  };

  const renderPersonEvent = (personEvent: PersonEvent, index) => (
    <TableRow key={index}>
      <TableCell>{personEvent.person.fullName}</TableCell>
      <TableCell>{renderEventType(personEvent.eventType)}</TableCell>
      <TableCell>{personEvent.eventDate.format("DD-MM-YYYY")}</TableCell>
    </TableRow>
  );

  const table = (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Type</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{personEvents.map(renderPersonEvent)}</TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Card>
      <CardHeader title={`Person events within ${withinNWeeks} weeks`} />
      <CardContent>{personEvents.length > 0 ? table : noContent}</CardContent>
    </Card>
  );
}
