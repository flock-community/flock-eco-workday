import moment from "moment";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
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
