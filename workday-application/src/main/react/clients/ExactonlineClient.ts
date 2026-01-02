import NonInternalizingClient from '../utils/NonInternalizingClient';

const path = '/api/exactonline';
const resourceClient = NonInternalizingClient(path);

const authorizeUrl = `${path}/authorize?redirect_url=/exactonline`;
const status = () => resourceClient.get('status');
const accounts = () => resourceClient.get('accounts');

export const ExactonlineClient = {
  status,
  accounts,
  authorizeUrl,
};
