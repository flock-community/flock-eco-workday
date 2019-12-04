import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import Select from "@material-ui/core/Select"
import MenuItem from "@material-ui/core/MenuItem"
import InputLabel from "@material-ui/core/InputLabel"
import {Card} from "@material-ui/core"
import CardContent from "@material-ui/core/CardContent"
import FormControl from "@material-ui/core/FormControl"
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient"

export function UserSelector(props) {
  const {defaultUser, onChange} = props
  const [users, setUsers] = useState([])
  const [selected, setSelected] = useState({})

  useEffect(() => {
    UserClient.findAllUsers("", 0, 100).then(res => {
      console.log(res)
      setUsers(res.list)
      setSelected(res.list[0])
    })
  }, [])

  function handleChange(event) {
    setSelected(event.target.value)
    if (onChange) onChange(selected)
  }

  function renderMenuItem(user) {
    return (
      <MenuItem value={user} key={user.code}>
        {user.name}
      </MenuItem>
    )
  }

  return (
    <Card>
      <CardContent>
        <FormControl fullWidth>
          <InputLabel>Select user</InputLabel>
          <Select value={selected || {}} onChange={handleChange}>
            {users &&
              users.map(user => {
                return renderMenuItem(user)
              })}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )
}

UserSelector.propTypes = {
  onChange: PropTypes.func,
}
