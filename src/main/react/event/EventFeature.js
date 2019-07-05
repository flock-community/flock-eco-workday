import React, {Fragment} from 'react'
import {EventDialog} from "./EventDialog";
import {EventList} from "./EventList";

export function EventFeature() {

  return <Fragment>
    <EventList/>
    <EventDialog/>
  </Fragment>
}
