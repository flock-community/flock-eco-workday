import {
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import FormHelperText from '@mui/material/FormHelperText';
import dayjs, { type Dayjs } from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useEffect, useState } from 'react';
import {
  type Assignment,
  AssignmentClient,
} from '../../clients/AssignmentClient';

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
  const [items, setItems] = useState<Assignment[]>();
  const [state, setState] = useState(value);

  useEffect(() => {
    if (!personId) return;

    AssignmentClient.findAllByPersonId(personId, 'all').then((res) =>
      setItems(res.list),
    );
  }, [personId]);

  useEffect(() => {
    setState(value);
  }, [value]);

  const assignmentInPeriod = (assignment: Assignment) => {
    return (
      assignment.code === value ||
      (assignment.from.isSameOrBefore(from) &&
        (!assignment.to || assignment.to.isSameOrAfter(to, 'day')))
    );
  };

  function handleChange(event) {
    const selected = event.target.value;
    setState(selected);
    onChange?.(selected === '' ? null : selected);
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem
        key={`${AssignmentSelector.name}-selector-menu-item-${key}`}
        value={item.code}
      >
        {item.client.name} | {item.role} | {item.from.format('DD-MM-YYYY')} -{' '}
        {item.to ? item.to.format('DD-MM-YYYY') : 'now'}
      </MenuItem>
    );
  }

  if (!items) return null;

  return (
    <FormControl fullWidth {...props} error={!!error}>
      <InputLabel id="assignment-select-label">{label}</InputLabel>
      <Select
        label={label}
        id="assignment-select"
        labelId="assignment-select-label"
        value={state || ''}
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
