import { Meta, StoryObj } from "@storybook/react";
import * as FlockEventListStories from "./FlockEventList.stories";
import { HackDayList } from "../../../main/react/components/hackday-card/HackDayList";

const meta: Meta<typeof HackDayList> = {
  component: HackDayList,
  args: {
    items: [],
  },
};

export default meta;
type Story = StoryObj<typeof HackDayList>;

export const noData: Story = {};

export const withData: Story = {
  args: {
    items: FlockEventListStories.withData.args?.events,
    onEventToggle: (a, b) => {},
  },
};

export const paginatedData: Story = {
  args: {
    items: FlockEventListStories.withData.args?.events
      ?.concat(FlockEventListStories.withData.args?.events)
      .concat(FlockEventListStories.withData.args?.events),
    onEventToggle: (a, b) => {},
  },
};
