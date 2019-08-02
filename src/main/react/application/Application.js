import React, {useEffect, useState} from 'react'

import {HashRouter, Route} from "react-router-dom";
import {HolidayFeature} from "../holiday/HolidayFeature";
import UserFeature from "@flock-eco/feature-user/src/main/react/user/UserFeature";
import {ApplicationLayout} from "./ApplicationLayout";
import {EventFeature} from "../event/EventFeature";
import {ApplicationDrawer} from "./ApplicationDrawer";

export const Application = () => {

  const [state, setState] = useState({
    openDrawer: false,
    loggedIn: null
  });

  useEffect(() => {
    fetch(`/login/status`)
      .then(res => res.json())
      .then(status => setState({
        ...state,
        loggedIn: status.loggedIn
      }))
  }, [])

  function handleDrawerClose() {
    setState({
      ...state,
      openDrawer: false,

    })
  }

  function handleDrawerOpen() {
    setState({
      ...state,
      openDrawer: true
    })
  }

  if(state.loggedIn != null && !state.loggedIn){
    return window.location.href = '/login'
  }
  return (<HashRouter>
    <div>
      <ApplicationDrawer open={state.openDrawer} onClose={handleDrawerClose}/>
      <ApplicationLayout onDrawer={handleDrawerOpen}/>
      <Route path="/holidays" exact component={HolidayFeature}/>
      <Route path="/events" exact component={EventFeature}/>
      <Route path="/users" exact component={UserFeature}/>
    </div>
  </HashRouter>)

}
