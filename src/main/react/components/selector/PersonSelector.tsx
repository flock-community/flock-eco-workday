import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  FormControl,
  FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import { PersonService } from "../../features/person/PersonService";

type PersonSelectorProps = FormControlProps & {
  value?: string;
  onChange: (selected: any) => void;
  label?: string;
  embedded?: boolean;
  multiple?: boolean;
};

export function PersonSelector({
  value,
  onChange,
  label,
  embedded,
  multiple,
  ...props
}: PersonSelectorProps) {
  const [items, setItems] = useState();
  const [state, setState] = useState(value);

  useEffect(() => {
    PersonService.findAllByPage({
      page: 0,
      size: 100,
      sort: "lastname",
    }).then((res) => setItems(res.list));
  }, []);

  useEffect(() => {
    setState(value);
  }, [value]);

  function handleChange(event) {
    const selected = event.target.value;
    setState(selected);
    onChange(selected);
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.uuid}>
        {`${item.firstname} ${item.lastname}`}
      </MenuItem>
    );
  }

  const selectInput = items && (
    <FormControl {...props}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        value={state || ""}
        displayEmpty
        onChange={handleChange}
        multiple={multiple}
      >
        {!multiple && (
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
        )}
        {(items || []).map(renderMenuItem)}
      </Select>
    </FormControl>
  );

  return embedded ? (
    <div>{selectInput}</div>
  ) : (
    <Card>
      <CardContent>{selectInput}</CardContent>
    </Card>
  );
}
