import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";

export const BreadcrumbLink = props => {
  const { breadcrumbs, ...rest } = props;
  const classes = breadcrumbs
    ? "MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorInherit"
    : "";

  return <Link className={classes} {...rest} />;
};

BreadcrumbLink.propTypes = {
  breadcrumbs: PropTypes.bool
};
