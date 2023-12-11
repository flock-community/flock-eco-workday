import type { Meta, StoryObj } from "@storybook/react";
import {ExpensesCard} from "../../../main/react/components/expenses-card/ExpensesCard";
import dayjs from "dayjs";
import {createTestCostExpense, createTestTravelExpense} from "../../../main/react/utils/tests/test-models";
import {Status} from "../../../main/react/models/Status";

const testExpense001 = createTestCostExpense('item-01', dayjs());
const testExpense002 = createTestTravelExpense('item-02', dayjs().subtract(3, 'months'));
const testExpense003 = createTestCostExpense('item-03', dayjs().subtract(3, 'days'), Status.APPROVED);
const testExpense004 = createTestTravelExpense('item-04', dayjs().subtract(15, 'days'), Status.REJECTED);
const testExpense005 = createTestCostExpense('item-05', dayjs().subtract(25, 'days'), Status.DONE);
const testExpense006 = createTestCostExpense('item-06', dayjs().subtract(31, 'days'), Status.REJECTED);

const meta: Meta<typeof ExpensesCard> = {
  component: ExpensesCard,
  args: {
    items: [
      testExpense001, testExpense002, testExpense003, testExpense004,
      testExpense005, testExpense006
    ]
  }
}

export default meta;
type Story = StoryObj<typeof ExpensesCard>;

export const noData: Story = {
  args: {
    items: []
  }
}

export const withData: Story = {}

export const withPagination: Story = {
  args: {
    items: [
      testExpense001, testExpense002,
      testExpense001, testExpense002,
      testExpense001, testExpense002,
      testExpense004, testExpense005,
      testExpense004, testExpense005,
      testExpense004, testExpense005
    ]
  }
}

export const withLongData: Story = {
  args: {
    items: [
      {
        ...testExpense001,
        description: 'Very expense expense with long title',
        amount: 2424.95
      },
      {
        ...testExpense005,
        description: 'Very expense expense with long title but rejected...',
        amount: 12424.95
      }
    ]
  }
}
