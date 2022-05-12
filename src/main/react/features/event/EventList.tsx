import React, { useEffect, useState } from "react";
import { Card, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import { EventClient, FlockEvent } from "../../clients/EventClient";
import { isDefined } from "../../utils/validation";

type EventListProps = {
  refresh: boolean;
  onClickRow: (item: any) => void;
};

export function EventList({ refresh, onClickRow }: EventListProps) {
  const [state, setState] = useState<FlockEvent[]>([]);

  useEffect(() => {
    EventClient.all().then((res) => setState(res));
  }, [refresh]);

  function handleClickRow(item) {
    return () => {
      if (isDefined(onClickRow)) onClickRow(item);
    };
  }

  function renderItem(item) {
    return (
      <Grid key={`workday-list-item-${item.id}`} item xs={12}>
        <Card onClick={handleClickRow(item)}>
          <CardContent>
            <Typography variant="h6">{item.description}</Typography>
            <Typography>
              Period: {item.from.format("DD-MM-YYYY")} -{" "}
              {item.to ? item.to.format("DD-MM-YYYY") : <em>now</em>}
            </Typography>
            <Typography>
              Aantal dagen: {item.to.diff(item.from, "days") + 1}
            </Typography>
            <Typography>Aantal uren: {item.hours}</Typography>
            <Typography>
              {item.persons
                .sort((a, b) => (a.lastname > b.lastname ? 1 : -1))
                .map((person) => `${person.firstname} ${person.lastname}`)
                .join(",")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (state.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>No events</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={1}>
      {state.map(renderItem)}
    </Grid>
  );
}
