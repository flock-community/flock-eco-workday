import React from "react";
import {Card, CardContent, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import {StatusMenu} from "./StatusMenu";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
  },
  status: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

type DayListItemProps = {
  value: any,
  onClick: () => void,
  onClickStatus: (status: string) => void,
  hasAuthority: string,
};

export function DayListItem({value, onClick, onClickStatus, hasAuthority}: DayListItemProps) {

  const classes = useStyles();

  return (
    <Card onClick={onClick}>
      <CardContent className={classes.root}>
        <Typography variant="h6">
          {value.description ? value.description : "empty"}
        </Typography>
        {value.type && <Typography>Type: {value.type}</Typography>}
        <Typography>
          Period: {value.from.format("DD-MM-YYYY")} -{" "}
          {value.to.format("DD-MM-YYYY")}
        </Typography>
        <Typography>
          Aantal dagen: {value.to.diff(value.from, "days") + 1}
        </Typography>
        <Typography>Aantal uren: {value.hours}</Typography>
        <div className={classes.status}>
          <StatusMenu
            onChange={onClickStatus}
            disabled={!UserAuthorityUtil.hasAuthority(hasAuthority)}
            value={value.status}
          />
        </div>
      </CardContent>
    </Card>
  );
}

