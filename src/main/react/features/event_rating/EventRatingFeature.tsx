import React, {useEffect, useState} from "react";

import Fab from "@material-ui/core/Fab";
import Grid from "@material-ui/core/Grid";
import {Typography} from "@material-ui/core";
import Container from "@material-ui/core/Container";
import {useParams} from "react-router-dom";
import {EventClient, FlockEvent} from "../../clients/EventClient";

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
      <Grid container spacing={1}>
        {[...Array(10).keys()]
          .map((i) => i + 1)
          .map((i) => (
            <Grid key={`button-${person.uuid}-${i}`} item>
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
            </Grid>
          ))}
        <Grid item>
          <Fab onClick={deleteRating(person)}>X</Fab>
        </Grid>
      </Grid>
    );
  };

  if (!event || !ratings) return null;

  return (
    <Container maxWidth="md">
      <Typography variant="h3">{event.description}</Typography>
      {event.persons.map((person) => (
        <Grid
          key={`person-${person.uuid}`}
          container
          spacing={3}
          alignItems="center"
        >
          <Grid item xs>
            <Typography>
              {person.firstname} {person.lastname}
            </Typography>
          </Grid>
          <Grid item>{renderRow(person)}</Grid>
        </Grid>
      ))}
    </Container>
  );
}
