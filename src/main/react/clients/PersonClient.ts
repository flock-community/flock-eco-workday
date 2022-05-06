import InternalizingClient from "../utils/InternalizingClient";

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
  fullName: string;
  number: string;
  position: string;
  user: string;
  active: boolean;
  lastActiveAt: string;
};

export type PersonRequest = {
  id?: number;
  uuid?: string;
  lastName: string;
  email: string;
  position: string;
  number?: number;
  active: boolean;
  lastActiveAt?: string; // FIXME
  reminders: boolean;
  user: any; // FIXME
};

const path = "/api/persons";

export const internalize = (json: PersonRaw): Person => ({
  ...json,
  lastActiveAt: new Date(json.lastActiveAt),
});

const internalizingClient = InternalizingClient<
  PersonRequest,
  PersonRaw,
  Person
>(path, internalize);

const findAllByFirstname = (pageable, firstname: string | null) =>
  internalizingClient.queryByPage(pageable, { firstname });

export const PersonClient = {
  ...internalizingClient,
  me: () => internalizingClient.get("me"),
  findAllByFirstname,
};
