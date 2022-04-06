import moment from "moment";
import InternalizingClient from "../utils/InternalizingClient.ts";

const internalize = (it) => ({
  ...it,
  date: moment(it.date),
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
  if (type === "COST") {
    return costExpenseClient.post(item);
  }
  if (type === "TRAVEL") {
    return travelExpenseClient.post(item);
  }

  throw Error(`Unknown expense type: ${type}`);
};

const put = (id, type, item) => {
  if (type === "COST") {
    return costExpenseClient.put(id, item);
  }
  if (type === "TRAVEL") {
    return travelExpenseClient.put(id, item);
  }

  throw Error(`Unknown expense type: ${type}`);
};

export const ExpenseClient = {
  ...resourceClient,
  post,
  put,
  findAllByPersonId,
};
