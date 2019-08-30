import React, {useState} from 'react'
import {Grid, ListItemIcon, Typography} from "@material-ui/core";
import {Calendar, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import MenuList from "@material-ui/core/MenuList";

function CalendarFeature({value, onChange}) {

  const [state, setState] = useState({
    date: new Date(),
    days: [],
  })

  function handleDateChange(date) {
    setState({
      ...state,
      date: date,
    })
  }

  return (<Grid container spacing={1}>
    <Grid item xs={12} sm={6} md={4}>
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <Calendar
          fullWidth
          date={state.date}
          onChange={handleDateChange}/>
      </MuiPickersUtilsProvider>
    </Grid>
    <Grid item xs={12} sm={6} md={8}>
      <MenuList>
        <ListItemIcon>
          <Typography>Hello</Typography>
        </ListItemIcon>
      </MenuList>
    </Grid>
  </Grid>)
}

export default CalendarFeature
