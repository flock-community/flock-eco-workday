import "@testing-library/jest-dom";
import { CostExpense, TravelExpense } from "./Expense";

describe("Expense model", () => {
  it("should create a CostExpense fromJson", () => {
    const result = CostExpense.fromJson({
      id: "item-01",
      date: "2023-12-10",
      description: "Software license",
      person: {},
      status: "REQUESTED",
      amount: 120,
      files: [],
      type: "COST",
    });
    expect(result).toBeDefined();
    expect(result.amount).toBe(120);
  });

  it("should create a valid TravelExpense fromJson", () => {
    const result = TravelExpense.fromJson({
      id: "item-02",
      date: "2023-11-10",
      description: "Travel Costs November",
      person: {},
      status: "REQUESTED",
      allowance: 0.19,
      distance: 100,
      files: [],
      type: "TRAVEL",
    });
    expect(result).toBeDefined();
    expect(result.amount).toBe(0.19 * 100);
  });
});
