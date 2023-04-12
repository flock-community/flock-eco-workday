import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core/src/main/react/clients/utils.ts";

const path = "/login";

const getStatus = () => {
  const opts = {
    method: "GET",
  };

  return fetch(`${path}/status`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

const getType = () => {
  const opts = {
    method: "GET",
  };

  return fetch(`${path}/type`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export const UserClient = {
  getStatus,
  getType,
};
