import type { Meta, StoryObj } from '@storybook/react';
import ContractsEnding from "../../../main/react/components/contracts/ContractsEnding";
import dayjs from "dayjs";

const meta: Meta<typeof ContractsEnding> = {
  component: ContractsEnding,
  args: {
    withinNWeeks: 3,
    contracts: [
      {
        id: 42,
        code: "a3c4cd4a-6f02-4da5-9ebf-4de4cfef4e55",
        person: {
          id: 20,
          uuid: "96a17fd6-eba7-4e7f-96fc-63d8a2119840",
          firstname: "Bert",
          lastname: "Muppets",
          email: "bert@sesam.straat",
          position: "",
          number: "",
          birthdate: null,
          joinDate: null,
          active: true,
          lastActiveAt: new Date(),
          reminders: false,
          shoeSize: "36,5",
          shirtSize: "M",
          user: "4dbc2ac4-fc48-4511-a189-bf0d79f7e898",
          fullName: "Bert Muppets"
        },
        from: dayjs("2022-10-16"),
        to: dayjs("2023-11-24"),
        hourlyRate: 80.0,
        hoursPerWeek: 40,
        billable: true,
        type: "EXTERNAL"
      }
    ]
  }
};

export default meta;
type Story = StoryObj<typeof ContractsEnding>;

export const within3weeks: Story = {};

export const within6weeks: Story = {
  args: {
    withinNWeeks: 6,
    contracts: [
      ...meta.args?.contracts,
      {
        id: 42,
        code: "a3c4cd4a-6f02-4da5-9ebf-4de4cfef4e55",
        person: {
          id: 20,
          uuid: "96a17fd6-eba7-4e7f-96fc-63d8a2119840",
          firstname: "Bert",
          lastname: "Muppets",
          email: "bert@sesam.straat",
          position: "",
          number: "",
          birthdate: null,
          joinDate: null,
          active: true,
          lastActiveAt: new Date(),
          reminders: false,
          shoeSize: "36,5",
          shirtSize: "M",
          user: "4dbc2ac4-fc48-4511-a189-bf0d79f7e898",
          fullName: "Bert Muppets"
        },
        from: dayjs("2022-10-16"),
        to: dayjs("2023-11-24"),
        hourlyRate: 80.0,
        hoursPerWeek: 40,
        billable: true,
        type: "EXTERNAL"
      }
    ]
  }
};

export const noData: Story = {
  args: {
    contracts: []
  }
};
