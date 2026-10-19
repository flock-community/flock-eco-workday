import { checkResponse, ResourceClient, validateResponse } from '@workday-core';
import InternalizingClient from '../utils/InternalizingClient';
import type {
  Cv,
  CvForm,
  CvRevision,
  CvSync,
  CvSyncAction,
  CvSyncItem,
} from '../wirespec/model';

export type { Cv, CvRevision, CvSync, CvSyncAction, CvSyncItem };

// Request body is the generated wirespec contract; keep the alias for call sites.
export type CvRequest = CvForm;

const path = '/api/cvs';

const internalizingClient = InternalizingClient<CvRequest, Cv, Cv>(
  path,
  (it) => it,
);

/** The earlier versions of a CV, latest first. */
const revisions = (code: string): Promise<CvRevision[]> =>
  ResourceClient<CvRevision, never>(`${path}/${code}/revisions`)
    .all()
    .then((res) => res.body);

/** A CV as it was in an earlier version. */
const revision = (code: string, id: string): Promise<Cv> =>
  ResourceClient<Cv, never>(`${path}/${code}/revisions`)
    .get(id)
    .then((res) => res.body);

/** Makes an earlier version the current one. */
const restore = (code: string, id: string): Promise<Cv> =>
  fetch(`${path}/${code}/revisions/${id}/restore`, { method: 'POST' })
    .then((it) => validateResponse<Cv>(it))
    .then(checkResponse)
    .then((res) => res.body);

/** Makes a CV the base in its language; the other CVs in it become copies of it. */
const makeBase = (code: string): Promise<Cv> =>
  fetch(`${path}/${code}/base`, { method: 'POST' })
    .then((it) => validateResponse<Cv>(it))
    .then(checkResponse)
    .then((res) => res.body);

/** How a copy stands against its base: what the base changed, and what the copy tailored. */
const sync = (code: string): Promise<CvSync> =>
  fetch(`${path}/${code}/sync`)
    .then((it) => validateResponse<CvSync>(it))
    .then(checkResponse)
    .then((res) => res.body);

/** Takes the base's version of a field of a copy, keeps the copy's, or puts it in the base. */
const syncField = (
  code: string,
  address: string,
  action: CvSyncAction,
): Promise<Cv> =>
  fetch(`${path}/${code}/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address, action }),
  })
    .then((it) => validateResponse<Cv>(it))
    .then(checkResponse)
    .then((res) => res.body);

export const CvClient = {
  ...internalizingClient,
  revisions,
  revision,
  restore,
  makeBase,
  sync,
  syncField,
};
