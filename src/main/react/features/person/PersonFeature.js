import React from "react"
import PropTypes from "prop-types"
import Grid from "@material-ui/core/Grid"
import {makeStyles} from "@material-ui/styles"
import {PersonSubNav} from "./PersonSubNav"
import {PersonRouter} from "./PersonRouter"

const useStyles = makeStyles(() => ({
  root: {
    // override .MuiGrid-spacing-xs-1 class properties
    margin: 0,
    width: "auto",
  },
}))

export const PersonFeature = props => {
  const {match} = props
  const {url} = match
  const classes = useStyles()

  return (
    <Grid container className={classes.root} spacing={4}>
      <PersonSubNav baseUrl={url} />
      <Grid item xs={12}>
        <PersonRouter {...props} />
        {props.children}
      </Grid>
    </Grid>
  )
}

PersonFeature.propTypes = {
  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }),
}
