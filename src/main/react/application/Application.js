import React, {useEffect, useState} from "react"

import {HashRouter as Router, Route} from "react-router-dom"
import {UserFeature} from "@flock-eco/feature-user/src/main/react/user/UserFeature"
import UserClient from "@flock-eco/feature-user/src/main/react/user/UserClient"
import UserAuthorityUtil from "@flock-eco/feature-user/src/main/react/user_utils/UserAuthorityUtil"
import {CircularProgress, makeStyles} from "@material-ui/core"
import createMuiTheme from "@material-ui/core/styles/createMuiTheme"
import ThemeProvider from "@material-ui/styles/ThemeProvider"
import {HolidayFeature} from "../features/holiday/HolidayFeature"
import {ApplicationLayout} from "./ApplicationLayout"
import {ApplicationDrawer} from "./ApplicationDrawer"
import {ApplicationContext} from "./ApplicationContext"
import {HomeFeature} from "../features/home/HomeFeature"
import {ClientFeature} from "../features/client/ClientFeature"
import {AssignmentFeature} from "../features/assignments/AssignmentFeature"
import {PersonFeature} from "../features/person/PersonFeature"
// TODO: replace by UserStatusClient from @flock-eco/feature-user
import {UserStatusClient} from "../clients/UserStatusClient"
import {SickdayFeature} from "../features/sickday/SickdayFeature"
import {useUser} from "../hooks/UserHook"
import {DashboardFeature} from "../features/dashboard/DashboardFeature"
import {ContractFeature} from "../features/contract/ContractFeature"
import {WorkDayFeature} from "../features/workday/WorkDayFeature"

const useStyles = makeStyles(() => ({
  spinner: {
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}))

const theme = createMuiTheme({
  palette: {
    primary: {
      main: "#fcde00",
    },
  },
})

export const Application = () => {
  const classes = useStyles()

  // eslint-disable-next-line no-unused-vars
  const [_, setUser] = useUser()

  const [state, setState] = useState({
    openDrawer: false,
    loggedIn: null,
    authorities: null,
    loading: true,
  })

  useEffect(() => {
    UserStatusClient.get().then(status => {
      if (status.loggedIn) {
        UserClient.findUsersMe().then(user => {
          setState(it => ({
            ...it,
            loggedIn: status.loggedIn,
            authorities: status.authorities,
            loading: false,
            user,
          }))
          setUser(user)
          UserAuthorityUtil.setAuthorities(status.authorities)
        })
      } else {
        setState(it => ({
          ...it,
          loggedIn: status.loggedIn,
          loading: false,
        }))
      }
    })
  }, [])

  function handleDrawerClose() {
    // change openDrawer from state, but keep loggedIn and authorities
    setState(it => ({...it, openDrawer: false}))
  }

  function handleDrawerOpen() {
    // change openDrawer from state, but keep loggedIn and authorities
    setState(it => ({...it, openDrawer: true}))
  }

  if (state.loading) {
    return (
      <div className={classes.spinner}>
        <CircularProgress />
      </div>
    )
  }

  if (state.loggedIn != null && !state.loggedIn) {
    window.location.href = "/login"
    return null
  }

  return (
    <ThemeProvider theme={theme}>
      <ApplicationContext.Provider
        value={{authorities: state.authorities, user: state.user}}
      >
        <Router>
          <ApplicationDrawer open={state.openDrawer} onClose={handleDrawerClose} />
          <ApplicationLayout onDrawer={handleDrawerOpen} />
          <Route path="/" exact component={HomeFeature} />
          <Route path="/dashboard" exact component={DashboardFeature} />
          <Route path="/clients" exact component={ClientFeature} />
          <Route path="/contracts" exact component={ContractFeature} />
          <Route path="/assignments" exact component={AssignmentFeature} />
          <Route path="/workdays" exact component={WorkDayFeature} />
          <Route path="/holidays" exact component={HolidayFeature} />
          <Route path="/sickdays" component={SickdayFeature} />
          <Route path="/users" exact component={UserFeature} />
          <Route path="/person" component={PersonFeature} />
        </Router>
      </ApplicationContext.Provider>
    </ThemeProvider>
  )
}
