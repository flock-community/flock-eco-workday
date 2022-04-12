import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core/src/main/react/clients/utils.ts";

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
