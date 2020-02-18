import React from "react"
import {storiesOf} from "@storybook/react"
import moment from "moment"
import {PeriodForm} from "../../../main/react/components/PeriodForm"

const handleChange = val => console.log(val)

storiesOf("components/PeriodForm", module)
  .add("default", () => {
    return <PeriodForm onChange={handleChange}/>
  })

  .add("value start date", () => {
    return (
      <PeriodForm
        onChange={handleChange}
        value={{dates: [moment("2019-07-01")]}}
      />
    )
  })

  .add("value moment", () => {
    return (
      <PeriodForm
        onChange={handleChange}
        value={{dates: [moment("2019-07-01"), moment("2019-07-25")]}}
      />
    )
  })

  .add("value string", () => {
    return (
      <PeriodForm
        onChange={handleChange}
        value={{dates: ["2019-07-01", "2019-07-25"]}}
      />
    )
  })

  .add("over year", () => {
    return (
      <PeriodForm
        onChange={handleChange}
        value={{dates: ["2019-12-20", "2020-01-10"]}}
      />
    )
  })

  .add("with days", () => {
    return (
      <PeriodForm
        onChange={handleChange}
        value={{dates: ["2019-07-01", "2019-07-25"], days: [4, 4, 4, 4, 4]}}
      />
    )
  })
