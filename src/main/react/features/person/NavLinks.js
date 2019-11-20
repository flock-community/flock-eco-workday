import React from "react"
import PropTypes from "prop-types"
import {Link} from "react-router-dom"

export const NavLink = props => {
  const {breadcrumbs, ...rest} = props
  const classes = breadcrumbs
    ? "MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorInherit"
    : ""

  return <Link {...rest} className={classes} activeClassName="active" />
}

NavLink.propTypes = {
  breadcrumbs: PropTypes.bool,
}
