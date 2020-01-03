import React from "react"
import {Route, Switch, useRouteMatch} from "react-router-dom"
import {PersonTable} from "./table/PersonTable"
import {PersonDetails} from "./PersonDetails"

export const PersonRouter = () => {
  const {url} = useRouteMatch()

  return (
    <Switch>
      <Route exact path={url} component={PersonTable}></Route>
      <Route exact path={`${url}/code/:personCode`} component={PersonDetails}></Route>
    </Switch>
  )
}

PersonRouter.propTypes = {}
