import {
  Autocomplete,
  Card,
  CardContent,
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { type Person, PersonClient } from '../../clients/PersonClient';

export type PersonSelectorProps = FormControlProps & {
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
    PersonClient.queryByPage(
      {
        page: 0,
        size: 100,
        sort: 'firstname',
      },
      {
        active: true,
      },
    ).then((res) => setItems(res.list));
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
    if (!items) return '';
    if (values.length <= 3) {
      return values
        .map((uuid) => items.find((it) => it.uuid === uuid))
        .filter(Boolean)
        .map(renderString)
        .join(', ');
    } else {
      return `${values.length} persons selected`;
    }
  }

  function renderMenuItem(item: Person, key: string) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.uuid}>
        {renderString(item)}
      </MenuItem>
    );
  }

  const singleInput = items && (
    <Autocomplete
      fullWidth
      size={props.size}
      options={items}
      getOptionLabel={renderString}
      value={items.find((it) => it.uuid === state) ?? null}
      isOptionEqualToValue={(option, selected) => option.uuid === selected.uuid}
      onChange={(_event, option) => {
        const uuid = option?.uuid ?? '';
        setState(uuid);
        onChange(uuid);
      }}
      renderInput={(params) => (
        <TextField {...params} label={label} placeholder="Search person" />
      )}
    />
  );

  const multipleInput = items && (
    <FormControl fullWidth {...props}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        value={state || []}
        onChange={handleChange}
        displayEmpty
        renderValue={renderValue}
        multiple
      >
        {(items || []).map(renderMenuItem)}
      </Select>
    </FormControl>
  );

  const selectInput = multiple ? multipleInput : singleInput;

  return embedded ? (
    <div>{selectInput}</div>
  ) : (
    <Card>
      <CardContent>{selectInput}</CardContent>
    </Card>
  );
}
