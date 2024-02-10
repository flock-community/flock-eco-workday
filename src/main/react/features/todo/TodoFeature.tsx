import React, { useState } from "react";
import { TodoList } from "./TodoList";
import { updateStatus } from "./TodoService";
import { Box, Card, CardHeader } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";

// Types
import { StatusProps } from "../../types";
import { Todo } from "../../wirespec/Openapispec";

export function TodoFeature() {
  const [refresh, setRefresh] = useState(false);

  const handleItemClick = (status: StatusProps, item: Todo) => {
    updateStatus(status, item).then(() => {
      setRefresh(!refresh);
    });
  };

  return (
    <Box
      className={"flow"}
      flow-gap={"wide"}
      style={{ paddingBottom: "1.5rem" }}
    >
      <Card>
        <CardHeader title="Todo's" />
        <CardContent>
          <TodoList onItemClick={handleItemClick} refresh={refresh} />
        </CardContent>
      </Card>
    </Box>
  );
}
