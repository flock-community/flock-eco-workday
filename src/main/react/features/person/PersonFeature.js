import React from "react"
import {makeStyles} from "@material-ui/styles"
const useStyles = makeStyles(() => ({
  root: {
    // override .MuiGrid-spacing-xs-1 class properties
    margin: 0,
    width: "auto",
  },
  card: {
    margin: 16,
    maxWidth: 1200, // should represent a @screen break-point
    width: "100%",
  },
}))

export const PersonFeature = () => {
    return (<div>Mau</div>)
}
