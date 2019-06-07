import React from 'react'
import {withStyles} from '@material-ui/core'

import ApplicationLayout from "./ApplicationLayout";

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import {DatePicker, MuiPickersUtilsProvider} from 'material-ui-pickers';

import TextField from '@material-ui/core/TextField';

import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';

import moment from 'moment';
import MomentUtils from '@date-io/moment';
import Textarea from "@material-ui/core/es/InputBase/Textarea";

const styles = theme => ({});

class HolidayFeature extends React.Component {
  state = {holidays: []};

  componentDidMount() {
    this.getHolidays();
    this.getRemainingHolidays();
    // this.handleDateChange = this.handleDateChange.bind(this);
  }

  getUrl(url, userId) {
    var urlIncludingUser = new URL("http://localhost:3000" + url);
    var params = {userId: userId};
    Object.keys(params).forEach(key => urlIncludingUser.searchParams.append(key, params[key]));
    return urlIncludingUser
  }

  getHolidays() {
    return fetch("/api/holidays", {method: "GET"})
        .then(response => {
          return response.json()
        }).then(holidays => this.updateHolidays(holidays))
  }

  putHoliday(holiday) {
    return fetch(`/api/holidays/${holiday.id}`, {
      method: "PUT", body: JSON.stringify(holiday),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(resp => {
      return this.getHolidays()
    })
  }

  postHoliday(holiday) {
    return fetch("/api/holidays", {
      method: "POST", body: JSON.stringify(holiday), headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }).then(resp => {
      return this.getHolidays()
    })
  }

  deleteHoliday(holiday) {
    return fetch("/api/holidays/" + holiday.id, {method: "DELETE"}).then(resp => {
      return this.getHolidays()
    })
  }

  getRemainingHolidays() {
    return fetch("/api/holidays/remaining", {method: "GET"})
        .then(response => {
          return response.json()
        }).then(remaining => console.log(remaining))
  }

  updateHolidays(holidays) {
    this.setState({holidays: holidays});
  }

  handleNameChange(event, holiday) {
    holiday.name = event.target.value;
    this.putHoliday(holiday)
  }

  handleFromDateChange(date, holiday) {
    holiday.fromDate = this.parseDate(date);
    this.putHoliday(holiday)
  }

  handleToDateChange(date, holiday) {
    holiday.toDate = this.parseDate(date);
    this.putHoliday(holiday);
  }

  parseDate(date) {
    return date.format("YYYY-MM-DD")
  }

  addHoliday() {
    this.postHoliday(
        {
          id: 0,
          name: "New Holiday",
          fromDate: this.parseDate(moment()),
          toDate: this.parseDate(moment())
        }
    )
  }

  render(props) {
    return (<div>
      <Fab color="primary" style={{
        position: 'absolute',
        bottom: "25px",
        right: "25px"
      }} onClick={() => this.addHoliday()}>
        <AddIcon/>
      </Fab>
      {this.state.holidays.map(
          holiday => {
            return (
                <Card style={{
                  margin: "10px"
                }}>
                  <CardContent>
                    <MuiPickersUtilsProvider utils={MomentUtils}>
                      <TextField label="Username" type="text" value={holiday.user.name}></TextField>
                      <TextField label="Title" type="text" value={holiday.name}
                                 onChange={(event) => this.handleNameChange(event, holiday)}/>
                      <DatePicker label="From" value={holiday.fromDate} autoOk format={"DD-MM-YYYY"}
                                  onChange={(date) => this.handleFromDateChange(date, holiday)}/>
                      <DatePicker label="To" value={holiday.toDate} autoOk format={"DD-MM-YYYY"}
                                  onChange={(date) => this.handleToDateChange(date, holiday, holiday.toDate)}/>
                      <Fab style={{float: "right"}} color="secondary" key={holiday}
                           onClick={() => this.deleteHoliday(holiday)}>
                        <DeleteIcon/>
                      </Fab>
                    </MuiPickersUtilsProvider>
                  </CardContent>
                </Card>
            )
          })}
    </div>)
  }
}

export default withStyles(styles)(HolidayFeature)