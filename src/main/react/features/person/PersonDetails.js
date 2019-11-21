import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {PersonService} from "./PersonService"
import {Grid} from "@material-ui/core"
import {makeStyles} from "@material-ui/styles"
import {PersonWidget} from "./widgets/PersonWidget"

const useStyle = makeStyles(() => ({}))

export const PersonDetails = props => {
  const {match} = props
  const {path, url, isExact, params} = match
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

PersonDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      personId: PropTypes.string.isRequired,
    }),
  }),
}
