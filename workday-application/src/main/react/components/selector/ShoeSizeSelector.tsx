import {
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { useState } from 'react';

type ShoeSizeSelectorProps = FormControlProps & {
  selectedItem?: string;
  onChange: (shoeSize: string) => void;
  label?: string;
};

export function ShoeSizeSelector({
  onChange,
  label = 'Select shoe size',
  selectedItem = '',
}: ShoeSizeSelectorProps) {
  const [selected, setSelected] = useState(selectedItem);
  const shoeSizes: string[] = [
    '34,5',
    '35',
    '35,5',
    '36',
    '36,5',
    '37',
    '37,5',
    '38',
    '38,5',
    '39',
    '39,5',
    '40',
    '40,5',
    '41',
    '41,5',
    '42',
    '42,5',
    '43',
    '43,5',
    '44',
    '44,5',
    '45',
    '45,5',
    '46',
    '46,5',
    '47',
    '47,5',
    '48',
    '48,5',
    '49',
    '49,5',
    '50',
  ];

  function handleChange(event) {
    const selected = event.target.value;
    setSelected(selected);
    onChange(selected);
  }

  const renderMenuItem = (size, key) => (
    <MenuItem key={`shoe-size-selector-menu-item-${key}`} value={size}>
      {size}
    </MenuItem>
  );

  const selectInput = (
    <FormControl fullWidth>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        label={label}
        value={selected || ''}
        displayEmpty
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {shoeSizes.map(renderMenuItem)}
      </Select>
    </FormControl>
  );

  return <div>{selectInput}</div>;
}
