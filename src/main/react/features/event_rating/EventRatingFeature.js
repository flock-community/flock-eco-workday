import React, { useEffect, useState } from "react";

import Fab from "@material-ui/core/Fab";
import Grid from "@material-ui/core/Grid";
import { Typography } from "@material-ui/core";
import Container from "@material-ui/core/Container";
import PropTypes from "prop-types";
import { EventClient } from "../../clients/EventClient";

/**
 * @return {null}
 */
export function EventRatingFeature({ match }) {
  const { eventCode } = match.params;

  const [event, setEvent] = useState(null);
  const [ratings, setRatings] = useState(null);

  useEffect(() => {
    EventClient.get(eventCode).then(res => setEvent(res));
    EventClient.getRatings(eventCode).then(res => setRatings(res));
  }, []);

  const updateRating = (person, rating) => () => {
    EventClient.postRatings(eventCode, {
      eventCode,
      personCode: person.code,
      rating
    }).then(() => {
      EventClient.getRatings(eventCode).then(res => setRatings(res));
    });
  };

  const deleteRating = person => () => {
    EventClient.deleteRatings(eventCode, person.code).then(() => {
      EventClient.getRatings(eventCode).then(res => setRatings(res));
    });
  };

  const renderRow = person => {
    const eventRating = ratings.find(
      rating => rating.person.code === person.code
    );
    return (
      <Grid container spacing={1}>
        {[...Array(10).keys()]
          .map(i => i + 1)
          .map(i => (
            <Grid key={`button-${person.code}-${i}`} item>
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
          <Fab color="red" onClick={deleteRating(person)}>
            X
          </Fab>
        </Grid>
      </Grid>
    );
  };

  if (!event || !ratings) return null;

  return (
    <Container maxWidth="md">
      <Typography variant="h3">{event.description}</Typography>
      {event.persons.map(person => (
        <Grid
          key={`person-${person.code}`}
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

EventRatingFeature.propTypes = {
  match: PropTypes.object
};
