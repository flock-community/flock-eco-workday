import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Breadcrumbs } from "@material-ui/core";
import { BreadcrumbLink } from "./BreadcrumbLink";
import { useBreadcrumbs } from "./Breadcrumb";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    padding: "0 16px",
    borderRadius: 0
  },
  breadcrumbs: {
    display: "flex",
    fontSize: 12,
    height: 30
  }
}));

export const BreadcrumbsNavigation = () => {
  const [navItemList] = useBreadcrumbs();
  const classes = useStyles();

  return (
    <Paper className={classes.root}>
      <Breadcrumbs
        className={classes.breadcrumbs}
        separator=">"
        aria-label="breadcrumb"
      >
        {/* Iterate over menu items, which indicates the level depth of the breadcrumb */}
        {navItemList.map((link, key) => (
          <BreadcrumbLink key={key} breadcrumbs to={link.url}>
            {link.name}
          </BreadcrumbLink>
        ))}
      </Breadcrumbs>
    </Paper>
  );
};
