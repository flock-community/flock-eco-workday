import type { Meta, StoryObj } from "@storybook/react";
import { MissingHoursCard } from "../../../main/react/components/missing-hours-card/MissingHoursCard";

const meta: Meta<typeof MissingHoursCard> = {
  component: MissingHoursCard,
  args: {
    totalPerPersonMe: {
      "2023-11": {
        id: "96a17fd6-eba7-4e7f-96fc-63d8a2119840",
        name: "Bert Muppets",
        contractTypes: ["ContractExternal"],
        sickDays: 0,
        workDays: 0,
        assignment: 302,
        event: 0,
        total: 304,
        leaveDayUsed: 32.0,
        leaveDayBalance: 10,
        paidParentalLeaveUsed: 0,
        unpaidParentalLeaveUsed: 0,
        revenue: null,
        cost: null,
      },
      "2023-10": {
        id: "96a17fd6-eba7-4e7f-96fc-63d8a2119840",
        name: "Bert Muppets",
        contractTypes: ["ContractExternal"],
        sickDays: 0,
        workDays: 0,
        assignment: 302,
        event: 0,
        total: 304,
        leaveDayUsed: 32.0,
        leaveDayBalance: 10,
        paidParentalLeaveUsed: 0,
        unpaidParentalLeaveUsed: 0,
        revenue: null,
        cost: null,
      },
      "2023-09": {
        id: "96a17fd6-eba7-4e7f-96fc-63d8a2119840",
        name: "Bert Muppets",
        contractTypes: ["ContractExternal"],
        sickDays: 0,
        workDays: 0,
        assignment: 302,
        event: 0,
        total: 304,
        leaveDayUsed: 32.0,
        leaveDayBalance: 10,
        paidParentalLeaveUsed: 0,
        unpaidParentalLeaveUsed: 0,
        revenue: null,
        cost: null,
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof MissingHoursCard>;

export const noData: Story = {
  args: {
    totalPerPersonMe: {},
  },
};

export const withData: Story = {};
