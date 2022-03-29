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
  lastActiveAt: Date;
};

const path = "/api/persons";

const resourceClient = ResourceClient<string, Person>(path, (json) => ({
  ...json, lastActiveAt: new Date(json.lastActiveAt)
}));
const pageableClient = PageableClient<Person>(path);

export const PersonClient = {
  ...resourceClient,
  ...pageableClient,
  me: () => resourceClient.get("me"),
};
