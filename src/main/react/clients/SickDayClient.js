import moment from "moment";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
});

const path = "/api/sickdays";
const resourceClient = InternalizingClient(path, internalize);

const findAllByPersonId = (personId) =>
  resourceClient.query({
    personId,
    sort: "from,desc",
  });

export const SickDayClient = {
  ...resourceClient,
  findAllByPersonId,
};
