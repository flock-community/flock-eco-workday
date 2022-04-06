import { validateResponse } from "../utils/new/utils.ts";
import { checkResponse } from "../utils/new/ResourceClient.ts";

const path = "/login/status";

const get = () => {
  const opts = {
    method: "GET",
  };

  return fetch(path, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export const UserStatusClient = {
  get,
};
