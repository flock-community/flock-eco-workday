import React from 'react'
import {withStyles} from '@material-ui/core'

import {HashRouter, Route} from "react-router-dom";
import HolidayFeature from "./HolidayFeature";
import UserFeature from "@flock-eco/feature-user/src/main/react/user/UserFeature";
import ApplicationLayout from "./ApplicationLayout";

const styles = theme => ({});

class Application extends React.Component {


  render() {
    return (<HashRouter>
      <div>
        <ApplicationLayout/>
        <Route path="/" exact component={HolidayFeature}/>
        <Route path="/users" exact component={UserFeature}/>
      </div>
    </HashRouter>)
  }
}

export default withStyles(styles)(Application)