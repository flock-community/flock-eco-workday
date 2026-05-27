import NonInternalizingClient from '../utils/NonInternalizingClient';
import type { ClientForm } from '../wirespec/model';

export type Client = {
  id: number;
  code: string;
  name: string;
};

// Request body is the generated wirespec contract; keep the alias for call sites.
export type ClientRequest = ClientForm;

const path = '/api/clients';

const nonInternalizingClient = NonInternalizingClient<ClientRequest, Client>(
  path,
);

export const ClientClient = {
  ...nonInternalizingClient,
};
