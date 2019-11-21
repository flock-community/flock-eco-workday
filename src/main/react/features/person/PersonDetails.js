import React, {useEffect, useState} from "react"
import {PersonService} from "./PersonService"
import {Paper} from "@material-ui/core"

export const PersonDetails = props => {
  const {match} = props
  const {path, url, isExact, params} = match
  const [person, setPerson] = useState({})

  useEffect(() => {
    PersonService.getById(57).then(person => setPerson(person))
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
