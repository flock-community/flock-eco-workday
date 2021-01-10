import moment from "moment";
import { ExtractJSON, ResourceClient } from "../utils/ResourceClient.ts";
import { addError } from "../hooks/ErrorHook";

const internalize = (it) => ({
  ...it,
  date: moment(it.date),
});

const path = "/api/expenses";
const resourceClient = ResourceClient(path, internalize);

const findAllByPersonId = (personId) => {
  return fetch(`${path}?personId=${personId}&sort=date,desc`)
    .then(ExtractJSON)
    .then((data) => data.map(internalize))
    .catch((e) => addError(e.message));
};

const post = (type, item) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  };
  return fetch(`/api/expenses-${type.toLowerCase()}`, opts)
    .then(ExtractJSON)
    .then(internalize)
    .catch((e) => addError(e.message));
};

const put = (id, type, item) => {
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  };
  return fetch(`/api/expenses-${type.toLowerCase()}/${id}`, opts)
    .then(ExtractJSON)
    .then(internalize)
    .catch((e) => addError(e.message));
};

export const ExpenseClient = {
  ...resourceClient,
  post,
  put,
  findAllByPersonId,
};
