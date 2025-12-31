import React, { useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import { Search } from "@workday-core/components/Search";

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
  const [state, setState] = useState<string>(search);

  const handleSearchChange = (search: string) => {
    setState(search);
    onSearchChange(search);
  };

  return (
    <Toolbar>
      <Box sx={{ flex: "0 0 auto" }}>
        <Typography variant="h6" id="tableTitle">
          Users
        </Typography>
      </Box>
      <Box sx={{ flex: "1 1 100%" }} />
      <Box sx={(theme) => ({ color: theme.palette.text.secondary })}>
        <Search value={state} onChange={handleSearchChange} />
      </Box>
      {onAdd && (
        <Box sx={(theme) => ({ color: theme.palette.text.secondary })}>
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
