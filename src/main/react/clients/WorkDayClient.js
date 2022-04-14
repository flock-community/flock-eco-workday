import moment from "moment";
import InternalizingClient from "../utils/InternalizingClient.ts";

export const WORK_DAY_PAGE_SIZE = 5;

const internalize = (it) => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
  days: it.days && it.days.length === 0 ? null : it.days,
});

const path = "/api/workdays";
const resourceClient = InternalizingClient(path, internalize);

const findAllByPersonUuid = (personId, page) =>
  resourceClient.queryByPage(
    {
      page,
      size: WORK_DAY_PAGE_SIZE,
      sort: "from,desc",
    },
    {
      personId,
    }
  );

export const WorkDayClient = {
  ...resourceClient,
  findAllByPersonUuid,
};
