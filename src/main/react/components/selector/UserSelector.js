import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient"
import {
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@material-ui/core"

export function UserSelector(props) {
  const {onChange, label, selectedItem} = props
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState("")

  useEffect(() => {
    UserClient.findAllUsers("", 0, 100).then(res => setUsers(res.list))
    setSelected(selectedItem)
  }, [])

  function handleChange(event) {
    // eslint-disable-next-line no-shadow
    const selected = event.target.value
    setSelected(selected)
    onChange(selected)
  }

  function renderMenuItem(user, key) {
    return (
      <MenuItem key={`user-selector-menu-item-${key}`} value={user.code}>
        {user.name}
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
            {users.map(renderMenuItem)}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

UserSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string,
  selectedItem: PropTypes.string,
}

UserSelector.defaultProps = {
  selectedItem: "",
  label: "Select User",
}
