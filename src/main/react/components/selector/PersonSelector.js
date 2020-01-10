import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core"
import {PersonService} from "../../features/person/PersonService"

export function PersonSelector(props) {
  const {onChange, label, selectedItem} = props
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState("")

  useEffect(() => {
    PersonService.getAll().then(res => setItems(res))
    setSelected(selectedItem)
  }, [])

  function handleChange(event) {
    // eslint-disable-next-line no-shadow
    const selected = event.target.value
    setSelected(selected)
    onChange(selected)
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.code}>
        {item.firstname} {item.lastname}
      </MenuItem>
    )
  }

  return (
    <Card>
      <CardContent>
        <FormControl fullWidth>
          <InputLabel shrink>{label}</InputLabel>
          <Select value={selected} displayEmpty onChange={handleChange}>
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {items.map(renderMenuItem)}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

PersonSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  selectedItem: PropTypes.string,
}

PersonSelector.defaultProps = {
  selectedItem: "",
  label: "Select Person",
}
