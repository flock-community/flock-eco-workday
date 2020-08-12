import moment from "moment";
import { ResourceClient } from "../utils/ResourceClient";
import { PageableClient } from "../utils/PageableClient";
import { addError } from "../hooks/ErrorHook";

const path = "/api/contracts";

const internalize = it => ({
  ...it,
  from: it.from && moment(it.from, "YYYY-MM-DD"),
  to: it.to && moment(it.to, "YYYY-MM-DD")
});

const resourceClient = ResourceClient(path, internalize);
const pageableClient = PageableClient(path, internalize);

const post = (type, item) => {
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item)
  };
  return fetch(`/api/contracts-${type.toLowerCase()}`, opts)
    .then(internalize)
    .catch(e => addError(e.message));
};

const put = (id, type, item) => {
  const opts = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(item)
  };
  return fetch(`/api/contracts-${type.toLowerCase()}/${id}`, opts)
    .then(internalize)
    .catch(e => addError(e.message));
};

export const findByCode = code => {
  const opts = {
    method: "GET"
  };
  return fetch(`${path}/${code}`, opts)
    .then(res => res.json())
    .catch(e => addError(e.message));
};

function findAllByPersonCode(personCode) {
  return fetch(`${path}?personCode=${personCode}`)
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }
      return res.text().then(message => {
        throw new Error(message);
      });
    })
    .then(data => data.map(internalize))
    .catch(e => addError(e.message));
}

export const ContractClient = {
  ...resourceClient,
  ...pageableClient,
  post,
  put,
  findByCode,
  findAllByPersonCode
};
