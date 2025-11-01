import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { UserForm } from '@workday-user';
import { Button } from '@material-ui/core';

const authorities = ['Auth.A', 'Auth.B'];
const value_a = {
  name: 'a',
  email: 'a@a.aa',
  reference: 'a',
  authorities: ['Auth.A'],
};

const value_b = {
  name: 'b',
  email: 'b@b.bb',
  reference: 'b',
  authorities: ['Auth.B'],
};

const meta: Meta<typeof UserForm> = {
  component: UserForm,
  title: 'User/UserForm',
};

export default meta;
type Story = StoryObj<typeof UserForm>;

export const Default: Story = {};

export const WithValue: Story = {
  args: {
    authorities: authorities,
    value: value_a,
  },
};

export const ValueSwitch: Story = {
  render: () => {
    const [state, setState] = useState(value_b);

    const handleClick = () => {
      if (state === value_b) {
        setState(value_a);
      } else {
        setState(value_b);
      }
    };

    return (
      <>
        <UserForm authorities={authorities} value={state} />
        <Button onClick={handleClick}>Switch</Button>
      </>
    );
  },
};