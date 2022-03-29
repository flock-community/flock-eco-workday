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
import { PersonClient } from "../../clients/PersonClient";

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
  const [items, setItems] = useState<any>();
  const [state, setState] = useState<any>(value);

  useEffect(() => {
    PersonClient.findAllByPage({
      query: {
        active: true,
      },
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

  function renderString(it: any) {
    return `${it.firstname} ${it.lastname}`;
  }

  function renderValue(values: any) {
    if (values.length <= 3) {
      return values
        .map((uuid) => items.find((it) => it.uuid == uuid))
        .map(renderString)
        .join(", ");
    } else {
      return `${values.length} persons selected`;
    }
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.uuid}>
        {renderString(item)}
      </MenuItem>
    );
  }

  const selectInput = items && (
    <FormControl {...props}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        value={state || (multiple ? [] : "")}
        displayEmpty
        onChange={handleChange}
        renderValue={multiple ? renderValue : undefined}
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
