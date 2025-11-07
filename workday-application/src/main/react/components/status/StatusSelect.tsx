import MenuItem from "@material-ui/core/MenuItem";
import React from "react";
import Select from "@material-ui/core/Select";
import {
  allStatusTransitions,
  canChangeStatus,
  filterTransitionsFromByStatus,
} from "./StatusMethods";

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
        <Select fullWidth value={value} onChange={handleOnChange}>
          {(currentStateOptions || []).map((it) => renderMenuItem(it))}
        </Select>
      )}
    </>
  );
}
