import dayjs from 'dayjs';
import NonInternalizingClient from '../utils/NonInternalizingClient';
import type {
  CostExpenseInput,
  Expense,
  TravelExpenseInput,
  UUID,
} from '../wirespec/model';
import { ISO_8601_DATE } from './util/DateFormats';

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

const serializeCost = (it: Expense): CostExpenseInput => {
  return {
    amount: it?.costDetails?.amount,
    description: it.description,
    files: it?.costDetails?.files ?? [],
    status: it.status,
    personId: it.personId,
    date: dayjs(it.date).format(ISO_8601_DATE),
  };
};

const serializeTravel = (it: Expense): TravelExpenseInput => ({
  allowance: it.travelDetails.allowance,
  description: it.description,
  distance: it.travelDetails.distance,
  personId: it.personId,
  status: it.status,
  date: dayjs(it.date).format(ISO_8601_DATE),
});

const path = '/api/expenses';
const travelPath = '/api/expenses-travel';
const costPath = '/api/expenses-cost';

const resourceClient = NonInternalizingClient<void, Expense>(path);
const travelExpenseClient = NonInternalizingClient<TravelExpenseInput, Expense>(
  travelPath,
);
const costExpenseClient = NonInternalizingClient<CostExpenseInput, Expense>(
  costPath,
);

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
      "pageable.size": pageSize,
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

const post = (item: Expense): Promise<Expense> => {
  if (item.expenseType === 'COST') {
    return costExpenseClient.post(serializeCost(item));
  }
  if (item.expenseType === 'TRAVEL') {
    return travelExpenseClient.post(serializeTravel(item));
  }

  throw new Error(`Unknown expense type: ${item}`);
};

const put = (id: string, item: Expense): Promise<Expense> => {
  if (item.expenseType === 'COST') {
    return costExpenseClient.put(id, serializeCost(item));
  }
  if (item.expenseType === 'TRAVEL') {
    return travelExpenseClient.put(id, serializeTravel(item));
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
