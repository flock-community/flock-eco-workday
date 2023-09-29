import dayjs from "dayjs";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  from: dayjs(it.from),
  to: dayjs(it.to),
});

const path = "/api/leave-days";
const resourceClient = InternalizingClient(path, internalize);

export const LEAVE_DAY_PAGE_SIZE = 5;

const findAllByPersonId = (personId, page) =>
  resourceClient.queryByPage(
    {
      page,
      size: LEAVE_DAY_PAGE_SIZE,
      sort: "from,desc",
    },
    {
      personId,
    }
  );

export const LeaveDayClient = {
  ...resourceClient,
  findAllByPersonId,
};
