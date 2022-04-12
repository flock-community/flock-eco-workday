import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Client, ClientClient } from "../../clients/ClientClient";

type ClientSelectorProps = FormControlProps & {
  value?: string;
  onChange: (selected: any) => void;
  label?: string;
  embedded?: boolean;
  multiple?: boolean;
  error?: string;
};

export function ClientSelector({
  value,
  onChange,
  embedded,
  label,
  error,
  ...props
}: ClientSelectorProps) {
  const [items, setItems] = useState<Client[]>([]);
  const [state, setState] = useState(value);

  useEffect(() => {
    ClientClient.all().then((res) => setItems(res));
  }, []);

  useEffect(() => {
    setState(value);
  }, [value]);

  function handleChange(event) {
    // eslint-disable-next-line no-shadow
    const selected = event.target.value;
    setState(selected);
    onChange(selected === "" ? null : selected);
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.code}>
        {item.name}
      </MenuItem>
    );
  }

  const selectInput = (
    <FormControl {...props} error={!!error}>
      <InputLabel shrink>{label}</InputLabel>
      <Select value={state || ""} displayEmpty onChange={handleChange}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {items.map(renderMenuItem)}
      </Select>
      <FormHelperText>{error}</FormHelperText>
    </FormControl>
  );

  return embedded ? (
    selectInput
  ) : (
    <Card>
      <CardContent>{selectInput}</CardContent>
    </Card>
  );
}

ClientSelector.propTypes = {
  error: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  embedded: PropTypes.bool,
};

ClientSelector.defaultProps = {
  value: "",
  label: "Select Client",
};
