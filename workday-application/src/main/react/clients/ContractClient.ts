import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';
import type { Person } from './PersonClient';
import { ISO_8601_DATE } from './util/DateFormats';

const path = '/api/contracts';
const internalPath = `${path}-internal`;
const externalPath = `${path}-external`;
const managementPath = `${path}-management`;
const servicePath = `${path}-service`;

export const CONTRACT_PAGE_SIZE = 5;

export type Contract = {
  id: number;
  code: string;
  from: Dayjs;
  to?: Dayjs;
  person: Person;
  type: 'INTERNAL' | 'EXTERNAL' | 'MANAGEMENT' | 'SERVICE';
};

export type ContractRaw = {
  id: number;
  code: string;
  from: string;
  to?: string;
  person: Person;
  type: 'INTERNAL' | 'EXTERNAL' | 'MANAGEMENT' | 'SERVICE';
};

export type ContractRequest = {
  from: string;
  to?: string;
};

const internalize = (it) => ({
  ...it,
  from: it.from && dayjs(it.from, ISO_8601_DATE),
  to: it.to && dayjs(it.to, ISO_8601_DATE),
});

const clients = new Map<string, any>();

clients.set(
  'general',
  InternalizingClient<ContractRequest, Contract, ContractRaw>(
    path,
    internalize,
  ),
);
clients.set(
  'INTERNAL',
  InternalizingClient<ContractRequest, Contract, ContractRaw>(
    internalPath,
    internalize,
  ),
);
clients.set(
  'EXTERNAL',
  InternalizingClient<ContractRequest, Contract, ContractRaw>(
    externalPath,
    internalize,
  ),
);
clients.set(
  'MANAGEMENT',
  InternalizingClient<ContractRequest, Contract, ContractRaw>(
    managementPath,
    internalize,
  ),
);
clients.set(
  'SERVICE',
  InternalizingClient<ContractRequest, Contract, ContractRaw>(
    servicePath,
    internalize,
  ),
);

const findAllByPersonId = (personId: string, page: number) =>
  clients.get('general')?.queryByPage(
    {
      page,
      size: CONTRACT_PAGE_SIZE,
      sort: 'from,desc',
    },
    { personId: personId },
  );

const findAllByToBetween = (start: Date, end: Date) => {
  const startString = start.toISOString().substring(0, 10);
  const endString = end.toISOString().substring(0, 10);

  return clients.get('general').query({ start: startString, end: endString });
};

const findAllByToAfterOrToNull = (
  to: Date,
  pageable: { size: number; page: number; sort: string[] },
) => {
  const dateString = to.toISOString().substring(0, 10);

  return clients.get('general').queryByPage(pageable, { to: dateString });
};

const put = (id, type, item) => clients.get(type).put(id, item);

const post = (type, item) => clients.get(type).post(item);

export const ContractClient = {
  ...clients.get('general'),
  post,
  put,
  findAllByToAfterOrToNull,
  findAllByPersonId,
  findAllByToBetween,
};
