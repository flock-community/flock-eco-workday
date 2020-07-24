import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import { Container } from "@material-ui/core";
import { TodoList } from "./TodoList";
import { updateStatus } from "./TodoService";

const useStyles = makeStyles({
  root: {
    padding: 20
  }
});

/**
 * @return {null}
 */
export function TodoFeature() {
  const classes = useStyles();

  const [refresh, setRefresh] = useState(false);

  const handleItemClick = (status, item) => {
    updateStatus(status, item).then(() => {
      setRefresh(!refresh);
    });
  };

  return (
    <Container className={classes.root}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TodoList onItemClick={handleItemClick} refresh={refresh} />
        </Grid>
      </Grid>
    </Container>
  );
}

TodoFeature.propTypes = {};
