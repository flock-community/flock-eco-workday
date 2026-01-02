import dayjs from 'dayjs';
import {
  type CostExpense,
  type Expense,
  ExpenseType,
  type TravelExpense,
} from '../models/Expense';
import { Status } from '../models/Status';
import InternalizingClient from '../utils/InternalizingClient';
import type {
  CostExpenseInput,
  Expense as ExpenseApi,
  Status as StatusApi,
  TravelExpenseInput,
  UUID,
} from '../wirespec/Models';
import { ISO_8601_DATE } from './util/DateFormats';

const externalizeStatus = (status: Status): StatusApi => {
  switch (status) {
    case Status.APPROVED:
      return 'APPROVED';
    case Status.DONE:
      return 'DONE';
    case Status.REJECTED:
      return 'REJECTED';
    case Status.REQUESTED:
      return 'REQUESTED';
    default:
      throw Error(`Could not internalize Status with value ${status}`);
  }
};

const internalizeStatus = (status: StatusApi): Status => {
  switch (status) {
    case 'APPROVED':
      return Status.APPROVED;
    case 'DONE':
      return Status.DONE;
    case 'REJECTED':
      return Status.REJECTED;
    case 'REQUESTED':
      return Status.REQUESTED;
    default:
      throw Error(`Could not internalize Status with value ${status}`);
  }
};

//TODO ensure wirespec exposes types from generated Typescript files
export const emptyPersonWithUUID = (personId: UUID) => ({
  uuid: personId,
  id: 0,
  email: '',
  firstname: '',
  lastname: '',
  fullName: '',
  number: '',
  birthdate: null,
  joinDate: null,
  position: '',
  user: '',
  active: false,
  lastActiveAt: new Date(),
  reminders: false,
  receiveEmail: false,
  googleDriveId: '',
});

const internalize = (it: ExpenseApi): CostExpense | TravelExpense => {
  if (it.expenseType === 'COST') {
    return internalizeCost(it);
  }

  if (it.expenseType === 'TRAVEL') {
    return internalizeTravel(it);
  }

  throw Error("ExpenseApi is not conform the specs. Can't internalize");
};

const internalizeCost = (it: ExpenseApi): CostExpense => {
  const costDetails = it.costDetails;
  if (costDetails === undefined) {
    throw Error('CostDetails are not set for this cost expense');
  }

  return {
    id: it.id,
    description: it.description,
    date: dayjs(it.date, ISO_8601_DATE),
    person: emptyPersonWithUUID(it.personId), //resolve me
    expenseType: ExpenseType.COST,
    status: internalizeStatus(it.status),
    amount: costDetails.amount,
    files: costDetails.files.map((it) => ({
      file: it.file,
      name: it.name,
    })),
  };
};

const internalizeTravel = (it: ExpenseApi): TravelExpense => {
  const travelDetails = it.travelDetails;
  if (travelDetails === undefined) {
    throw Error('TravelDetails are not set for this travel expense');
  }
  return {
    id: it.id,
    description: it.description,
    date: dayjs(it.date, ISO_8601_DATE),
    person: emptyPersonWithUUID(it.personId),
    allowance: travelDetails?.allowance,
    expenseType: ExpenseType.TRAVEL,
    amount: travelDetails.allowance * travelDetails.distance,
    distance: travelDetails.distance,
    files: [],
    status: internalizeStatus(it.status),
  };
};
const serializeCost = (it: CostExpense): CostExpenseInput => ({
  amount: it.amount,
  description: it.description,
  files: it.files,
  status: it.status,
  personId: it.person.uuid,
  date: it.date.format(ISO_8601_DATE),
});

const serializeTravel = (it: TravelExpense): TravelExpenseInput => ({
  allowance: it.allowance,
  description: it.description,
  distance: it.distance,
  personId: it.person.uuid,
  status: externalizeStatus(it.status),
  date: it.date.format(ISO_8601_DATE),
});

const path = '/api/expenses';
const travelPath = '/api/expenses-travel';
const costPath = '/api/expenses-cost';

const resourceClient = InternalizingClient<
  void,
  ExpenseApi,
  CostExpense | TravelExpense
>(path, internalize);
const travelExpenseClient = InternalizingClient<
  TravelExpenseInput,
  ExpenseApi,
  TravelExpense
>(travelPath, internalizeTravel);
const costExpenseClient = InternalizingClient<
  CostExpenseInput,
  ExpenseApi,
  CostExpense
>(costPath, internalizeCost);

export const EXPENSE_PAGE_SIZE: number = 5;

// TODO: Deprecated method, should use findAllByPersonIdNEW (https://flock.atlassian.net/browse/WRK-176)
const findAllByPersonId = (personId, page, pageSize = EXPENSE_PAGE_SIZE) =>
  resourceClient.queryByPage(
    {
      page,
      size: pageSize,
      sort: 'date,desc',
    },
    {
      personId,
    },
  );

// TODO: should replace findAllByPersonId. When it does rename back to findAllByPersonId. (https://flock.atlassian.net/browse/WRK-176)
const findAllByPersonIdNEW = async (
  personId: string,
  page: number,
  pageSize: number | null = EXPENSE_PAGE_SIZE,
): Promise<{
  count: number;
  list: Expense[];
}> => {
  const resultPromise = await resourceClient.queryByPage(
    {
      page,
      size: pageSize ?? 100,
      sort: 'date,desc',
    },
    { personId },
  );
  return { count: resultPromise.list.length, list: resultPromise.list };
};

const post = (
  item: CostExpense | TravelExpense,
): Promise<CostExpense> | Promise<TravelExpense> => {
  if (item.expenseType === ExpenseType.COST) {
    return costExpenseClient.post(serializeCost(item as CostExpense));
  }
  if (item.expenseType === ExpenseType.TRAVEL) {
    return travelExpenseClient.post(serializeTravel(item as TravelExpense));
  }

  throw Error(`Unknown expense type: ${item}`);
};

const put = (
  id: string,
  item: Expense,
): Promise<CostExpense> | Promise<TravelExpense> => {
  if (item.expenseType === ExpenseType.COST) {
    const expense: CostExpense = item;
    return costExpenseClient.put(id, serializeCost(expense));
  }
  if (item.expenseType === ExpenseType.TRAVEL) {
    const expense: TravelExpense = item as TravelExpense;
    return travelExpenseClient.put(id, serializeTravel(expense));
  }

  throw Error(`Unknown expense type: ${item}`);
};

export const ExpenseClient = {
  ...resourceClient,
  post,
  put,
  findAllByPersonId,
  findAllByPersonIdNEW,
};
