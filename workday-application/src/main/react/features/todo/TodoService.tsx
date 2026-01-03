import { ExpenseClient } from '../../clients/ExpenseClient';
import { LeaveDayClient } from '../../clients/LeaveDayClient';
import { SickDayClient } from '../../clients/SickDayClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { WorkDayClient } from '../../clients/WorkDayClient';
import type { Todo, WorkDayStatus } from '../../wirespec/model';

const updateStatusWorkDay = async (id: string, status: WorkDayStatus) => {
  const res = await WorkDayClient.get(id);
  await WorkDayClient.put(id, {
    ...res,
    assignmentCode: res.assignment.code,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
  });
};

const updateStatusSickDay = async (id: string, status: WorkDayStatus) => {
  const res = await SickDayClient.get(id);
  await SickDayClient.put(id, {
    ...res,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
  });
};

const updateStatusLeaveDay = async (id: string, status: WorkDayStatus) => {
  const res = await LeaveDayClient.get(id);
  await LeaveDayClient.put(id, {
    ...res,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
    days: res.type === 'HOLIDAY' ? res.days : undefined,
  });
};

const updateStatusExpense = async (id: string, status: WorkDayStatus) => {
  const res = await ExpenseClient.get(id);
  await ExpenseClient.put(id, {
    ...res,
    status,
  });
};

export const updateStatus = (status: WorkDayStatus, item: Todo) => {
  let updateFunction: (id: string, status: WorkDayStatus) => Promise<void>;

  switch (item.todoType) {
    case 'WORKDAY':
      updateFunction = updateStatusWorkDay;
      break;
    case 'SICKDAY':
      updateFunction = updateStatusSickDay;
      break;
    case 'HOLIDAY':
    case 'PLUSDAY':
    case 'PAID_PARENTAL_LEAVE':
    case 'UNPAID_PARENTAL_LEAVE':
      updateFunction = updateStatusLeaveDay;
      break;
    case 'EXPENSE':
      updateFunction = updateStatusExpense;
      break;
  }

  return updateFunction(item.id, status);
};
