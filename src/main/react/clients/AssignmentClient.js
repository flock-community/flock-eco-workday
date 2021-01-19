import moment from "moment";
import { ExtractJSON, ResourceClient } from "../utils/ResourceClient.ts";
import { PageableClient } from "../utils/PageableClient.ts";
import { addError } from "../hooks/ErrorHook";

const path = "/api/assignments";

const internalize = (it) => ({
  ...it,
  from: it.from && moment(it.from, "YYYY-MM-DD"),
  to: it.to && moment(it.to, "YYYY-MM-DD"),
});

const resourceClient = ResourceClient(path, internalize);
const pageableClient = PageableClient(path, internalize);

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

export const AssignmentClient = {
  ...resourceClient,
  ...pageableClient,
  findByCode,
  findAllByPersonId,
};
