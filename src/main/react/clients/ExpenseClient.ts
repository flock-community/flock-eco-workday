import dayjs from "dayjs";
import InternalizingClient from "../utils/InternalizingClient";
import {ISO_8601_DATE} from "./util/DateFormats";
import {CostExpense, Expense, ExpenseType, TravelExpense} from "../models/Expense";

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

export const EXPENSE_PAGE_SIZE: number = 5;

// TODO: Deprecated method, should use findAllByPersonIdNEW (https://flock.atlassian.net/browse/WRK-176)
const findAllByPersonId = (personId, page, pageSize = EXPENSE_PAGE_SIZE) =>
    resourceClient.queryByPage(
        {
          page,
          size: pageSize,
          sort: "date,desc",
        },
        {
          personId,
        }
    );

// TODO: should replace findAllByPersonId. When it does rename back to findAllByPersonId. (https://flock.atlassian.net/browse/WRK-176)
const findAllByPersonIdNEW = async (personId: string, page: number, pageSize: number | null = EXPENSE_PAGE_SIZE): Promise<{ count: number, list: Expense[] }> => {
  const listOfExpenseObjects: Expense[] = [];
  const resultPromise = await resourceClient.queryByPage({
        page, size: pageSize ?? undefined, sort: "date,desc", },
        { personId }
  );
  resultPromise.list.map((expenseJson) => {
    listOfExpenseObjects.push(
        expenseJson.type === ExpenseType.TRAVEL ? TravelExpense.fromJson(expenseJson) : CostExpense.fromJson(expenseJson)
    );
  });

  return { count: listOfExpenseObjects.length, list: listOfExpenseObjects };
}

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
  findAllByPersonIdNEW
};
