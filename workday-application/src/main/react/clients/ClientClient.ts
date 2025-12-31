import NonInternalizingClient from '../utils/NonInternalizingClient';

export type Client = {
  id: number;
  code: string;
  name: string;
};

export type ClientRequest = {
  id?: number;
  code?: string;
  name: string;
};

const path = '/api/clients';

const nonInternalizingClient = NonInternalizingClient<ClientRequest, Client>(
  path,
);

export const ClientClient = {
  ...nonInternalizingClient,
};
