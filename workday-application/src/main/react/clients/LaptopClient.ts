import NonInternalizingClient from '../utils/NonInternalizingClient';
import type { LaptopForm } from '../wirespec/model';
import type { PersonLight } from './PersonClient';

/** The person a laptop is handed out to; only the light projection is returned. */
export type LaptopPerson = PersonLight & {
  fullName: string;
  active: boolean;
};

export type Laptop = {
  id: number;
  code: string;
  name: string;
  serialNumber: string;
  contractSigned: boolean;
  person: LaptopPerson | null;
};

// Request body is the generated wirespec contract; keep the alias for call sites.
export type LaptopRequest = LaptopForm;

const path = '/api/laptops';

export const LAPTOP_PAGE_SIZE = 15;

const nonInternalizingClient = NonInternalizingClient<LaptopRequest, Laptop>(
  path,
);

const findAllByPersonId = (personId: string, page = 0) =>
  nonInternalizingClient.queryByPage(
    { page, size: LAPTOP_PAGE_SIZE, sort: 'name,asc' },
    { personId },
  );

export const LaptopClient = {
  ...nonInternalizingClient,
  findAllByPersonId,
};
