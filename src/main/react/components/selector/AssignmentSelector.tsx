import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Assignment, AssignmentClient } from "../../clients/AssignmentClient";
import dayjs, { Dayjs } from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

export type AssignmentSelectorProps = FormControlProps & {
  personId?: string;
  value?: string;
  onChange?: (selected: string) => void;
  label?: string;
  error?: string;
  from: Dayjs;
  to: Dayjs;
};

export function AssignmentSelector({
  personId,
  value,
  onChange,
  label,
  error,
  from,
  to,
  ...props
}: AssignmentSelectorProps) {
  const [items, setItems] = useState<Assignment[]>([]);
  const [state, setState] = useState(value);

  useEffect(() => {
    console.log(
      "[AssignmentSelector] useEffect triggered. personId:",
      personId
    );
    if (!personId) {
      console.log("[AssignmentSelector] No personId, skipping fetch");
      return;
    }

    console.log(
      "[AssignmentSelector] Fetching assignments for personId:",
      personId
    );
    AssignmentClient.findAllByPersonId(personId, "all")
      .then((res) => {
        console.log("[AssignmentSelector] Received assignments:", res.list);
        setItems(res.list);
      })
      .catch((err) => {
        console.error("[AssignmentSelector] Error fetching assignments:", err);
      });
  }, [personId]);

  useEffect(() => {
    setState(value);
  }, [value]);

  const assignmentInPeriod = (assignment: Assignment) => {
    return (
      assignment.code === value ||
      (assignment.from.isSameOrBefore(from) &&
        (!assignment.to || assignment.to.isSameOrAfter(to, "day")))
    );
  };

  function handleChange(event) {
    const selected = event.target.value;
    setState(selected);
    onChange?.(selected === "" ? null : selected);
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem
        key={`${AssignmentSelector.name}-selector-menu-item-${key}`}
        value={item.code}
      >
        {item.client.name} | {item.role} | {item.from.format("DD-MM-YYYY")} -{" "}
        {item.to ? item.to.format("DD-MM-YYYY") : "now"}
      </MenuItem>
    );
  }

  return (
    <FormControl {...props} error={!!error}>
      <InputLabel id="assignment-select-label" shrink>
        {label}
      </InputLabel>
      <Select
        id="assignment-select"
        labelId="assignment-select-label"
        value={state || ""}
        displayEmpty
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {items.filter(assignmentInPeriod).map(renderMenuItem)}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
