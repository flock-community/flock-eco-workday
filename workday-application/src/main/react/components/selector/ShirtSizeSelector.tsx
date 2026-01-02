import {
  FormControl,
  type FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from '@mui/material';
import { useState } from 'react';

type ShirtSizeSelectorProps = FormControlProps & {
  selectedItem?: string;
  onChange: (shoeSize: string) => void;
  label?: string;
};

export function ShirtSizeSelector({
  onChange,
  label = 'Select shirt size',
  selectedItem = '',
}: ShirtSizeSelectorProps) {
  const [selected, setSelected] = useState(selectedItem);
  const shirtSizes: string[] = [
    'XXXS',
    'XXS',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    'XXXL',
  ];

  function handleChange(event) {
    const selected = event.target.value;
    setSelected(selected);
    onChange(selected);
  }

  const renderMenuItem = (size, key) => (
    <MenuItem key={`shirt-size-selector-menu-item-${key}`} value={size}>
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
        {shirtSizes.map(renderMenuItem)}
      </Select>
    </FormControl>
  );
  return <div>{selectInput}</div>;
}
