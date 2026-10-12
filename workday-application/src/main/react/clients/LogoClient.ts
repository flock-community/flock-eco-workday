import { ResourceClient } from '@workday-core';
import type { Logo, LogoForm } from '../wirespec/model';

export type { Logo };

const path = '/api/logos';
const resource = ResourceClient<Logo, LogoForm>(path);

/** Reads a file as base64, without the `data:...;base64,` prefix. */
export const fileToBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(String(reader.result).replace(/^data:[^,]*,/, ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

/** The image of a logo; the version in the query makes a replaced image load anew. */
const imageUrl = (logo: Pick<Logo, 'id' | 'updatedAt'>) =>
  `${path}/${logo.id}/image?v=${encodeURIComponent(logo.updatedAt)}`;

export const LogoClient = {
  all: () => resource.all().then((res) => res.body),
  create: (body: LogoForm) => resource.post(body).then((res) => res.body),
  update: (id: string, body: LogoForm) =>
    resource.put(id, body).then((res) => res.body),
  delete: (id: string) => resource.delete(id),
  imageUrl,
};
