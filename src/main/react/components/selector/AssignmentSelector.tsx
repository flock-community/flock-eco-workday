import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import { AssignmentClient } from "../../clients/AssignmentClient";
import moment from "moment";

export type AssignmentSelectorProps = FormControlProps & {
  personId?: string;
  value?: string;
  onChange?: (selected: string) => void;
  label?: string;
  error?: string;
  from: moment.Moment;
  to: moment.Moment;
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
  const [items, setItems] = useState<any[]>();
  const [state, setState] = useState(value);

  useEffect(() => {
    if (!personId) return;

    AssignmentClient.findAllByPersonId(personId, "all").then((res) =>
      setItems(res)
    );
  }, []);

  useEffect(() => {
    setState(value);
  }, [value]);

  const assignmentInPeriod = (assignment) =>
    assignment.code === value ||
    (moment(assignment.from).isSameOrBefore(from) &&
      (!assignment.to || moment(assignment.to).isSameOrAfter(to)));

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
        {item.client.name} | {item.role} |{" "}
        {moment(item.from).format("DD-MM-YYYY")} -{" "}
        {item.to ? moment(item.to).format("DD-MM-YYYY") : "now"}
      </MenuItem>
    );
  }

  if (!items) return null;

  return (
    <FormControl {...props} error={!!error}>
      <InputLabel shrink>{label}</InputLabel>
      <Select value={state || ""} displayEmpty onChange={handleChange}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {items.filter(assignmentInPeriod).map(renderMenuItem)}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}
