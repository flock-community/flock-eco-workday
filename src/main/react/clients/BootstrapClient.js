import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core/src/main/react/clients/utils.ts";

const path = "/bootstrap";

const getBootstrap = () => {
  const opts = {
    method: "GET",
  };

  return fetch(`${path}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export const BootstrapClient = {
  getBootstrap,
};
