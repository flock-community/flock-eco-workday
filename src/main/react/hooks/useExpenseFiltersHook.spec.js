import dayjs from "dayjs";
import { cleanup } from "@testing-library/react";
import { useExpenseFilters } from "./useExpenseFiltersHook";
import { Status } from "../models/Status";
import {
  createTestCostExpense,
  createTestTravelExpense,
} from "../utils/tests/test-models";

var isBetween = require("dayjs/plugin/isBetween");
dayjs.extend(isBetween);

describe("useExpenseFiltersHook", () => {
  const [getOpenExpenses, getRecentExpenses] = useExpenseFilters();
  const numberOfDaysForTest = 30;

  const testExpense001 = createTestCostExpense("item-01", dayjs());
  const testExpense003 = createTestCostExpense(
    "item-03",
    dayjs().subtract(3, "days"),
    Status.APPROVED
  );
  const testExpense005 = createTestCostExpense(
    "item-05",
    dayjs().subtract(25, "days"),
    Status.DONE
  );
  const testExpense006 = createTestCostExpense(
    "item-06",
    dayjs().subtract(30, "days"),
    Status.DONE
  );
  const testExpense007 = createTestCostExpense(
    "item-07",
    dayjs().subtract(31, "days"),
    Status.REJECTED
  );

  const testExpense002 = createTestTravelExpense(
    "item-02",
    dayjs().subtract(3, "months")
  );
  const testExpense004 = createTestTravelExpense(
    "item-04",
    dayjs().subtract(15, "days"),
    Status.REJECTED
  );

  const expenses = [
    testExpense001,
    testExpense002,
    testExpense003,
    testExpense004,
    testExpense005,
    testExpense006,
  ];

  afterEach(() => {
    cleanup();
  });

  describe("getOpenExpenses", () => {
    it("should return an empty list if the items provided are empty", () => {
      const result = getOpenExpenses([]);
      expect(result.length).toBe(0);
    });

    it("should return an empty list if the items provided do not match the filter criteria", () => {
      const result = getOpenExpenses([
        testExpense003,
        testExpense006,
        testExpense007,
      ]);
      expect(result.length).toBe(0);
    });

    it("should only return items with the status REQUESTED", () => {
      const result = getOpenExpenses([
        testExpense001,
        testExpense002,
        testExpense007,
      ]);
      expect(result.length).toBe(2);
    });

    it("should only return items with the status REQUESTED even when date is after numberOfDays(ForTest)", () => {
      const result = getOpenExpenses([testExpense002, testExpense007]);
      expect(result.length).toBe(1);
      // needs to be .isBefore because the date of testExpense002 is further in history then
      // the numberOfDays(ForTest) window/ interval
      expect(
        result[0].date.isBefore(dayjs().subtract(numberOfDaysForTest, "days"))
      ).toBeTruthy();
    });
  });

  describe("getRecentExpenses", () => {
    it("should return an empty list if the items provided are empty", () => {
      const result = getRecentExpenses([], numberOfDaysForTest);
      expect(result.length).toBe(0);
    });

    it("should return an empty list if the items provided do not match the status filter criteria", () => {
      const result = getRecentExpenses(
        [testExpense001, testExpense002],
        numberOfDaysForTest
      );
      expect(result.length).toBe(0);
    });

    it("should return an empty list if the items provided do not match the numberOfDays filter criteria", () => {
      const result = getRecentExpenses([testExpense007], numberOfDaysForTest);
      expect(result.length).toBe(0);
    });

    it("should only return items with the status REJECTED, APPROVED or DONE", () => {
      const result = getRecentExpenses(
        [testExpense001, testExpense003, testExpense006, testExpense004],
        numberOfDaysForTest
      );
      expect(result.length).toBe(3);
      expect(result).not.toContain(testExpense001);
    });

    it("should only return items with dates between today and the last 30 days", () => {
      const lastNumberOfDays = 30;
      const today = dayjs();
      const xDaysAgo = today.subtract(lastNumberOfDays, "days");
      const result = getRecentExpenses(
        [
          testExpense003,
          testExpense004,
          testExpense005,
          testExpense006,
          testExpense007,
        ],
        lastNumberOfDays
      );
      expect(result.length).toBe(4);
      expect(result).not.toContain(testExpense007);
    });

    it("should return item when date is equal to numberOfDays", () => {
      const today = dayjs();
      const lastNumberOfDays = 25;
      const daysAgo = today.subtract(lastNumberOfDays, "days");
      const result = getRecentExpenses([testExpense005], lastNumberOfDays);
      expect(result.length).toBe(1);
      expect(result[0].date.isBetween(today, daysAgo, "days", []));
    });

    it("should return item when date is equal to today", () => {
      const today = dayjs();
      const lastNumberOfDays = 25;
      const daysAgo = today.subtract(lastNumberOfDays, "days");
      const result = getRecentExpenses(
        [createTestTravelExpense("item-today", today, Status.APPROVED)],
        lastNumberOfDays
      );
      expect(result.length).toBe(1);
      expect(result[0].date.isBetween(today, daysAgo, "days", []));
    });

    it("should not return item if the expense date is equal to numberOfDays + 1", () => {
      const lastNumberOfDays = 25;
      const daysAgo = dayjs().subtract(lastNumberOfDays, "days");
      const result = getRecentExpenses(
        [
          createTestTravelExpense(
            "item-not-in-range",
            daysAgo.subtract(1, "day"),
            Status.APPROVED
          ),
        ],
        lastNumberOfDays
      );
      expect(result.length).toBe(0);
    });
  });

  describe("split a list of expense objects", () => {
    it("should split all expenses from the list", () => {
      const openExpensesResult = getOpenExpenses(expenses);
      const recentExpensesResult = getRecentExpenses(expenses, 30);
      expect(expenses.length).toEqual(
        openExpensesResult.length + recentExpensesResult.length
      );
    });
  });
});
