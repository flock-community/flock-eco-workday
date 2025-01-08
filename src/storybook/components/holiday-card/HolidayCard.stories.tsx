import { Meta, StoryObj } from "@storybook/react";
import { HolidayCard } from "../../../main/react/components/holiday-card/HolidayCard";

const meta: Meta<typeof HolidayCard> = {
  component: HolidayCard,
  args: {
    item: {
      name: "New Employee",
      holidayHoursFromContract: 200,
      plusHours: 0,
      holidayHoursDone: 24,
      holidayHoursApproved: 24,
      holidayHoursRequested: 0,
      totalHoursAvailable: 208,
      totalHoursUsed: 48,
      totalHoursRemaining: 160,
    },
  },
};

export default meta;
type Story = StoryObj<typeof HolidayCard>;

export const withDefaultHours: Story = {};

export const noData: Story = {
  args: {
    item: undefined,
  },
};
