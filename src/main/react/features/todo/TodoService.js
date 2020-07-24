import { WorkDayClient } from "../../clients/WorkDayClient";
import { SickDayClient } from "../../clients/SickDayClient";
import { HolidayClient } from "../../clients/HolidayClient";
import { ExpenseClient } from "../../clients/ExpenseClient";

const updateStatusWorkDay = (id, status) =>
  WorkDayClient.get(id).then(res =>
    WorkDayClient.put(id, {
      ...res,
      assignmentCode: res.assignment.code,
      status
    })
  );

const updateStatusSickDay = (id, status) =>
  SickDayClient.get(id).then(res => SickDayClient.put(id, { ...res, status }));

const updateStatusHoliDay = (id, status) =>
  HolidayClient.get(id).then(res => HolidayClient.put(id, { ...res, status }));

const updateStatusExpense = (id, status) =>
  ExpenseClient.get(id).then(res =>
    ExpenseClient.put(id, res.type, {
      ...res,
      personCode: res.person.code,
      status
    })
  );

export const updateStatus = (status, item) => {
  if (item.type === "WORKDAY") return updateStatusWorkDay(item.id, status);
  if (item.type === "SICKDAY") return updateStatusSickDay(item.id, status);
  if (item.type === "HOLIDAY") return updateStatusHoliDay(item.id, status);
  if (item.type === "EXPENSE") return updateStatusExpense(item.id, status);
  return null;
};
