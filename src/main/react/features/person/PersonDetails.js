import React, {useEffect, useState} from "react"
import PropTypes from "prop-types"
import {PersonService} from "./PersonService"
import {Paper} from "@material-ui/core"

export const PersonDetails = props => {
  const {match} = props
  const {path, url, isExact, params} = match
  const [person, setPerson] = useState({})

  useEffect(() => {
    PersonService.getById(params.personId).then(person => setPerson(person))
  }, [])

  return (
    <Paper>
      <h1>Hello UserID: {params.personId}</h1>
      {["firstname", "lastname", "email"].map((key, idx) => (
        <p key={idx}>
          {key}: {person[key]}
        </p>
      ))}
    </Paper>
  )
}

PersonDetails.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      personId: PropTypes.string.isRequired,
    }),
  }),
}
