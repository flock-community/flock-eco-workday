import { checkResponse, ResourceClient, validateResponse } from '@workday-core';
import InternalizingClient from '../utils/InternalizingClient';
import type { Cv, CvForm, CvRevision } from '../wirespec/model';

export type { Cv, CvRevision };

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

export const CvClient = {
  ...internalizingClient,
  revisions,
  revision,
  restore,
};
