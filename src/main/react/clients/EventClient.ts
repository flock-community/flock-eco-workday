import moment from "moment";
import {ExtractJSON} from "../utils/ResourceClient";
import {addError} from "../hooks/ErrorHook";
import {Person} from "./PersonClient";
import InternalizingClient from "../utils/InternalizingClient";

const path = "/api/events";

// Type name is prefixed to prevent conflicts with
// the react Event
export type FlockEvent = {
  description: string;
  id: number;
  code: string;
  from: moment.Moment;
  to: moment.Moment;
  hours: number;
  days: number[];
  persons: Person[]
}

type FlockEventRaw = {
  description: string;
  id: number;
  code: string;
  from: string;
  to: string;
  hours: number;
  days: number[];
  persons: Person[]
}

export type FlockEventRequest = {
  // TODO
}

const internalize = (it) => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
});

const internalizingClient = InternalizingClient<FlockEventRequest, FlockEventRaw, FlockEvent>(path, internalize)

const getRatings = (id) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/${id}/ratings`, opts)
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
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
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
};

const deleteRatings = (eventCode, personId) => {
  const opts = {
    method: "DELETE",
  };
  return fetch(`${path}/${eventCode}/ratings/${personId}`, opts)
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
};

export const EventClient = {
  ...internalizingClient,
  getRatings,
  postRatings,
  deleteRatings,
};
