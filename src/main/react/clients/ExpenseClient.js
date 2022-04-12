import moment, { HTML5_FMT } from "moment";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  date: moment(it.date),
});

const serialize = (it) => ({
  ...it,
  date: typeof it.date === "string" ? it.date : it.date.format(HTML5_FMT.DATE),
});

const path = "/api/expenses";
const travelPath = "/api/expenses-travel";
const costPath = "/api/expenses-cost";

const resourceClient = InternalizingClient(path, internalize);
const travelExpenseClient = InternalizingClient(travelPath, internalize);
const costExpenseClient = InternalizingClient(costPath, internalize);

const findAllByPersonId = (personId) =>
  resourceClient.query({
    personId,
    sort: "date,desc",
  });

const post = (type, item) => {
  const serialized = serialize(item);

  if (type.toUpperCase() === "COST") {
    return costExpenseClient.post(serialized);
  }
  if (type.toUpperCase() === "TRAVEL") {
    return travelExpenseClient.post(serialized);
  }

  throw Error(`Unknown expense type: ${type}`);
};

const put = (id, type, item) => {
  const serialized = serialize(item);

  if (type.toUpperCase() === "COST") {
    return costExpenseClient.put(id, serialized);
  }
  if (type.toUpperCase() === "TRAVEL") {
    return travelExpenseClient.put(id, serialized);
  }

  throw Error(`Unknown expense type: ${type}`);
};

export const ExpenseClient = {
  ...resourceClient,
  post,
  put,
  findAllByPersonId,
};
