import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core"
import {PersonService} from "../../features/person/PersonService"

export function PersonSelector({value, onChange, label, embedded, multiple}) {
  const [items, setItems] = useState([])
  const [state, setState] = useState(value)

  useEffect(() => {
    PersonService.findAllByPage({page: 0, size: 100, sort: "lastname"}).then(res =>
      setItems(res.list)
    )
  }, [])

  useEffect(() => {
    setState(value)
  }, [value])

  function handleChange(event) {
    // eslint-disable-next-line no-shadow
    const selected = event.target.value
    setState(selected)
    onChange(selected)
  }

  function renderMenuItem(item, key) {
    return (
      <MenuItem key={`person-selector-menu-item-${key}`} value={item.code}>
        {`${item.firstname} ${item.lastname}`}
      </MenuItem>
    )
  }

  const selectInput = (
    <FormControl fullWidth>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        value={state || ""}
        displayEmpty
        onChange={handleChange}
        multiple={multiple}
      >
        {!multiple && (
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
        )}
        {items.map(renderMenuItem)}
      </Select>
    </FormControl>
  )

  return embedded ? (
    <div>{selectInput}</div>
  ) : (
    <Card>
      <CardContent>{selectInput}</CardContent>
    </Card>
  )
}

PersonSelector.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  embedded: PropTypes.bool,
  multiple: PropTypes.bool,
}

PersonSelector.defaultProps = {
  value: "",
  label: "Select Person",
}
