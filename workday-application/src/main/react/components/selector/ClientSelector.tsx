import {
  Card,
  CardContent,
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import { useEffect, useState } from 'react';
import { type Client, ClientClient } from '../../clients/ClientClient';

type ClientSelectorProps = FormControlProps & {
  value?: string;
  onChange: (selected: any) => void;
  label?: string;
  embedded?: boolean;
  multiple?: boolean;
  error?: string;
};

export function ClientSelector({
  value = '',
  onChange,
  embedded,
  label = 'Select Client',
  error,
  ...props
}: ClientSelectorProps) {
  const [items, setItems] = useState<Client[]>([]);
  const [state, setState] = useState(value);

  useEffect(() => {
    ClientClient.findAllByPage({ page: 0, size: 100, sort: 'name,asc' }).then(
      (res) => setItems(res.list),
    );
  }, []);

  useEffect(() => {
    setState(value);
  }, [value]);

  function handleChange(event) {
    const selected = event.target.value;
    setState(selected);
    onChange(selected === '' ? null : selected);
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.code}>
        {item.name}
      </MenuItem>
    );
  }

  const selectInput = (
    <FormControl fullWidth {...props} error={!!error}>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        value={state || ''}
        displayEmpty={true}
        onChange={handleChange}
      >
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
