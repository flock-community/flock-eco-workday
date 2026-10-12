import NonInternalizingClient from '../utils/NonInternalizingClient';
import type { ClientForm, ClientLogo } from '../wirespec/model';

export type Client = {
  id: number;
  code: string;
  name: string;
  logo?: ClientLogo;
};

// Request body is the generated wirespec contract; keep the alias for call sites.
export type ClientRequest = ClientForm;

const path = '/api/clients';

export const CLIENT_LOGO_ENDPOINT = `${path}/logos`;

export const clientLogoUrl = (logo: ClientLogo) =>
  `${CLIENT_LOGO_ENDPOINT}/${logo.file}/${encodeURIComponent(logo.name)}`;

const nonInternalizingClient = NonInternalizingClient<ClientRequest, Client>(
  path,
);

export const ClientClient = {
  ...nonInternalizingClient,
};
