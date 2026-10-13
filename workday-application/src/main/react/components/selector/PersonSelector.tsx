import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
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
  const [showInactive, setShowInactive] = useState(false);

  useEffect(() => {
    // Load inactive persons as well, so they can be shown on request and an
    // already selected inactive person still resolves to a name.
    PersonClient.findAllByPage({
      page: 0,
      size: 1000,
      sort: 'firstname',
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

  function isSelected(uuid: string) {
    return Array.isArray(state) ? state.includes(uuid) : state === uuid;
  }

  // Inactive persons are hidden unless requested, but a selected inactive
  // person stays in the list so the current value keeps being displayed.
  const options: Person[] = (items || []).filter(
    (it: Person) => showInactive || it.active || isSelected(it.uuid),
  );

  function renderString(it: any) {
    return `${it.firstname} ${it.lastname}`;
  }

  function renderOptionLabel(item: Person) {
    return (
      <>
        {renderString(item)}
        {!item.active && (
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            sx={{ ml: 1 }}
          >
            inactive
          </Typography>
        )}
      </>
    );
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

  function renderMenuItem(item: Person, key: number) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.uuid}>
        {renderOptionLabel(item)}
      </MenuItem>
    );
  }

  const singleInput = (
    <Autocomplete
      fullWidth
      size={props.size}
      options={options}
      getOptionLabel={renderString}
      renderOption={({ key, ...optionProps }, option) => (
        <li key={key} {...optionProps}>
          {renderOptionLabel(option)}
        </li>
      )}
      value={options.find((it) => it.uuid === state) ?? null}
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

  const multipleInput = (
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
        {options.map(renderMenuItem)}
      </Select>
    </FormControl>
  );

  const selectInput = items && (
    <Box
      sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}
    >
      <Box sx={{ flex: '1 1 240px', minWidth: 0 }}>
        {multiple ? multipleInput : singleInput}
      </Box>
      <Button
        size="small"
        onClick={() => setShowInactive((it) => !it)}
        sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
      >
        {showInactive ? 'Hide inactive persons' : 'Show inactive persons'}
      </Button>
    </Box>
  );

  return embedded ? (
    <div>{selectInput}</div>
  ) : (
    <Card>
      <CardContent>{selectInput}</CardContent>
    </Card>
  );
}
