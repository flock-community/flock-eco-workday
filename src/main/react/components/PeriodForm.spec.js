import React from "react"
import {create, act} from "react-test-renderer"
import TextField from "@material-ui/core/TextField"
import {PeriodForm} from "./PeriodForm"

describe("PeriodForm", () => {
  it("should render grid", () => {
    let component
    act(() => {
      component = create(<PeriodForm value={{dates: ["01-01-2020", "01-10-2020"]}} />)
    })

    expect(component.toJSON()).toMatchSnapshot()
    expect(component.root.findAllByType(TextField)).toHaveLength(16)
  })
})
