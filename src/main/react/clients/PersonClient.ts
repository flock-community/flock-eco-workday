import InternalizingClient from "../utils/InternalizingClient";
import dayjs, { Dayjs } from "dayjs";
import { ISO_8601_DATE } from "./util/DateFormats";

export type Person = {
  id: number;
  uuid: string;
  email: string;
  firstname: string;
  lastname: string;
  fullName: string;
  number: string;
  birthdate: Dayjs | null;
  joinDate: Dayjs | null;
  position: string;
  user: string;
  active: boolean;
  lastActiveAt: Date;
  shoeSize?: string;
  shirtSize?: string;
};

export type PersonRaw = {
  uuid: string;
  email: string;
  firstname: string;
  id: number;
  lastname: string;
  fullName: string;
  number: string;
  birthdate: string;
  joinDate: string;
  position: string;
  user: string;
  active: boolean;
  lastActiveAt: string;
  shoeSize?: string;
  shirtSize?: string;
};

export type PersonRequest = {
  id?: number;
  uuid?: string;
  lastName: string;
  email: string;
  position: string;
  number?: number;
  birthdate: string;
  joinDate: string;
  active: boolean;
  lastActiveAt?: string; // FIXME
  reminders: boolean;
  user: any; // FIXME
  shoeSize?: string;
  shirtSize?: string;
};

const path = "/api/persons";

export const internalize = (json: PersonRaw): Person => ({
  ...json,
  birthdate: json.birthdate ? dayjs(json.birthdate, ISO_8601_DATE) : null,
  joinDate: json.joinDate ? dayjs(json.joinDate, ISO_8601_DATE) : null,
  lastActiveAt: new Date(json.lastActiveAt),
});

const internalizingClient = InternalizingClient<
  PersonRequest,
  PersonRaw,
  Person
>(path, internalize);

const findAllByFullName = (pageable, search: string | null) =>
  internalizingClient.queryByPage(pageable, { search });

export const PersonClient = {
  ...internalizingClient,
  me: () => internalizingClient.get("me"),
  findAllByFullName,
};
