import type { Meta, StoryObj } from "@storybook/react";
import {ExpensesCard} from "../../../main/react/components/expenses-card/ExpensesCard";
import dayjs from "dayjs";

const meta: Meta<typeof ExpensesCard> = {
  component: ExpensesCard,
  args: {
    items: [
      {
        id: 'item-01',
        date: dayjs(),
        description: 'Software license',
        person: {},
        status: 'REQUESTED',
        amount: 120,
        files: [],
        type: 'COST'
      },
      {
        id: 'item-02',
        date: dayjs().subtract(3, 'months'),
        description: 'Travel Costs November',
        person: {},
        status: 'REQUESTED',
        allowance: 0.19,
        distance: 100,
        files: [],
        type: 'TRAVEL'
      },
      {
        id: 'item-03',
        date: dayjs().subtract(3, 'days'), // 12-11-2023
        description: 'Software license',
        person: {},
        status: 'APPROVED',
        amount: 375.80,
        files: [],
        type: 'COST'
      },
      {
        id: 'item-04',
        date: dayjs().subtract(15, 'days'), // 31-10-2023
        description: 'Travel Costs November',
        person: {},
        status: 'REJECTED',
        allowance: 0.19,
        distance: 122,
        files: [],
        type: 'TRAVEL'
      },
      {
        id: 'item-05',
        date: dayjs().subtract(25, 'days'),
        description: 'Hotel bill',
        person: {},
        status: 'DONE',
        amount: 689.99,
        files: [],
        type: 'COST'
      },
      {
        id: 'item-06',
        date: dayjs().subtract(30, 'days'),
        description: 'Very expense expense with long title',
        person: {},
        status: 'DONE',
        amount: 2424.95,
        files: [],
        type: 'COST'
      },
      {
        id: 'item-07',
        date: dayjs().subtract(31, 'days'),
        description: 'Very expense expense with long title but rejected...',
        person: {},
        status: 'REJECTED',
        amount: 12424.95,
        files: [],
        type: 'COST'
      }
    ],
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
