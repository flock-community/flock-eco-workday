import React, {useEffect, useState} from "react"
import {PersonService} from "./PersonService"
import {Grid} from "@material-ui/core"
import {useRouteMatch} from "react-router-dom"
import {makeStyles} from "@material-ui/styles"
import {PersonWidget} from "./widgets/PersonWidget"

const useStyle = makeStyles(() => ({}))

export const PersonDetails = () => {
  const {params, url} = useRouteMatch()
  const [person, setPerson] = useState({})
  const classes = useStyle()

  useEffect(() => {
    PersonService.getById(params.personId).then(person => setPerson(person))
  }, [])

  return (
    // <Grid container> wrapper is defined @PersonFeature
    <Grid item xs={12} sm={6}>
      <PersonWidget person={person} />
    </Grid>
  )
}

PersonDetails.propTypes = {}
