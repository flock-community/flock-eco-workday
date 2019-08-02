import React, {useEffect, useState} from 'react'

import {HashRouter, Route} from "react-router-dom";
import {HolidayFeature} from "../holiday/HolidayFeature";
import UserFeature from "@flock-eco/feature-user/src/main/react/user/UserFeature";
import {ApplicationLayout} from "./ApplicationLayout";
import {EventFeature} from "../event/EventFeature";
import {ApplicationDrawer} from "./ApplicationDrawer";
import {ApplicationContext} from "./ApplicationContext";
import HolidayClient from "../holiday/HolidayClient";

export const Application = () => {

  const [state, setState] = useState({
    openDrawer: false,
    loggedIn: null,
    authorities: null,
  });


  useEffect(() => {
    fetch(`/login/status`)
      .then(res => res.json())
      .then(status => {
        return HolidayClient.getMe()
          .then(user => {
            setState({
              loggedIn: status.loggedIn,
              authorities: status.authorities,
              user,
            })
          })
          .catch(() => setState({
            loggedIn: status.loggedIn,
          }))
      });

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

  if (state.loggedIn != null && !state.loggedIn) {
    return window.location.href = '/login'
  }
  return (
    <ApplicationContext.Provider value={{authorities: state.authorities, user: state.user}}>
      <HashRouter>
        <div>
          <ApplicationDrawer open={state.openDrawer} onClose={handleDrawerClose}/>
          <ApplicationLayout onDrawer={handleDrawerOpen}/>
          <Route path="/holidays" exact component={HolidayFeature}/>
          <Route path="/events" exact component={EventFeature}/>
          <Route path="/users" exact component={UserFeature}/>
        </div>
      </HashRouter>
    </ApplicationContext.Provider>
  )

}
