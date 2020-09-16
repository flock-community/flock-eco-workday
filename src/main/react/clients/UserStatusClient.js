import { addError } from "../hooks/ErrorHook";
import { ExtractJSON } from "../utils/ResourceClient.ts";

const path = "/login/status";

const get = () => {
  const opts = {
    method: "GET"
  };

  return fetch(path, opts)
    .then(ExtractJSON)
    .catch(e => addError(e.message));
};

export const UserStatusClient = {
  get
};
