import React, { useEffect, useState } from "react";
import { Card, Link, Typography } from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import CardHeader from "@material-ui/core/CardHeader";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { useHistory } from "react-router-dom";
import { TodoClient } from "../../clients/TodoClient";

// Components
import { StatusMenu } from "../../components/StatusMenu";

const typeToPath = (type) => {
  switch (type) {
    case "WORKDAY":
      return "workdays";
    case "SICKDAY":
      return "sickdays";
    case "PLUSDAY":
      return "holidays";
    case "HOLIDAY":
      return "holidays";
    case "EXPENSE":
      return "expenses";
    default:
      return null;
  }
};

type TodoListProps = {
  onItemClick: (status: string, item: any) => void;
  refresh: boolean;
};

export function TodoList({ onItemClick, refresh }: TodoListProps) {
  const history = useHistory();

  const [list, setList] = useState<any>();

  useEffect(() => {
    TodoClient.all().then((res) => {
      setList(res.body);
    });
  }, [refresh]);

  const handleStatusChange = (item) => (status) => {
    onItemClick(status, item);
  };

  const handleCardClick = (item) => () => {
    history.push(`/${typeToPath(item.type)}?personId=${item.personId}`);
  };

  function renderItem(item, key) {
    return (
      <Grid item xs={12} key={`todo-list-item-${key}`}>
        <Card>
          <CardHeader
            title={
              <Link onClick={handleCardClick(item)} color="textPrimary">
                {item.personName}
              </Link>
            }
            subheader={`${item.type}: ${item.description}`}
            action={
              <StatusMenu
                onChange={handleStatusChange(item)}
                disabled={false}
                value="REQUESTED"
              />
            }
          />
        </Card>
      </Grid>
    );
  }

  if (!list) {
    return <AlignedLoader />;
  }

  if (list.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography>Nothing todo</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Grid container spacing={1}>
      {list.map(renderItem)}
    </Grid>
  );
}
