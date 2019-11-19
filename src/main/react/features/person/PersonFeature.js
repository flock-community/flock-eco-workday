import React from "react"
import {makeStyles} from "@material-ui/styles"
const persons = [
  {
    firstname: "Workday",
    lastname: "Flock",
    email: "workday@flock-se.com",
    active: "today",
    holidays: 14,
    clients: 1,
    hours: 24,
  },
  {
    firstname: "Workday",
    lastname: "Flock",
    email: "workday@flock-se.com",
    active: "yesterday",
    holidays: 24,
    clients: 1,
    hours: 14,
  },
  {
    firstname: "Workday",
    lastname: "Flock",
    email: "workday@flock-se.com",
    active: "day before yesterday",
    holidays: 14,
    clients: 1,
    hours: 4,
  },
]

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
