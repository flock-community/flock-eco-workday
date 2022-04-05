import moment from "moment";
import { ExtractJSON, ResourceClient } from "../utils/ResourceClient.ts";
import { PageableClient } from "../utils/PageableClient.ts";
import { addError } from "../hooks/ErrorHook";

const path = "/api/contracts";

const internalize = (it) => ({
  ...it,
  from: it.from && moment(it.from, "YYYY-MM-DD"),
  to: it.to && moment(it.to, "YYYY-MM-DD"),
});

const resourceClient = ResourceClient(path, internalize);
const pageableClient = PageableClient(path, internalize);

const post = (type, item) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  };
  return fetch(`/api/contracts-${type.toLowerCase()}`, opts)
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
  return fetch(`/api/contracts-${type.toLowerCase()}/${id}`, opts).then(
    internalize
  );
};

export const findByCode = (code) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/${code}`, opts)
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
};

function findAllByPersonId(personId) {
  return fetch(`${path}?personId=${personId}`)
    .then(ExtractJSON)
    .then((data) => data.map(internalize))
    .catch((e) => addError(e.message));
}

function findAllByToBetween(start, end) {
  const startString = start.toISOString().substring(0, 10);
  const endString = end.toISOString().substring(0, 10);

  return fetch(`${path}?start=${startString}&end=${endString}`)
    .then((json) => ExtractJSON(json))
    .then((data) => data.map(internalize))
    .catch((e) => addError(e.message));
}

export const ContractClient = {
  ...resourceClient,
  ...pageableClient,
  post,
  put,
  findByCode,
  findAllByPersonId,
  findAllByToBetween,
};
