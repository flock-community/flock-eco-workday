import {ExtractJSON, ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";
import {addError} from "../hooks/ErrorHook";

export type Client = {
  id: number;
  code: string;
  name: string;
}

const path = "/api/clients";

const resourceClient = ResourceClient<string, Client>(path);
const pageableClient = PageableClient<Client>(path);

export const findByCode = (code: string) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/${code}`, opts)
    .then(json => ExtractJSON<Client>(json))
    .catch((e) => addError(e.message));
};

export const ClientClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode,
};
