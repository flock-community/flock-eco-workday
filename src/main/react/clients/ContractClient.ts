import moment from "moment";
import { Person } from "./PersonClient";
import InternalizingClient from "../utils/InternalizingClient";

const path = "/api/contracts";
const internalPath = `${path}-internal`;
const externalPath = `${path}-external`;
const managementPath = `${path}-management`;
const servicePath = `${path}-service`;

export type Contract = {
  id: number;
  code: string;
  from: moment.Moment;
  to?: moment.Moment;
  person: Person;
  type: "INTERNAL" | "EXTERNAL" | "MANAGEMENT" | "SERVICE";
};

export type ContractRaw = {
  id: number;
  code: string;
  from: string;
  to?: string;
  person: Person;
  type: "INTERNAL" | "EXTERNAL" | "MANAGEMENT" | "SERVICE";
};

export type ContactRequest = {};

const internalize = (it) => ({
  ...it,
  from: it.from && moment(it.from, "YYYY-MM-DD"),
  to: it.to && moment(it.to, "YYYY-MM-DD"),
});

const clients = new Map();
clients.set(
  "general",
  InternalizingClient<ContactRequest, Contract, ContractRaw>(path, internalize)
);
clients.set(
  "INTERNAL",
  InternalizingClient<ContactRequest, Contract, ContractRaw>(
    internalPath,
    internalize
  )
);
clients.set(
  "EXTERNAL",
  InternalizingClient<ContactRequest, Contract, ContractRaw>(
    externalPath,
    internalize
  )
);
clients.set(
  "MANAGEMENT",
  InternalizingClient<ContactRequest, Contract, ContractRaw>(
    managementPath,
    internalize
  )
);
clients.set(
  "SERVICE",
  InternalizingClient<ContactRequest, Contract, ContractRaw>(
    servicePath,
    internalize
  )
);

const findAllByPersonId = (personId: string) =>
  clients.get("general").query({ personId: personId });

const findAllByToBetween = (start: Date, end: Date) => {
  const startString = start.toISOString().substring(0, 10);
  const endString = end.toISOString().substring(0, 10);

  return clients.get("general").query({ start: startString, end: endString });
};

const put = (id, type, item) => clients.get(type).put(id, item);

const post = (type, item) => clients.get(type).post(item);

export const ContractClient = {
  ...clients.get("general"),
  post,
  put,
  findAllByPersonId,
  findAllByToBetween,
};
