import React from "react";
import PropTypes from "prop-types";
import { Card, CardContent, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import UserAuthorityUtil from "@flock-community/flock-eco-feature-user/src/main/react/user_utils/UserAuthorityUtil";
import { StatusMenu } from "../../components/StatusMenu";

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

export function WorkDayListItem({
  value,
  onClick,
  onClickStatus,
  hasAuthority,
}) {
  const classes = useStyles();

  return (
    <Card onClick={onClick}>
      <CardContent className={classes.root}>
        <Typography variant="h6">
          {value.assignment.client.name} - {value.assignment.role}
        </Typography>
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

WorkDayListItem.propTypes = {
  value: PropTypes.object,
  onClick: PropTypes.func,
  onClickStatus: PropTypes.func,
  hasAuthority: PropTypes.string,
};
