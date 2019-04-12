import React from 'react'
import {withStyles} from '@material-ui/core'

import ApplicationLayout from "./ApplicationLayout";

const styles = theme => ({})

class Application extends React.Component {

  render() {
    return (<React.Fragment>
      <ApplicationLayout/>
    </React.Fragment>)
  }
}

export default withStyles(styles)(Application)