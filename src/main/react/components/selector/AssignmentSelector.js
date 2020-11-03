import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import { AssignmentClient } from "../../clients/AssignmentClient";

export function AssignmentSelector({
  personCode,
  value,
  onChange,
  label,
  error,
  from,
  to,
  ...props
}) {
  const [items, setItems] = useState([]);
  const [state, setState] = useState(value);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    AssignmentClient.findAllByPersonCode(personCode).then(res => setItems(res));
  }, []);

  useEffect(() => {
    setState(value);
  }, [value]);

  function assignmentInPeriod(assignment) {
    return (
      assignment.from.isBefore(to) &&
      (!assignment.to || assignment.to.isAfter(from))
    );
  }

  useEffect(() => {
    setAssignments(items.filter(assignmentInPeriod));
  }, [from, to, items]);

  function handleChange(event) {
    // eslint-disable-next-line no-shadow
    const selected = event.target.value;
    setState(selected);
    onChange(selected === "" ? null : selected);
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem
        key={`${AssignmentSelector.name}-selector-menu-item-${key}`}
        value={item.code}
      >
        {item.client.name} - {item.role}
      </MenuItem>
    );
  }

  return (
    <FormControl {...props} error={!!error}>
      <InputLabel shrink>{label}</InputLabel>
      <Select value={state || ""} displayEmpty onChange={handleChange}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {assignments.map(renderMenuItem)}
      </Select>
      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}

AssignmentSelector.propTypes = {
  personCode: PropTypes.string,
  error: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string
};
