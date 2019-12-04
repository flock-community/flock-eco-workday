import React, {useEffect, useState} from "react"

import {HashRouter as Router, Route} from "react-router-dom"
import {UserFeature} from "@flock-eco/feature-user/src/main/react/user/UserFeature"
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {HolidayFeature} from "../features/holiday/HolidayFeature"
import {ApplicationLayout} from "./ApplicationLayout"
import {ApplicationDrawer} from "./ApplicationDrawer"
import {ApplicationContext} from "./ApplicationContext"
import {HomeFeature} from "../features/home/HomeFeature"
import {ClientFeature} from "../features/client/ClientFeature"
import {AssignmentFeature} from "../features/assignments/AssignmentFeature"
import {PersonFeature} from "../features/person/PersonFeature"

export const Application = () => {
  const [state, setState] = useState({
    openDrawer: false,
    loggedIn: null,
    authorities: null,
  })

  useEffect(() => {
    fetch(`/login/status`)
      .then(res => res.json())
      .then(status => {
        if (status.loggedIn) {
          UserClient.findUserByCode("me")
            .then(user => {
              setState({
                loggedIn: status.loggedIn,
                authorities: status.authorities,
                user,
              })
              UserAuthorityUtil.setAuthorities(status.authorities)
            })
            .catch(() => {
              console.log("Cannot connect to service")
            })
        } else {
          setState({
            loggedIn: status.loggedIn,
          })
        }
      })
  }, [])

  function handleDrawerClose() {
    // change openDrawer from state, but keep loggedIn and authorities
    setState({openDrawer: false, ...state})
  }

  function handleDrawerOpen() {
    // change openDrawer from state, but keep loggedIn and authorities
    setState({openDrawer: true, ...state})
  }

  if (state.loggedIn != null && !state.loggedIn) {
    window.location.href = "/login"
    return null
  }

  return (
    <ApplicationContext.Provider
      value={{authorities: state.authorities, user: state.user}}
    >
      <Router>
        <ApplicationDrawer open={state.openDrawer} onClose={handleDrawerClose} />
        <ApplicationLayout onDrawer={handleDrawerOpen} />
        <Route path="/" exact component={HomeFeature} />
        <Route path="/clients" exact component={ClientFeature} />
        <Route path="/assignments" exact component={AssignmentFeature} />
        <Route path="/holidays" exact component={HolidayFeature} />
        <Route path="/users" exact component={UserFeature} />
        <Route path="/person" component={PersonFeature} />
      </Router>
    </ApplicationContext.Provider>
  )
}
