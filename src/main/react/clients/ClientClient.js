import { ExtractJSON, ResourceClient } from "../utils/ResourceClient.ts";
import { PageableClient } from "../utils/PageableClient.ts";
import { addError } from "../hooks/ErrorHook";

const path = "/api/clients";

const resourceClient = ResourceClient(path);
const pageableClient = PageableClient(path);

export const findByCode = code => {
  const opts = {
    method: "GET"
  };
  return fetch(`${path}/${code}`, opts)
    .then(ExtractJSON)
    .catch(e => addError(e.message));
};

export const ClientClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode
};
