import { ResourceClient } from "../utils/ResourceClient";
import { PageableClient } from "../utils/PageableClient";

export type Person = {
  uuid: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  number: string;
  position: string;
  user: string;
  active: boolean;
};

const path = "/api/persons";

const resourceClient = ResourceClient<string, Person>(path);
const pageableClient = PageableClient<Person>(path);

export const PersonClient = {
  ...resourceClient,
  ...pageableClient,
  me: () => resourceClient.get("me"),
};
