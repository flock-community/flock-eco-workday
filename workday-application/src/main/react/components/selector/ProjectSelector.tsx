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
import { type Project, ProjectClient } from '../../clients/ProjectClient';

type ProjectSelectorProps = FormControlProps & {
  value?: string;
  onChange: (selected: any) => void;
  label: string;
  embedded?: boolean;
  multiple?: boolean;
  error?: string;
  refresh?: boolean;
  onRefresh: (promise: Promise<void>) => void;
};

export function ProjectSelector({
  value = '',
  onChange,
  embedded,
  label = 'Select Project',
  error,
  refresh,
  onRefresh,
  ...props
}: ProjectSelectorProps) {
  const [items, setItems] = useState<Project[]>([]);
  const [state, setState] = useState(value);

  useEffect(() => {
    const itemPromise = ProjectClient.all().then((res) => {
      setItems(res);
    });
    onRefresh(itemPromise);
  }, [onRefresh]);

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
      <MenuItem key={`project-selector-menu-item-${key}`} value={item.code}>
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
        displayEmpty
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
