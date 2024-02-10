import { HolidayDetailDialog } from "../../../main/react/components/holiday-card/HolidayDetailDialog";
import { Meta, StoryObj } from "@storybook/react";

const meta: Meta<typeof HolidayDetailDialog> = {
  component: HolidayDetailDialog,
  args: {
    open: true,
    onComplete: () => {},
    item: {
      name: "New Employee",
      holidayHoursFromContract: 0,
      plusHours: 0,
      holidayHoursDone: 0,
      holidayHoursApproved: 0,
      holidayHoursRequested: 0,
      totalHoursAvailable: 0,
      totalHoursUsed: 0,
      totalHoursRemaining: 0,
    },
  },
};

export default meta;
type Story = StoryObj<typeof HolidayDetailDialog>;

export const withDefaultHours: Story = {
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

export const withPlusHours: Story = {
  args: {
    item: {
      ...withDefaultHours.args?.item,
      plusHours: 8,
    },
  },
};

export const withMultipleRequestedHours: Story = {
  args: {
    item: {
      ...withDefaultHours.args?.item,
      holidayHoursRequested: 5,
    },
  },
};

export const withOneRequestedHour: Story = {
  args: {
    item: {
      ...withDefaultHours.args?.item,
      holidayHoursRequested: 1,
    },
  },
};

export const withAllOptions: Story = {
  args: {
    item: {
      ...withDefaultHours.args?.item,
      plusHours: 10,
      holidayHoursRequested: 2,
    },
  },
};
