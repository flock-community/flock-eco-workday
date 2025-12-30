import React, { useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { Theme } from "@mui/material/styles";
import { Search } from "@workday-core/components/Search";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      paddingRight: theme.spacing(1),
    },
    spacer: {
      flex: "1 1 100%",
    },
    actions: {
      color: theme.palette.text.secondary,
    },
    title: {
      flex: "0 0 auto",
    },
  })
);

type UserToolbarProps = {
  search?: string;
  onAdd?: () => void;
  onSearchChange?: (search: string) => void;
};

export function UserToolbar({
  search,
  onAdd,
  onSearchChange,
}: UserToolbarProps) {
  const classes = useStyles();

  const [state, setState] = useState<string>(search);

  const handleSearchChange = (search: string) => {
    setState(search);
    onSearchChange(search);
  };

  return (
    <Toolbar>
      <Box className={classes.title}>
        <Typography variant="h6" id="tableTitle">
          Users
        </Typography>
      </Box>
      <Box className={classes.spacer} />
      <Box className={classes.actions}>
        <Search value={state} onChange={handleSearchChange} />
      </Box>
      {onAdd && (
        <Box className={classes.actions}>
          <Tooltip title="Add">
            <IconButton aria-label="Add" onClick={() => onAdd?.()} size="large">
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Toolbar>
  );
}
