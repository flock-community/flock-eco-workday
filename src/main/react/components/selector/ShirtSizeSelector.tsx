import React, {useState} from "react";
import PropTypes from "prop-types";
import {
  FormControl, FormControlProps,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";

type ShirtSizeSelectorProps = FormControlProps & {
  selectedItem: string;
  onChange: (shoeSize: string) => void;
  label?: string;
};

export function ShirtSizeSelector({ onChange, label, selectedItem }: ShirtSizeSelectorProps) {
  const [ selected, setSelected ] = useState(selectedItem);
  const shirtSizes: string[] = [ "XXXS", "XXS", "XS", "S", "M", "L", "XL", "XXL", "XXXL"];

  function handleChange(event) {
    // eslint-disable-next-line no-shadow
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
      <Select value={selected || ""} displayEmpty onChange={handleChange}>
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {shirtSizes.map(renderMenuItem)}
      </Select>
    </FormControl>
  );
  return ( <div>{selectInput}</div> );
}

ShirtSizeSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
  selectedItem: PropTypes.string
};

ShirtSizeSelector.defaultProps = {
  selectedItem: "",
  label: "Select shirt size"
}
