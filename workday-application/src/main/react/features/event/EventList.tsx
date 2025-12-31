import React, { useEffect, useState } from "react";
import { Box, Card, Chip, Typography } from "@mui/material";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import {
  EVENT_PAGE_SIZE,
  EventClient,
  FlockEvent,
  FullFlockEvent,
} from "../../clients/EventClient";
import { isDefined } from "../../utils/validation";
import { EventTypeMapping } from "../../utils/mappings";
import makeStyles from "@mui/styles/makeStyles";
import { FlockPagination } from "../../components/pagination/FlockPagination";

const useStyles = makeStyles({
  list: (loading) => ({
    opacity: loading ? 0.5 : 1,
  }),
});

type EventListProps = {
  refresh: boolean;
  onClickRow: (item: FullFlockEvent) => void;
};

export const EventList = ({
  refresh,
  onClickRow,
}: Readonly<EventListProps>) => {
  const [items, setItems] = useState<FlockEvent[]>([]);
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const classes = useStyles(loading);

  useEffect(() => {
    setLoading(true);

    EventClient.getAll(page).then((res) => {
      setItems(res.list);
      setCount(res.count);
      setLoading(false);
    });
  }, [refresh, page]);

  function handleClickRow(item: FullFlockEvent) {
    return () => {
      if (isDefined(onClickRow)) onClickRow(item);
    };
  }

  function renderItem(item: FullFlockEvent) {
    return (
      <Grid key={`workday-list-item-${item.id}`} size={{ xs: 12 }}>
        <Card onClick={handleClickRow(item)}>
          <CardContent>
            <Box
              style={{ display: "flex", alignItems: "center", gap: ".5rem" }}
            >
              <Typography variant="h6">{item.description}</Typography>
              <Chip
                label={EventTypeMapping[item.type]}
                size={"small"}
                color={"primary"}
                variant="outlined"
              />
            </Box>
            <Typography>
              Period: {item.from.format("DD-MM-YYYY")} -{" "}
              {item.to ? item.to.format("DD-MM-YYYY") : <em>now</em>}
            </Typography>
            <Typography>
              Aantal dagen: {item.to.diff(item.from, "days") + 1}
            </Typography>
            <Typography>Aantal uren: {item.hours}</Typography>
            <Typography>
              Totale kosten:{" "}
              {item.costs.toLocaleString("nl-NL", {
                style: "currency",
                currency: "EUR",
              })}
            </Typography>
            <Typography>
              {item.persons
                .toSorted((a, b) => (a.lastname > b.lastname ? 1 : -1))
                .map((person) => `${person.firstname} ${person.lastname}`)
                .join(",")}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (items.length === 0) {
    return (
      <Card>
        <CardContent>
          <Grid container spacing={1} className={classes.list}>
            <Typography>No events</Typography>
          </Grid>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Grid container spacing={1} className={classes.list}>
        {items.map(renderItem)}
      </Grid>
      <Box mt={2}>
        <FlockPagination
          currentPage={page + 1}
          numberOfItems={count}
          itemsPerPage={EVENT_PAGE_SIZE}
          changePageCb={setPage}
        />
      </Box>
    </>
  );
};
