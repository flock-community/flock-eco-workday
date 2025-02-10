import { Person, PersonLight } from "./PersonClient";
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
  code: string;
  from: Dayjs;
  to: Dayjs;
  hours: number;
  persons: PersonLight[];
  type: EventType;
};

export type FullFlockEvent = {
  id: number;
  description: string;
  code: string;
  from: Dayjs;
  to: Dayjs;
  hours: number;
  days: number[];
  persons: Person[];
  costs: number;
  type: EventType;
};

type FlockEventRawProjection = {
  description: string;
  code: string;
  from: string;
  to: string;
  hours: number;
  persons: PersonLight[];
  type: EventType;
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
};

export enum EventType {
  CONFERENCE = "CONFERENCE",
  FLOCK_COMMUNITY_DAY = "FLOCK_COMMUNITY_DAY",
  FLOCK_HACK_DAY = "FLOCK_HACK_DAY",
  GENERAL_EVENT = "GENERAL_EVENT",
}

const internalize = (it: FlockEventRaw): FlockEvent => ({
  description: it.description,
  code: it.code,
  from: dayjs(it.from),
  to: dayjs(it.to),
  hours: it.hours,
  persons: it.persons,
  type: it.type,
});

const internalizeFull = (it: FlockEventRaw): FullFlockEvent => ({
  description: it.description,
  code: it.code,
  from: dayjs(it.from),
  to: dayjs(it.to),
  hours: it.hours,
  persons: it.persons,
  type: it.type,
  id: it.id,
  days: it.days,
  costs: it.costs,
});

export const EVENT_PAGE_SIZE: number = 10;

const internalizingClient = InternalizingClient<
  FlockEventRequest,
  FlockEventRaw,
  FullFlockEvent
>(path, internalizeFull);

const getAll = (page: number, pageSize = EVENT_PAGE_SIZE) => {
  return internalizingClient.findAllByPage({
    page,
    size: pageSize,
    sort: "from,desc",
  });
};

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

const getHackDays = (year: number): Promise<FlockEvent[]> => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/hack-days?year=${year}`, opts)
    .then((it) => validateResponse<FlockEventRawProjection[]>(it))
    .then((it) => checkResponse(it))
    .then((res) => res?.body.map(internalize));
};

const subscribeToEvent = (event: FlockEvent) => {
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetch(`${path}/${event.code}/subscribe`, opts)
    .then(validateResponse<FlockEventRaw>)
    .then((it) => checkResponse(it))
    .then((res) => internalize(res.body));
};

const unsubscribeFromEvent = (event: FlockEvent) => {
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  };
  return fetch(`${path}/${event.code}/unsubscribe`, opts)
    .then(validateResponse<FlockEventRaw>)
    .then((it) => checkResponse(it))
    .then((res) => internalize(res.body));
};

export const EventClient = {
  ...internalizingClient,
  getAll,
  getRatings,
  postRatings,
  deleteRatings,
  getHackDays,
  subscribeToEvent,
  unsubscribeFromEvent,
};
