import React from "react";
import { MenuItem, Select } from "@material-ui/core";
import { EventType } from "../../clients/EventClient";
import { EventTypeMapping } from "../../utils/mappings";

export function EventTypeSelect({ onChange, value }) {
  const renderSelectOption = (item: EventType) => {
    return (
      <MenuItem value={item} key={item}>
        {EventTypeMapping[item]}
      </MenuItem>
    );
  };

  const handleOnChange = (event) => {
    event.stopPropagation();
    onChange(event.target.value);
  };

  return (
    <Select
      fullWidth
      value={value}
      onChange={handleOnChange}
      label="Event type"
    >
      {[
        EventType.GENERAL_EVENT,
        EventType.FLOCK_HACK_DAY,
        EventType.FLOCK_COMMUNITY_DAY,
        EventType.CONFERENCE,
      ].map((eventType) => renderSelectOption(eventType))}
    </Select>
  );
}
