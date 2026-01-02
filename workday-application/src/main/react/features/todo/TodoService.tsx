import { ExpenseClient } from '../../clients/ExpenseClient';
import { LeaveDayClient } from '../../clients/LeaveDayClient';
import { SickDayClient } from '../../clients/SickDayClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { WorkDayClient } from '../../clients/WorkDayClient';
import { Status } from '../../models/Status';
import type { StatusProps } from '../../types';
import type { Todo, UUID } from '../../wirespec/Models';

const updateStatusWorkDay = async (id: UUID, status: Status) => {
  const res = await WorkDayClient.get(id);
  await WorkDayClient.put(id, {
    ...res,
    assignmentCode: res.assignment.code,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
  });
};

const updateStatusSickDay = async (id: UUID, status: Status) => {
  const res = await SickDayClient.get(id);
  await SickDayClient.put(id, {
    ...res,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
  });
};

const updateStatusLeaveDay = async (id: UUID, status: Status) => {
  const res = await LeaveDayClient.get(id);
  await LeaveDayClient.put(id, {
    ...res,
    status,
    from: res.from.format(ISO_8601_DATE),
    to: res.to.format(ISO_8601_DATE),
    days: res.type === 'HOLIDAY' ? res.days : undefined,
  });
};

const convertStatus = (status: StatusProps): Status => {
  switch (status) {
    case 'APPROVED':
      return Status.APPROVED;
    case 'REJECTED':
      return Status.REJECTED;
    case 'REQUESTED':
      return Status.REQUESTED;
    default:
      throw Error(`Could not internalize Status with value ${status}`);
  }
};
const updateStatusExpense = async (id: UUID, status: Status) => {
  const res = await ExpenseClient.get(id);
  await ExpenseClient.put(id, {
    ...res,
    status,
  });
};

export const updateStatus = (status: StatusProps, item: Todo) => {
  let updateFunction: (id: UUID, status: Status) => Promise<void>;

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

  return updateFunction(item.id, convertStatus(status));
};
