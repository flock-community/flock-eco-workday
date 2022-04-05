import {ResourceClient} from "../utils/ResourceClient";
import {PageableClient} from "../utils/PageableClient";

export type Person = {
  id: number;
  uuid: string;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  number: string;
  position: string;
  user: string;
  active: boolean;
  lastActiveAt: Date;
};

export type PersonRaw = {
  uuid: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  number: string;
  position: string;
  user: string;
  active: boolean;
  lastActiveAt: string;
};

const path = "/api/persons";

const internalize = (json: PersonRaw): Person => ({
  ...json, lastActiveAt: new Date(json.lastActiveAt)
})

const resourceClient = ResourceClient<string, Person, Person, PersonRaw>(path, internalize);
const pageableClient = PageableClient<Person, Person>(path);

export const PersonClient = {
  ...resourceClient,
  ...pageableClient,
  me: () => resourceClient.get("me"),
};
