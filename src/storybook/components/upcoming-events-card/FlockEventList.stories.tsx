import { Meta, StoryObj } from "@storybook/react";
import { EventList } from "../../../main/react/components/upcoming-events/EventList";
import { EventType } from "../../../main/react/clients/EventClient";
import dayjs from "dayjs";

const meta: Meta<typeof EventList> = {
  component: EventList,
  args: {
    events: [],
  },
};

export default meta;
type Story = StoryObj<typeof EventList>;

export const noData: Story = {};

export const withData: Story = {
  args: {
    events: [
      {
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
      {
        description: "Smashing Conference - Freiburg",
        id: 2712,
        type: EventType.CONFERENCE,
        code: "event-code",
        from: dayjs(),
        to: dayjs().add(4, "day"),
        hours: 36,
        days: [8, 8, 4, 8, 8],
        persons: [],
        costs: 1200,
      },
      {
        description: "FLock Hack Day - Flock HQ.",
        id: 2712,
        type: EventType.FLOCK_HACK_DAY,
        code: "event-code",
        from: dayjs(),
        to: dayjs(),
        hours: 8,
        days: [8],
        persons: [],
        costs: 1200,
      },
      {
        description: "FLock Hack Day - Flock HQ.",
        id: 2712,
        type: EventType.FLOCK_HACK_DAY,
        code: "event-code",
        from: dayjs(),
        to: dayjs(),
        hours: 8,
        days: [8],
        persons: [],
        costs: 1200,
      },
      {
        description: "Community day- Flock HQ.",
        id: 2712,
        type: EventType.FLOCK_COMMUNITY_DAY,
        code: "event-code",
        from: dayjs(),
        to: dayjs(),
        hours: 8,
        days: [8],
        persons: [],
        costs: 1200,
      },
    ],
  },
};
