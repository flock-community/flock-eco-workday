import React from "react"
import PropTypes from "prop-types"
import {Paper, Breadcrumbs, Link} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {NavLink} from "./NavLinks"

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    padding: "0 16px",
  },
  breadcrumbs: {
    display: "flex",
    fontSize: 12,
    height: 30,
  },
}))

export const PersonSubNav = props => {
  const {baseUrl} = props
  const classes = useStyles()

  const handleClick = e => {
    console.log(`click handled: ${e}`)
  }

  return (
    <Paper className={classes.root}>
      <Breadcrumbs
        className={classes.breadcrumbs}
        separator=">"
        aria-label="breadcrumb"
      >
        <NavLink breadcrumbs to={`${baseUrl}`} onClick={handleClick}>
          User
        </NavLink>
        <NavLink
          breadcrumbs
          color="inherit"
          to={`${baseUrl}/id/2`}
          onClick={handleClick}
        >
          Flock workday
        </NavLink>
      </Breadcrumbs>
    </Paper>
  )
}

PersonSubNav.propTypes = {
  baseUrl: PropTypes.string.isRequired,
}
