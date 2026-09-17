import { ResourceClient } from '@workday-core';
import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';
import type { LaptopForm } from '../wirespec/model';
import type { PersonLight } from './PersonClient';
import { ISO_8601_DATE } from './util/DateFormats';

/** The person a laptop is handed out to; only the light projection is returned. */
export type LaptopPerson = PersonLight & {
  fullName: string;
  active: boolean;
};

// The type we receive from the backend
type LaptopRaw = {
  id: number;
  code: string;
  name: string;
  serialNumber: string;
  contractSigned: boolean;
  purchaseDate: string | null;
  person: LaptopPerson | null;
};

// The type we use in the frontend
export type Laptop = Omit<LaptopRaw, 'purchaseDate'> & {
  purchaseDate: Dayjs | null;
};

// Request body is the generated wirespec contract; keep the alias for call sites.
export type LaptopRequest = LaptopForm;

const path = '/api/laptops';

export const LAPTOP_PAGE_SIZE = 15;

const internalize = (raw: LaptopRaw): Laptop => ({
  ...raw,
  purchaseDate: raw.purchaseDate
    ? dayjs(raw.purchaseDate, ISO_8601_DATE)
    : null,
});

const internalizingClient = InternalizingClient<
  LaptopRequest,
  LaptopRaw,
  Laptop
>(path, internalize);

const findAllByPersonId = (personId: string, page = 0) =>
  internalizingClient.queryByPage(
    { page, size: LAPTOP_PAGE_SIZE, sort: 'name,asc' },
    { personId },
  );

/** The laptops handed out to the person of the current user, sorted by name. */
const findAllMine = (): Promise<Laptop[]> =>
  ResourceClient<LaptopRaw, LaptopRequest>(`${path}/me`)
    .all()
    .then((res) => res.body.map(internalize));

export const LaptopClient = {
  ...internalizingClient,
  findAllByPersonId,
  findAllMine,
};
