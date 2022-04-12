import moment from "moment";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
  days: it.days && it.days.length === 0 ? null : it.days,
});

const path = "/api/workdays";
const resourceClient = InternalizingClient(path, internalize);

const findAllByPersonUuid = (personId) =>
  resourceClient.query({
    personId,
    sort: "from,desc",
  });

export const WorkDayClient = {
  ...resourceClient,
  findAllByPersonUuid,
};
