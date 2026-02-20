import { checkResponse, validateResponse } from '@workday-core/clients/utils';

export type ApiKeyAccount = {
  id: string;
  type: string;
  created: string | null;
  label: string | null;
};

export type GeneratedKey = {
  id: string;
  key: string;
  label: string | null;
};

type AccountResponse = {
  id: string;
  type: string;
  created: string | null;
  label?: string | null;
  provider?: string | null;
};

function isKeyAccount(account: AccountResponse): boolean {
  return account.type === 'KEY';
}

const fetchMyKeys = (): Promise<ApiKeyAccount[]> =>
  fetch('/api/users/me/accounts')
    .then(validateResponse<AccountResponse[]>)
    .then(checkResponse)
    .then((res) =>
      res.body.filter(isKeyAccount).map((a) => ({
        id: a.id,
        type: a.type,
        created: a.created,
        label: a.label ?? null,
      })),
    );

const generateKey = (label: string): Promise<GeneratedKey> =>
  fetch('/api/user-accounts/generate-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ label }),
  })
    .then(validateResponse<GeneratedKey>)
    .then(checkResponse)
    .then((res) => res.body);

const revokeKey = (id: string): Promise<void> =>
  fetch('/api/user-accounts/revoke-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: Number(id) }),
  }).then((res) => {
    if (!res.ok) throw new Error('Failed to revoke key');
  });

export const ApiKeyClient = {
  fetchMyKeys,
  generateKey,
  revokeKey,
};
