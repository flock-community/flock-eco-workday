import moment from "moment";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
});

const path = "/api/holidays";
const resourceClient = InternalizingClient(path, internalize);

const findAllByPersonId = (personId) =>
  resourceClient.query({
    personId,
    sort: "from,desc",
  });

export const HolidayClient = {
  ...resourceClient,
  findAllByPersonId,
};
