import { WorkDayClient } from "../../clients/WorkDayClient";
import { SickDayClient } from "../../clients/SickDayClient";
import { HolidayClient } from "../../clients/HolidayClient";
import { ExpenseClient } from "../../clients/ExpenseClient";

const updateStatusWorkDay = async (id, status) => {
  const res = await WorkDayClient.get(id);
  await WorkDayClient.put(id, {
    ...res,
    assignmentCode: res.assignment.code,
    status,
    from: res.from.format("YYYY-MM-DD"),
    to: res.to.format("YYYY-MM-DD"),
  });
};

const updateStatusSickDay = async (id, status) => {
  const res = await SickDayClient.get(id);
  await SickDayClient.put(id, {
    ...res,
    status,
    from: res.from.format("YYYY-MM-DD"),
    to: res.to.format("YYYY-MM-DD"),
  });
};

const updateStatusHoliDay = async (id, status) => {
  const res = await HolidayClient.get(id);
  await HolidayClient.put(id, {
    ...res,
    status,
    from: res.from.format("YYYY-MM-DD"),
    to: res.to.format("YYYY-MM-DD"),
    days: res.type === "HOLIDAY" ? res.days : undefined,
  });
};

const updateStatusExpense = async (id, status) => {
  const res = await ExpenseClient.get(id);
  await ExpenseClient.put(id, res.type, {
    ...res,
    personId: res.person.uuid,
    status,
    from: res.from.format("YYYY-MM-DD"),
    to: res.to.format("YYYY-MM-DD"),
  });
};

export const updateStatus = (status, item) => {
  if (item.type === "WORKDAY") return updateStatusWorkDay(item.id, status);
  if (item.type === "SICKDAY") return updateStatusSickDay(item.id, status);
  if (item.type === "HOLIDAY") return updateStatusHoliDay(item.id, status);
  if (item.type === "PLUSDAY") return updateStatusHoliDay(item.id, status);
  if (item.type === "EXPENSE") return updateStatusExpense(item.id, status);
  if (item.type === "EXPENSE") return updateStatusExpense(item.id, status);
  return null;
};
