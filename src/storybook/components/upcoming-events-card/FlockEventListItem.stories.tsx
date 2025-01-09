import { Meta, StoryObj } from "@storybook/react";
import { EventListItem } from "../../../main/react/components/upcoming-events/EventListItem";
import dayjs from "dayjs";
import { EventType } from "../../../main/react/clients/EventClient";

const meta: Meta<typeof EventListItem> = {
  component: EventListItem,
  parameters: {
    reactRouter: {
      routePath: "/users/:userId",
      routeParams: { userId: "42" },
      routeHandle: "Profile",
      searchParams: { tab: "activityLog" },
      routeState: { fromPage: "homePage" },
    },
  },

  args: {
    onEventToggle: (x, y) => {},
    event: {
      description: "Super nice event that takes place!",
      id: 2712,
      type: EventType.GENERAL_EVENT,
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
    event: {
      description: "Super nice event that takes place!",
      id: 2712,
      type: EventType.GENERAL_EVENT,
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
