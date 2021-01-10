import React, { useState } from "react";

import Grid from "@material-ui/core/Grid";
import { Container } from "@material-ui/core";
import { TodoList } from "./TodoList";
import { updateStatus } from "./TodoService";

export function TodoFeature() {
  const [refresh, setRefresh] = useState(false);

  const handleItemClick = (status, item) => {
    updateStatus(status, item).then(() => {
      setRefresh(!refresh);
    });
  };

  return (
    <Container>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <TodoList onItemClick={handleItemClick} refresh={refresh} />
        </Grid>
      </Grid>
    </Container>
  );
}
