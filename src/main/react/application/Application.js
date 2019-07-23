import React, {useState} from 'react'

import {HashRouter, Route, withRouter} from "react-router-dom";
import {HolidayFeature} from "../holiday/HolidayFeature";
import UserFeature from "@flock-eco/feature-user/src/main/react/user/UserFeature";
import {ApplicationLayout} from "./ApplicationLayout";
import {EventFeature} from "../event/EventFeature";
import {ApplicationDrawer} from "./ApplicationDrawer";

export const Application = () => {

  const [state, setState] = useState({openDrawer: true});

  function handleDrawerClose() {
    setState({
      openDrawer: false
    })
  }

  function handleDrawerOpen() {
    setState({
      openDrawer: true
    })
  }

  return (<HashRouter>
    <div>
      <ApplicationDrawer open={state.openDrawer} onClose={handleDrawerClose} />
      <ApplicationLayout onDrawer={handleDrawerOpen} />
      <Route path="/holidays" exact component={HolidayFeature}/>
      <Route path="/events" exact component={EventFeature}/>
      <Route path="/users" exact component={UserFeature}/>
    </div>
  </HashRouter>)

}
