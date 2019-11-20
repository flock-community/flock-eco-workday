import React from "react"
import {Paper, Breadcrumbs, Link} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"

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

export const PersonSubNav = () => {
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
        <Link color="inherit" href="/" onClick={handleClick}>
          User
        </Link>
        <Link color="inherit" href="/" onClick={handleClick}>
          Flock workday
        </Link>
      </Breadcrumbs>
    </Paper>
  )
}

PersonSubNav.propTypes = {}
