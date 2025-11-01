import type { Meta, StoryObj } from '@storybook/react';
import { UserAuthorityUtil } from '@workday-user';

const meta: Meta<typeof UserAuthorityUtil> = {
  component: UserAuthorityUtil,
  title: 'User util/UserAuthorityUtil',
};

export default meta;
type Story = StoryObj<typeof UserAuthorityUtil>;

export const Default: Story = {};