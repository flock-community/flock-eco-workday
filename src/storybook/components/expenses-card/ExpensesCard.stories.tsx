import type { Meta, StoryObj } from "@storybook/react";
import {ExpensesCard} from "../../../main/react/components/expenses-card/ExpensesCard";
import dayjs, {Dayjs} from "dayjs";
import {StatusProps} from "../../../main/react/types";
import {ISO_8601_DATE} from "../../../main/react/clients/util/DateFormats";

const meta: Meta<typeof ExpensesCard> = {
  component: ExpensesCard,
  args: {
    openItems: [
      {
        id: 'item-01',
        date: dayjs(new Date(), ISO_8601_DATE),
        description: 'Software license',
        person: {},
        status: 'REQUESTED',
        amount: 120,
        files: [],
        type: ''
      },
      {
        id: 'item-02',
        date: dayjs(new Date(), ISO_8601_DATE),
        description: 'Travel Costs November',
        person: {},
        status: 'REQUESTED',
        amount: 12,
        files: [],
        type: ''
      }
    ],
    recentItems: [
      {
        id: 'item-03',
        date: dayjs(new Date(), ISO_8601_DATE),
        description: 'Software license',
        person: {},
        status: 'APPROVED',
        amount: 375.80,
        files: [],
        type: ''
      },
      {
        id: 'item-04',
        date: dayjs(new Date(), ISO_8601_DATE),
        description: 'Travel Costs November',
        person: {},
        status: 'REJECTED',
        amount: 12,
        files: [],
        type: ''
      },
      {
        id: 'item-05',
        date: dayjs(new Date(), ISO_8601_DATE),
        description: 'Hotel bill',
        person: {},
        status: 'DONE',
        amount: 689.99,
        files: [],
        type: ''
      },
      {
        id: 'item-06',
        date: dayjs(new Date(), ISO_8601_DATE),
        description: 'Very expense expense with long title',
        person: {},
        status: 'DONE',
        amount: 2424.95,
        files: [],
        type: ''
      },
      {
        id: 'item-07',
        date: dayjs("2023-10-02", ISO_8601_DATE),
        description: 'Very expense expense with long title but rejected...',
        person: {},
        status: 'REJECTED',
        amount: 12424.95,
        files: [],
        type: ''
      }
    ],
  }
}

export default meta;
type Story = StoryObj<typeof ExpensesCard>;

export const nodata: Story = {
  args: {
    openItems: [],
    recentItems: []
  }
}

export const withdata: Story = {}
