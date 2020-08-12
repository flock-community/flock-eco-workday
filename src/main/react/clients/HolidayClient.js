import moment from "moment";
import { ExtractJSON, ResourceClient } from "../utils/ResourceClient";
import { addError } from "../hooks/ErrorHook";

const internalize = it => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to)
});

const path = "/api/holidays";
const resourceClient = ResourceClient(path, internalize);

const findAllByPersonCode = personCode => {
  return fetch(`${path}?personCode=${personCode}&sort=from,desc`)
    .then(ExtractJSON)
    .then(data => data.map(internalize))
    .catch(e => addError(e.message));
};

export const HolidayClient = {
  ...resourceClient,
  findAllByPersonCode
};
