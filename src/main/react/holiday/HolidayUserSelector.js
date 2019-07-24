import React, {useEffect, useState} from "react";
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import {Card} from "@material-ui/core";
import CardContent from "@material-ui/core/CardContent";
import FormControl from "@material-ui/core/FormControl";

export function HolidayUserSelector({users, onChange}) {

  const [selected, setSelected] = useState(null);

  useEffect(() => {
    onChange && onChange(selected)
  }, [selected])

  useEffect(() => {
    setSelected(users[0]);
  }, [users])

  function handleChange(event) {
    setSelected(event.target.value);

  }


  function renderMenuItem(user) {
    return (<MenuItem value={user} key={user.code}>{user.name}</MenuItem>)
  }

  return (<Card>
      <CardContent>
        <FormControl fullWidth>
          <InputLabel>Select Flocker</InputLabel>
          <Select value={selected || {}} onChange={handleChange}>
            {users.map(function (user) {
              return renderMenuItem(user)
            })}
          </Select>
        </FormControl>
      </CardContent>
    </Card>
  )


}
