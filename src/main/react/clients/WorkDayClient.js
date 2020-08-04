import moment from "moment";
import { ResourceClient, responseValidation } from "../utils/ResourceClient";
import { addError } from "../hooks/ErrorHook";

const internalize = it => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
  days: it.days && it.days.length === 0 ? null : it.days
});

const path = "/api/workdays";
const resourceClient = ResourceClient(path, internalize);

const findAllByPersonCode = personCode => {
  return fetch(`${path}?personCode=${personCode}&sort=from,desc`)
    .then(responseValidation)
    .then(it => it.map(internalize))
    .catch(e => addError([e.message, e]));
};

export const WorkDayClient = {
  ...resourceClient,
  findAllByPersonCode
};
