import React from 'react'
import {withStyles} from '@material-ui/core'

import ApplicationLayout from "./ApplicationLayout";

const styles = theme => ({});

class Application extends React.Component {
  state = {holidays: []};
  componentDidMount() {
    this.getHolidays()
  }

  getHolidays() {
    return fetch("/api/holidays", {method: "GET"}).then(resp => {
      return resp.json()
    }).then(holidays => {
      this.setState({holidays: holidays})
    });
  }

  putHoliday(holiday) {
    return fetch("/api/holidays", {method: "PUT", body: holiday}).then(resp => {
      return resp.json()
    });
  }

  postHoliday(holiday) {
    return fetch("/api/holidays", {method: "POST", body: JSON.stringify(holiday)}).then(resp => {
      return resp.json()
    });
  }

  deleteHoliday(holiday) {
    console.log(holiday);
    return fetch("/api/holidays/" + holiday.id, {method: "DELETE"}).then(resp => {
      return resp.json()
    })
  }

  render() {
    return (<div>
      <ApplicationLayout/>
      {this.state.holidays.map(
          holiday => {
            return (
              <div>
                <p>Id: {holiday.id}</p>
                <p>Van: {holiday.fromDate}</p>
                <p>Tot: {holiday.toDate}</p>
                <button key={holiday} onClick={() => this.deleteHoliday(holiday)}>Delete</button>
              </div>
            )
          })}
    </div>)
  }
}

export default withStyles(styles)(Application)