import { ResourceClient } from '@workday-core';
import InternalizingClient from '../utils/InternalizingClient';
import type { Cv, CvForm, CvImport, CvImportForm } from '../wirespec/model';

export type { Cv, CvImport };

// Request body is the generated wirespec contract; keep the alias for call sites.
export type CvRequest = CvForm;

const path = '/api/cvs';

export const CV_PAGE_SIZE = 15;

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

export const CvClient = {
  ...internalizingClient,
  importPdf,
};
