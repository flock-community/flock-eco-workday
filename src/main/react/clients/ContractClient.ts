import moment from "moment";
import {Person} from "./PersonClient";
import InternalizingClient from "../utils/InternalizingClient";

const path = "/api/contracts";

export type Contract = {
  id: number;
  code: string;
  from: moment.Moment;
  to?: moment.Moment;
  person: Person;
  type: "INTERNAL" | "EXTERNAL" | "MANAGEMENT" | "SERVICE"
}

export type ContractRaw = {
  id: number;
  code: string;
  from: string;
  to?: string;
  person: Person;
  type: "INTERNAL" | "EXTERNAL" | "MANAGEMENT" | "SERVICE"
}

export type ContactRequest = {

}

const internalize = (it) => ({
  ...it,
  from: it.from && moment(it.from, "YYYY-MM-DD"),
  to: it.to && moment(it.to, "YYYY-MM-DD"),
});

const internalizingClient = InternalizingClient<ContactRequest, Contract, ContractRaw>(path, internalize)

const findAllByPersonId = (personId: string) => internalizingClient
  .query({ personId: personId })

const findAllByToBetween = (start: Date, end: Date) => {
  const startString = start.toISOString().substring(0, 10);
  const endString = end.toISOString().substring(0, 10);

  return internalizingClient.query({ start: startString, end: endString })
}

export const ContractClient = {
  ...internalizingClient,
  findAllByPersonId,
  findAllByToBetween,
};
