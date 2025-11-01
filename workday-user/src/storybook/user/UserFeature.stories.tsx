import type { Meta, StoryObj } from '@storybook/react';
import { UserFeature } from '@workday-user';

const meta: Meta<typeof UserFeature> = {
  component: UserFeature,
  title: 'User/UserFeature',
  decorators: [
    (Story) => (
      <div style={{ height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof UserFeature>;

export const Default: Story = {};

export const WithPassword: Story = {
  args: {
    enablePassword: true,
  },
};