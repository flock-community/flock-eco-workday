import React, {useEffect, useState} from "react";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import FormControl from "@material-ui/core/FormControl";
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient";

export function UserSelector({onChange}) {

  const [users, setUsers] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    UserClient.findAllUsers(0,100)
      .then(res => {
        setUsers(res.list)
        setSelected(res.list[0]);
      })
  }, [])

  useEffect(() => {
    onChange && onChange(selected)
  }, [selected])

  function handleChange(event) {
    setSelected(event.target.value);

  }

  function renderMenuItem(user) {
    return (<MenuItem value={user} key={user.code}>{user.name}</MenuItem>)
  }

  return (<Card>
      <CardContent>
        <FormControl fullWidth>
          <InputLabel>Select user</InputLabel>
          <Select value={selected || {}} onChange={handleChange}>
            {users && users.map(function (user) {
              return renderMenuItem(user)
            })}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )


}
