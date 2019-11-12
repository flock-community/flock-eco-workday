import React from "react"
import {storiesOf} from "@storybook/react"
import HolidayForm from "../../../main/react/holiday/HolidayForm"
import CalendarFeature from "../../../main/react/calendar/CalendarFeature"

storiesOf("calendar/Calendar").add("default", () => {
  return <CalendarFeature />
})
