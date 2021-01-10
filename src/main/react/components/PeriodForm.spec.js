import React from "react";
import { create, act } from "react-test-renderer";
import TextField from "@material-ui/core/TextField";
import moment from "moment";
import { PeriodForm } from "./PeriodForm";

describe("PeriodForm", () => {
  it("should render grid", () => {
    let component = null;
    act(() => {
      component = create(
        <PeriodForm
          value={{
            dates: [
              moment("01-01-2020", "MM-DD-YYYY"),
              moment("01-10-2020", "MM-DD-YYYY"),
            ],
          }}
        />
      );
    });

    expect(component.toJSON()).toMatchSnapshot();
    expect(component.root.findAllByType(TextField)).toHaveLength(16);
  });
});
