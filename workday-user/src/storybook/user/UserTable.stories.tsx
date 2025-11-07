import type { Meta, StoryObj } from "@storybook/react";
import { UserTable } from "@workday-user";

const meta: Meta<typeof UserTable> = {
  component: UserTable,
  title: "User/UserTable",
};

export default meta;
type Story = StoryObj<typeof UserTable>;

export const Default: Story = {};
