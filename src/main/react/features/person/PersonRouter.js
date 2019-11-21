import React from "react"
import PropTypes from "prop-types"
import {Route, Switch, NavLinks} from "react-router-dom"
import {PersonTable} from "./table/PersonTable"
import {PersonDetails} from "./PersonDetails"

export const PersonRouter = props => {
  const {match} = props
  const {path, url, isExact, params} = match

  return (
    <Switch>
      <Route exact path={url} component={PersonTable}></Route>
      <Route exact path={`${url}/id/:personId`} component={PersonDetails}></Route>
    </Switch>
  )
}

PersonRouter.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }),
}
