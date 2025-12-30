import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import { StatusMenu } from "./status/StatusMenu";

// types
import type { DayProps } from "../types";

const useStyles = makeStyles((theme: Theme) => ({
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
  value: DayProps;
  onClick: () => void;
  onClickStatus: (status: string) => void;
  hasAuthority: string;
};

export function DayListItem({
  value,
  onClick,
  onClickStatus,
  hasAuthority,
}: DayListItemProps) {
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
