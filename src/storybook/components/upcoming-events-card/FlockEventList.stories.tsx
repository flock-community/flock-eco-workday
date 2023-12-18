import {Meta, StoryObj} from "@storybook/react";
import {FlockEventList} from "../../../main/react/components/upcoming-events/FlockEventList";
import dayjs from "dayjs";

const meta: Meta<typeof FlockEventList> = {
  component: FlockEventList,
  args: {
    events: []
  }
}

export default meta;
type Story = StoryObj<typeof FlockEventList>;

export const noData: Story = {}

export const withData: Story = {
  args: {
    events: [
      {
        description: 'Super nice event that takes place!',
        id: 2712,
        code: 'event-code',
        from: dayjs(),
        to: dayjs().add(1, 'day'),
        hours: 16,
        days: [8, 8],
        persons: [],
        costs: 1200,
      },
      {
        description: 'Smashing Conference - Freiburg',
        id: 2712,
        code: 'event-code',
        from: dayjs(),
        to: dayjs().add(4, 'day'),
        hours: 36,
        days: [8, 8, 4, 8, 8],
        persons: [],
        costs: 1200,
      },
      {
        description: 'FLock Hack Day - Flock HQ.',
        id: 2712,
        code: 'event-code',
        from: dayjs(),
        to: dayjs(),
        hours: 8,
        days: [8],
        persons: [],
        costs: 1200,
      },
      {
        description: 'FLock Hack Day - Flock HQ.',
        id: 2712,
        code: 'event-code',
        from: dayjs(),
        to: dayjs(),
        hours: 8,
        days: [8],
        persons: [],
        costs: 1200,
      },
      {
        description: 'Random event- Flock HQ.',
        id: 2712,
        code: 'event-code',
        from: dayjs(),
        to: dayjs(),
        hours: 8,
        days: [8],
        persons: [],
        costs: 1200,
      }
    ]
  }
}
