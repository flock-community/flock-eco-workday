import dayjs, { Dayjs } from "dayjs";

export type DatePreset = {
  title: string;
  from: Dayjs;
  to: Dayjs;
};

export const datePresets: DatePreset[] = [
  {
    title: "Previous week",
    from: dayjs().subtract(1, "week").startOf("week"),
    to: dayjs().subtract(1, "week").endOf("week"),
  },
  {
    title: "Current week",
    from: dayjs().startOf("week"),
    to: dayjs().endOf("week"),
  },
  {
    title: "Previous month",
    from: dayjs().subtract(1, "month").startOf("month"),
    to: dayjs().subtract(1, "month").endOf("month"),
  },
  {
    title: "Current month",
    from: dayjs().startOf("month"),
    to: dayjs().endOf("month"),
  },
];
