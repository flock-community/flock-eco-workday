import React from "react"

export const PersonDetails = props => {
  const {match} = props
  const {path, url, isExact, params} = match

  return <h1>Hello UserID: {params.personId}</h1>
}
