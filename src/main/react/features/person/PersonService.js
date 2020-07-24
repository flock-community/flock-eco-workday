import { ResourceClient } from "../../utils/ResourceClient";
import { PageableClient } from "../../utils/PageableClient";

const path = "/api/persons";
const resourceClient = ResourceClient(path);
const pageableClient = PageableClient(path);

export const PersonService = {
  ...resourceClient,
  ...pageableClient
};
