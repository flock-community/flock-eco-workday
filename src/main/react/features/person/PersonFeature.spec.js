import React from "react"
import {render} from "@testing-library/react"
import {PersonFeature} from "./PersonFeature"

describe("Test PersonFeature", () => {
  it("should test the component", () => {
    const component = render(<PersonFeature />)
    expect(component).toBeTruthy()
  })
})
