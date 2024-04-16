import { Meta, StoryObj } from "@storybook/react";
import { EventListItem } from "../../../main/react/components/upcoming-events/EventListItem";
import dayjs from "dayjs";

const meta: Meta<typeof EventListItem> = {
  component: EventListItem,
  args: {
    // @ts-ignore
    event: {
      description: "Super nice event that takes place!",
      id: 2712,
      code: "event-code",
      from: dayjs(),
      to: dayjs().add(1, "day"),
      hours: 16,
      days: [8, 8],
      persons: [],
      costs: 1200,
    },
  },
};

export default meta;
type Story = StoryObj<typeof EventListItem>;

export const withDateRange: Story = {};
export const withSingleDate: Story = {
  args: {
    // @ts-ignore
    event: {
      description: "Super nice event that takes place!",
      id: 2712,
      code: "event-code",
      from: dayjs(),
      to: dayjs(),
      hours: 8,
      days: [8],
      persons: [],
      costs: 1200,
    },
  },
};
