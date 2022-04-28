import dayjs from "dayjs";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  from: dayjs(it.from),
  to: dayjs(it.to),
});

const path = "/api/holidays";
const resourceClient = InternalizingClient(path, internalize);

export const HOLIDAY_PAGE_SIZE = 5;

const findAllByPersonId = (personId, page) =>
  resourceClient.queryByPage(
    {
      page,
      size: HOLIDAY_PAGE_SIZE,
      sort: "from,desc",
    },
    {
      personId,
    }
  );

export const HolidayClient = {
  ...resourceClient,
  findAllByPersonId,
};
