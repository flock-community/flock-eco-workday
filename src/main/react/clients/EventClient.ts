import { Person } from "./PersonClient";
import InternalizingClient from "../utils/InternalizingClient";
import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core";
import dayjs, { Dayjs } from "dayjs";

const path = "/api/events";

// Type name is prefixed to prevent conflicts with
// the react Event
export type FlockEvent = {
  description: string;
  id: number;
  code: string;
  from: Dayjs;
  to: Dayjs;
  hours: number;
  days: number[];
  persons: Person[];
  costs: number;
  type: EventType;
  billable: boolean;
};

type FlockEventRaw = {
  description: string;
  id: number;
  code: string;
  from: string;
  to: string;
  hours: number;
  days: number[];
  persons: Person[];
  costs: number;
  type: EventType;
  billable: boolean;
};

export type FlockEventRequest = {
  description: string;
  id: number;
  code: string;
  from: Dayjs;
  to: Dayjs;
  hours: number;
  days: number[];
  personIds: string[];
  costs: number;
  type: EventType;
  billable: boolean;
};

export enum EventType {
  FLOCK_HACK_DAY = 'FLOCK_HACK_DAY',
  FLOCK_COMMUNITY_DAY = 'FLOCK_COMMUNITY_DAY',
  CONFERENCE = 'CONFERENCE',
  GENERAL_EVENT = 'GENERAL_EVENT'
}

const internalize = (it) => ({
  ...it,
  from: dayjs(it.from),
  to: dayjs(it.to),
});

const internalizingClient = InternalizingClient<
  FlockEventRequest,
  FlockEventRaw,
  FlockEvent
>(path, internalize);

// TODO: Rating type
const getRatings = (id) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/${id}/ratings`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

const postRatings = (eventCode, item) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  };
  return fetch(`${path}/${eventCode}/ratings`, opts)
    .then(validateResponse)
    .catch(checkResponse)
    .then((res) => res?.body);
};

const deleteRatings = (eventCode, personId) => {
  const opts = {
    method: "DELETE",
  };
  return fetch(`${path}/${eventCode}/ratings/${personId}`, opts)
    .then(validateResponse)
    .catch(checkResponse)
    .then((res) => res?.body);
};

export const EventClient = {
  ...internalizingClient,
  getRatings,
  postRatings,
  deleteRatings,
};
