import React, { useState } from "react";
import Box from "@material-ui/core/Box";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Tooltip from "@material-ui/core/Tooltip";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import { Search } from "@workday-core/components/Search";

const useStyles = makeStyles((theme) =>
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
            <IconButton aria-label="Add" onClick={() => onAdd?.()}>
              <AddIcon />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Toolbar>
  );
}
