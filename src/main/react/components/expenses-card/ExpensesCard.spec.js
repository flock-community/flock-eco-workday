import React from "react";
import { mount } from "enzyme";
import { ExpensesCard } from "./ExpensesCard.tsx";

describe("ExpensesCardssss", () => {
  it("renders without crashing", () => {
    const wrapper = mount(<ExpensesCard />);
    expect(wrapper.state("error")).toBeNull();
  });
});
