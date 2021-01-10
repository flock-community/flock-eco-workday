import { ResourceClient } from "@flock-community/flock-eco-core/src/main/react/clients";

const path = "/api/todos";

const resourceClient = ResourceClient(path);

export const TodoClient = {
  ...resourceClient,
};
