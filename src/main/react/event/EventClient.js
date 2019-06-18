import React from 'react'

const url = `/api/events`

const internalize = res => res.json()

export const findAllEvents = () => fetch(url)
  .then(internalize)
  
  

  
