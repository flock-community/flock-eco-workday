import React, {useEffect, useState} from 'react'

import {HashRouter, Route} from "react-router-dom";
import {HolidayFeature} from "../features/holiday/HolidayFeature";
import {UserFeature} from "@flock-eco/feature-user/src/main/react/user/UserFeature";
import {ApplicationLayout} from "./ApplicationLayout";
import {ApplicationDrawer} from "./ApplicationDrawer";
import {ApplicationContext} from "./ApplicationContext";
import {HomeFeature} from "../features/home/HomeFeature";
import {ClientFeature} from "../features/client/ClientFeature";
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient";
import {AssignmentFeature} from "../features/assignments/AssignmentFeature";

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
        if (status.loggedIn) {
          UserClient.findUserByCode('me')
            .then(user => {
              setState({
                loggedIn: status.loggedIn,
                authorities: status.authorities,
                user,
              })
            })
            .catch(err => {
              console.log('Cannot connect to service')
            })
        } else {
          setState({
            loggedIn: status.loggedIn,
          })
        }
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
          <Route path="/" exact component={HomeFeature}/>
          <Route path="/clients" exact component={ClientFeature}/>
          <Route path="/assignments" exact component={AssignmentFeature}/>
          <Route path="/holidays" exact component={HolidayFeature}/>
          <Route path="/users" exact component={UserFeature}/>
        </div>
      </HashRouter>
    </ApplicationContext.Provider>
  )

}
