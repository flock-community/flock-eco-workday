import dayjs from "dayjs";
import InternalizingClient from "../utils/InternalizingClient.ts";
import { ISO_8601_DATE } from "./util/DateFormats.ts";

const internalize = (it) => ({
  ...it,
  date: dayjs(it.date, ISO_8601_DATE),
});

const serialize = (it) => ({
  ...it,
  date: typeof it.date === "string" ? it.date : it.date.format(ISO_8601_DATE),
});

const path = "/api/expenses";
const travelPath = "/api/expenses-travel";
const costPath = "/api/expenses-cost";

const resourceClient = InternalizingClient(path, internalize);
const travelExpenseClient = InternalizingClient(travelPath, internalize);
const costExpenseClient = InternalizingClient(costPath, internalize);

export const EXPENSE_PAGE_SIZE = 5;

const findAllByPersonId = (personId, page) =>
  resourceClient.queryByPage(
    {
      page,
      size: EXPENSE_PAGE_SIZE,
      sort: "date,desc",
    },
    {
      personId,
    }
  );

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
