import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core/src/main/react/clients/utils";

const path = "/bootstrap";

export type BootstrapData = {
  authorities: string[];
  isLoggedIn: boolean;
  userId?: string;
  personId?: string;
};
const getBootstrap = () => {
  const opts = {
    method: "GET",
  };

  return fetch(`${path}`, opts)
    .then(validateResponse<BootstrapData>)
    .then(checkResponse)
    .then((res) => res.body);
};

export const BootstrapClient = {
  getBootstrap,
};
