import React from "react";
import { styled } from "@mui/material/styles";
import { TableCell } from "@mui/material";
import { Theme } from "@mui/material/styles";
import TableRow from "@mui/material/TableRow";
import { StatusMenu } from "../../components/status/StatusMenu";
import UserAuthorityUtil from "@workday-user/user_utils/UserAuthorityUtil";
import CreateIcon from "@mui/icons-material/Create";
import IconButton from "@mui/material/IconButton";

const PREFIX = "WorkDayListItem";

const classes = {
  root: `${PREFIX}-root`,
  status: `${PREFIX}-status`,
};

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [`& .${classes.root}`]: {
    position: "relative",
  },

  [`& .${classes.status}`]: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

type WorkDayListItemProps = {
  value: any;
  onClick: () => void;
  onClickStatus: (status: string) => void;
  hasAuthority: string;
};

export function WorkDayListItem({
  value,
  onClick,
  onClickStatus,
  hasAuthority,
}: WorkDayListItemProps) {
  return (
    <StyledTableRow>
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
    </StyledTableRow>
  );
}
