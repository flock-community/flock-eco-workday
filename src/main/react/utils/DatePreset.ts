import moment from "moment";

export type DatePreset = {
  title: string;
  from: moment.Moment;
  to: moment.Moment;
};

export const datePresets: DatePreset[] = [
  {
    title: "Previous week",
    from: moment().subtract(1, "week").startOf("week"),
    to: moment().subtract(1, "week").endOf("week"),
  },
  {
    title: "Current week",
    from: moment().startOf("week"),
    to: moment().endOf("week"),
  },
  {
    title: "Previous month",
    from: moment().subtract(1, "month").startOf("month"),
    to: moment().subtract(1, "month").endOf("month"),
  },
  {
    title: "Current month",
    from: moment().startOf("month"),
    to: moment().endOf("month"),
  },
];
