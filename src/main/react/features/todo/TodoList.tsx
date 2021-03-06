import React, { useEffect, useState } from "react";
import { Card, Link, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CardContent from "@material-ui/core/CardContent";
import Grid from "@material-ui/core/Grid";
import CardHeader from "@material-ui/core/CardHeader";
import Button from "@material-ui/core/Button";
import PropTypes from "prop-types";
import { AlignedLoader } from "@flock-community/flock-eco-core/src/main/react/components/AlignedLoader";
import { useHistory } from "react-router-dom";
import { TodoClient } from "../../clients/TodoClient";

const useStyles = makeStyles((theme) => ({
  buttonDefault: {
    backgroundColor: "unset",
  },
  buttonRequested: {
    backgroundColor: "unset",
  },
  buttonApproved: {
    backgroundColor: theme.palette.success[500],
  },
  buttonRejected: {
    backgroundColor: theme.palette.error[500],
  },
}));

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
  const classes = useStyles();
  const history = useHistory();

  const [list, setList] = useState<any>();

  useEffect(() => {
    TodoClient.all().then((res) => {
      setList(res.body);
    });
  }, [refresh]);

  const handleApproveClick = (item) => (e) => {
    onItemClick("APPROVED", item);
    e.stopPropagation();
  };
  const handleRejectClick = (item) => (e) => {
    onItemClick("REJECTED", item);
    e.stopPropagation();
  };
  const handleCardClick = (item) => () => {
    history.push(`/${typeToPath(item.type)}?personId=${item.personId}`);
  };

  function renderAction(item) {
    return (
      <Grid container spacing={1}>
        <Grid item xs>
          <Button
            className={classes.buttonRejected}
            onClick={handleRejectClick(item)}
          >
            Reject
          </Button>
        </Grid>
        <Grid item xs>
          <Button
            className={classes.buttonApproved}
            onClick={handleApproveClick(item)}
          >
            Approve
          </Button>
        </Grid>
      </Grid>
    );
  }

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
            action={renderAction(item)}
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
