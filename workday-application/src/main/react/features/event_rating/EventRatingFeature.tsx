import React, { useEffect, useState } from "react";

import Fab from "@mui/material/Fab";
import Grid2 from "@mui/material/Grid2";
import { Typography } from "@mui/material";
import Container from "@mui/material/Container";
import { useParams } from "react-router-dom";
import { EventClient, FlockEvent } from "../../clients/EventClient";

/**
 * @return {null}
 */
export function EventRatingFeature() {
  let { eventCode } = useParams();

  const [event, setEvent] = useState<FlockEvent | null>(null);
  const [ratings, setRatings] = useState<any>(null);

  useEffect(() => {
    EventClient.get(eventCode).then((res) => setEvent(res));
    EventClient.getRatings(eventCode).then((res) => setRatings(res));
  }, []);

  const updateRating = (person, rating) => () => {
    EventClient.postRatings(eventCode, {
      eventCode,
      personId: person?.uuid,
      rating,
    }).then(() => {
      EventClient.getRatings(eventCode).then((res) => setRatings(res));
    });
  };

  const deleteRating = (person) => () => {
    EventClient.deleteRatings(eventCode, person?.uuid).then(() => {
      EventClient.getRatings(eventCode).then((res) => setRatings(res));
    });
  };

  const renderRow = (person) => {
    const eventRating = ratings.find(
      (rating) => rating.person.uuid === person.uuid
    );
    return (
      <Grid2 container spacing={1}>
        {[...Array(10).keys()]
          .map((i) => i + 1)
          .map((i) => (
            <Grid2 key={`button-${person.uuid}-${i}`}>
              <Fab
                color={
                  eventRating && eventRating.rating === i
                    ? "primary"
                    : "default"
                }
                onClick={updateRating(person, i)}
              >
                {i}
              </Fab>
            </Grid2>
          ))}
        <Grid2>
          <Fab onClick={deleteRating(person)}>X</Fab>
        </Grid2>
      </Grid2>
    );
  };

  if (!event || !ratings) return null;

  return (
    <Container maxWidth="md">
      <Typography variant="h3">{event.description}</Typography>
      {event.persons.map((person) => (
        <Grid2
          key={`person-${person.uuid}`}
          container
          spacing={3}
          alignItems="center"
        >
          <Grid2 size="grow">
            <Typography>
              {person.firstname} {person.lastname}
            </Typography>
          </Grid2>
          <Grid2>{renderRow(person)}</Grid2>
        </Grid2>
      ))}
    </Container>
  );
}
