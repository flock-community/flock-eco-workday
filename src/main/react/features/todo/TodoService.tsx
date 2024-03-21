import { WorkDayClient } from "../../clients/WorkDayClient";
import { SickDayClient } from "../../clients/SickDayClient";
import { LeaveDayClient } from "../../clients/LeaveDayClient";
import { ExpenseClient } from "../../clients/ExpenseClient";
import { ISO_8601_DATE } from "../../clients/util/DateFormats";
import { Todo, UUID } from "../../wirespec/Models";
import { Status } from "../../models/Status";
import { StatusProps } from "../../types";

const updateStatusWorkDay = async (id: UUID, status: Status) => {
  const res = await WorkDayClient.get(id.value);
  await WorkDayClient.put(id.value, {
    ...res,
    assignmentCode: res.assignment.code,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
  });
};

const updateStatusSickDay = async (id: UUID, status: Status) => {
  const res = await SickDayClient.get(id.value);
  await SickDayClient.put(id.value, {
    ...res,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
  });
};

const updateStatusLeaveDay = async (id: UUID, status: Status) => {
  const res = await LeaveDayClient.get(id.value);
  await LeaveDayClient.put(id.value, {
    ...res,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
    days: res.type === "HOLIDAY" ? res.days : undefined,
  });
};

const convertStatus = (status: StatusProps): Status => {
  switch (status) {
    case "APPROVED":
      return Status.APPROVED;
    case "REJECTED":
      return Status.REJECTED;
    case "REQUESTED":
      return Status.REQUESTED;
    default:
      throw Error("Could not internalize Status with value " + status);
  }
};
const updateStatusExpense = async (id: UUID, status: Status) => {
  const res = await ExpenseClient.get(id.value);
  await ExpenseClient.put(id.value, {
    ...res,
    status,
  });
};

export const updateStatus = (status: StatusProps, item: Todo) => {
  let updateFunction: (id: UUID, status: Status) => Promise<void>;

  switch (item.todoType) {
    case "WORKDAY":
      updateFunction = updateStatusWorkDay;
      break;
    case "SICKDAY":
      updateFunction = updateStatusSickDay;
      break;
    case "HOLIDAY":
    case "PLUSDAY":
    case "PAID_PARENTAL_LEAVE":
    case "UNPAID_PARENTAL_LEAVE":
      updateFunction = updateStatusLeaveDay;
      break;
    case "EXPENSE":
      updateFunction = updateStatusExpense;
      break;
  }

  return updateFunction(item.id, convertStatus(status));
};
