import { Person } from "./PersonClient";
import InternalizingClient from "../utils/InternalizingClient";
import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core";
import dayjs, { Dayjs } from "dayjs";
import {DMY_DATE} from "./util/DateFormats";

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
};

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

const getUpcoming = (from: Dayjs, to: Dayjs): Promise<FlockEvent[]> => {
  const opts = {
    method: "GET"
  }
  return fetch(`${path}/upcoming?fromDate=${from.toISOString().substring(0, 10)}&toDate=${to.toISOString().substring(0, 10)}`, opts)
    .then(validateResponse)
    .catch(checkResponse)
    .then((res) => res?.body.map(internalize));
}

export const EventClient = {
  ...internalizingClient,
  getRatings,
  postRatings,
  deleteRatings,
  getUpcoming
};
