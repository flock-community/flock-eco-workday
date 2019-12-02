import React from "react"
import PropTypes from "prop-types"
import Grid from "@material-ui/core/Grid"
import {makeStyles} from "@material-ui/styles"
import {PersonRouter} from "./PersonRouter"
import {
  BreadcrumbsContextProvider,
  BreadcrumbsNavigation,
} from "../../components/breadcrumb"

const useStyles = makeStyles(() => ({
  root: {
    // override .MuiGrid-spacing-xs-1 class properties
    margin: 0,
    width: "auto",
  },
}))

export const PersonFeature = props => {
  const classes = useStyles()

  return (
    <Grid container className={classes.root} spacing={4}>
      <BreadcrumbsContextProvider>
        <BreadcrumbsNavigation />
        <Grid item xs={12}>
          <PersonRouter />
          {props.children}
        </Grid>
      </BreadcrumbsContextProvider>
    </Grid>
  )
}

PersonFeature.propTypes = {
  children: PropTypes.any,
}
