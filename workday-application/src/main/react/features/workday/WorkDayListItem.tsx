import React from "react";
import PropTypes from "prop-types";
import { TableCell } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import TableRow from "@mui/material/TableRow";
import { StatusMenu } from "../../components/status/StatusMenu";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import CreateIcon from "@mui/icons-material/Create";
import IconButton from "@mui/material/IconButton";

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
        <IconButton onClick={onClick} size="large">
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
