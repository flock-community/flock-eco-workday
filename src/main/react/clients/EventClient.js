import moment from "moment";
import { ResourceClient, responseValidation } from "../utils/ResourceClient";

const internalize = it => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to)
});

const path = "/api/events";
const resourceClient = ResourceClient(path, internalize);

const getRatings = id => {
  const opts = {
    method: "GET"
  };
  return fetch(`${path}/${id}/ratings`, opts).then(responseValidation);
};

const postRatings = (eventCode, item) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item)
  };
  return fetch(`${path}/${eventCode}/ratings`, opts).then(responseValidation);
};

const deleteRatings = (eventCode, personCode) => {
  const opts = {
    method: "DELETE"
  };
  return fetch(`${path}/${eventCode}/ratings/${personCode}`, opts).then(
    responseValidation
  );
};

export const EventClient = {
  ...resourceClient,
  getRatings,
  postRatings,
  deleteRatings
};
