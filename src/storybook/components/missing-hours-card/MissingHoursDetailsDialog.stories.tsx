import { MissingHoursDetailDialog } from "../../../main/react/components/missing-hours-card/MissingHoursDetailDialog";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof MissingHoursDetailDialog> = {
  component: MissingHoursDetailDialog,
  args: {
    open: true,
    onComplete: () => {},
    item: {
      monthYear: "2023-11",
      missing: 50,
      id: "96a17fd6-eba7-4e7f-96fc-63d8a2119840",
      name: "Bert Muppets",
      contractTypes: ["ContractExternal"],
      sickDays: 16,
      workDays: 162,
      assignment: 302,
      event: 16,
      total: 300,
      leaveDayUsed: 24,
      leaveDayBalance: 0,
      paidParentalLeaveUsed: 16,
      unpaidParentalLeaveUsed: 16,
      revenue: {},
      cost: 0,
    },
  },
};

export default meta;
type Story = StoryObj<typeof MissingHoursDetailDialog>;

export const noData: Story = {
  args: {
    item: undefined,
  },
};

export const withMissingHoursData: Story = {};

export const withoutMissingHoursData: Story = {
  args: {
    item: {
      ...meta.args?.item,
      workDays: 212,
    },
  },
};
