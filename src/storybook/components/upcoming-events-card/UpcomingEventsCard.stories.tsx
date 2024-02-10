import { UpcomingEventsCard } from "../../../main/react/components/upcoming-events/UpcomingEventsCard";
import { Meta, StoryObj } from "@storybook/react";
import * as FlockEventListStories from "./FlockEventList.stories";

const meta: Meta<typeof UpcomingEventsCard> = {
  component: UpcomingEventsCard,
  args: {
    items: [],
  },
};

export default meta;
type Story = StoryObj<typeof UpcomingEventsCard>;

export const noData: Story = {};

export const withData: Story = {
  args: {
    items: FlockEventListStories.withData.args?.events,
  },
};

export const paginatedData: Story = {
  args: {
    items: FlockEventListStories.withData.args?.events
      ?.concat(FlockEventListStories.withData.args?.events)
      .concat(FlockEventListStories.withData.args?.events),
  },
};
