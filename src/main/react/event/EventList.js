import React, {useState} from 'react'

import {findAllEvents} from "./EventClient";
import {useEffect} from "react";
import Card from "@material-ui/core/Card";

export function EventList() {

  const [events, setEvent] = useState([]);

  useEffect(() => {
    loadEvents()
  }, []);


  const loadEvents = () => {
    findAllEvents().then(events =>  setEvent(events))
  }

  return events.map(event => <Card>
    {event.name}
  </Card>)

}
