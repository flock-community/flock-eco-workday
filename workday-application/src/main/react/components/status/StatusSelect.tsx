import MenuItem from "@mui/material/MenuItem";
import React from "react";
import Select from "@mui/material/Select";
import {
  allStatusTransitions,
  canChangeStatus,
  filterTransitionsFromByStatus,
} from "./StatusMethods";
import FormControl from "@mui/material/FormControl";
import { InputLabel } from "@mui/material";

const statusTransitions = [
  { from: "REQUESTED", to: "REQUESTED" },
  { from: "APPROVED", to: "APPROVED" },
  { from: "REJECTED", to: "REJECTED" },
  { from: "DONE", to: "DONE" },
  ...allStatusTransitions,
];

export function StatusSelect({ onChange, value }) {
  const currentStateOptions = filterTransitionsFromByStatus(
    value,
    statusTransitions
  );

  const renderMenuItem = (item) => {
    return (
      <MenuItem value={item} key={item}>
        {item}
      </MenuItem>
    );
  };

  const handleOnChange = (event) => {
    event.stopPropagation();
    const newValue = event.target.value;

    if (canChangeStatus(value, newValue, statusTransitions)) {
      onChange(newValue);
    }
  };

  return (
    <>
      {currentStateOptions && currentStateOptions.length > 0 && (
        <FormControl fullWidth>
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select label="Status" value={value} onChange={handleOnChange}>
            {(currentStateOptions || []).map((it) => renderMenuItem(it))}
          </Select>
        </FormControl>
      )}
    </>
  );
}
