import { checkResponse, ResourceClient, validateResponse } from '@workday-core';
import InternalizingClient from '../utils/InternalizingClient';
import type {
  Cv,
  CvForm,
  CvImport,
  CvImportForm,
  CvRevision,
} from '../wirespec/model';

export type { Cv, CvImport, CvRevision };

// Request body is the generated wirespec contract; keep the alias for call sites.
export type CvRequest = CvForm;

const path = '/api/cvs';

const internalizingClient = InternalizingClient<CvRequest, Cv, Cv>(
  path,
  (it) => it,
);

/** Reads a file as base64, without the `data:...;base64,` prefix. */
const toBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(String(reader.result).replace(/^data:[^,]*,/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/**
 * Reads a CV in the Flock template from a PDF. Nothing is stored: the result is a
 * draft to check in the editor and save.
 */
const importPdf = (file: Blob): Promise<CvImport> =>
  toBase64(file)
    .then((pdf) =>
      ResourceClient<CvImport, CvImportForm>(`${path}/import`).post({ pdf }),
    )
    .then((res) => res.body);

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
  importPdf,
};
