import React, {useEffect, useState} from "react"
import {useRouteMatch} from "react-router-dom"
import {Grid, Paper, Typography} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {PersonService} from "./PersonService"
import {PersonWidget} from "./widgets/PersonWidget"
import {useBreadcrumbs} from "../../components/breadcrumb"
import {Feed} from "./widgets/Feed"

const useStyle = makeStyles(() => ({
  root: {margin: "-8px"},
  marginLeft: {
    marginLeft: "1rem",
  },
  defaultPadding: {
    padding: "1rem",
  },
}))

export const PersonDetails = () => {
  const {params, url} = useRouteMatch()
  const [person, setPerson] = useState({})
  const [linkList, setLinkList] = useBreadcrumbs()
  const classes = useStyle()

  useEffect(() => {
    // eslint-disable-next-line no-shadow
    PersonService.getById(params.personId).then(person => {
      const breadcrumbItem = {url, name: `${person.firstname} ${person.lastname}`}
      setLinkList([...linkList, breadcrumbItem])
      setPerson(person)
    })
  }, [])

  return (
    // <Grid container> wrapper is defined @PersonFeature
    <Grid container item xs={12} spacing={2} className={classes.root}>
      <Grid item xs={12} sm={4}>
        <PersonWidget person={person} />
      </Grid>
      <Grid item xs={12} sm={8}>
        <div>
          <Feed title="User Information" item={person}>
            <ul>
              <li>firstname: {person.firstname}</li>
              <li>lastname: {person.lastname}</li>
              <li>email: {person.email}</li>
            </ul>
          </Feed>
          {/* <Paper className={classes.defaultPadding}>
            <Typography variant="caption">User Information Details</Typography>
            <Typography variant="body1" component="p">
              Hello
            </Typography>
          </Paper> */}
        </div>
      </Grid>
    </Grid>
  )
}

PersonDetails.propTypes = {}
