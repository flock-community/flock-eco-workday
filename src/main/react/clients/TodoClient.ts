import { ResourceClient } from "@flock-community/flock-eco-core";

const path = "/api/todos";

const resourceClient = ResourceClient(path);

export const TodoClient = {
  ...resourceClient,
};
