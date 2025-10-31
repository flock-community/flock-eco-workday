import React from "react";
import PropTypes from "prop-types";
import { TableCell } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TableRow from "@material-ui/core/TableRow";
import { StatusMenu } from "../../components/status/StatusMenu";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import CreateIcon from "@material-ui/icons/Create";
import IconButton from "@material-ui/core/IconButton";

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
    <TableRow>
      <TableCell>{value.assignment.client.name}</TableCell>
      <TableCell>{value.assignment.role}</TableCell>
      <TableCell>{value.from.format("DD-MM-YYYY")}</TableCell>
      <TableCell>{value.to.format("DD-MM-YYYY")}</TableCell>
      <TableCell align="right">
        {value.to.diff(value.from, "days") + 1}
      </TableCell>
      <TableCell align="right">{value.hours}</TableCell>
      <TableCell>
        <StatusMenu
          onChange={onClickStatus}
          disabled={!UserAuthorityUtil.hasAuthority(hasAuthority)}
          value={value.status}
        />
      </TableCell>
      <TableCell>
        <IconButton onClick={onClick}>
          <CreateIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

WorkDayListItem.propTypes = {
  value: PropTypes.object,
  onClick: PropTypes.func,
  onClickStatus: PropTypes.func,
  hasAuthority: PropTypes.string,
};
