import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import TableRow from "@material-ui/core/TableRow";
import Table from "@material-ui/core/Table";
import dayjs from "dayjs";
import {
  PersonEvent,
  PersonEventClient,
  PersonEventType,
} from "../../clients/PersonEventClient";

type PersonEventsProps = {
  withinNWeeks: number;
};

export default function PersonEvents({ withinNWeeks }: PersonEventsProps) {
  const [personEvents, setPersonEvents] = useState<PersonEvent[]>([]);

  useEffect(() => {
    PersonEventClient.findAllBetween(
      new Date(),
      dayjs().add(withinNWeeks, "weeks").toDate()
    ).then((res) => setPersonEvents(res));
  }, [withinNWeeks]);

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
