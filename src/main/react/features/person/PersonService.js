import { ResourceClient } from "../../utils/ResourceClient.ts";
import { PageableClient } from "../../utils/PageableClient.ts";

const path = "/api/persons";
const resourceClient = ResourceClient(path);
const pageableClient = PageableClient(path);

export const PersonService = {
  ...resourceClient,
  ...pageableClient
};
