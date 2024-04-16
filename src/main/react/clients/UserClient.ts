import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core/src/main/react/clients/utils";

const path = "/login";

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
  getType,
};
