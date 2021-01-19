import moment from "moment";
import { ExtractJSON, ResourceClient } from "../utils/ResourceClient.ts";
import { addError } from "../hooks/ErrorHook";

const internalize = (it) => ({
  ...it,
  from: moment(it.from),
  to: moment(it.to),
  days: it.days && it.days.length === 0 ? null : it.days,
});

const path = "/api/workdays";
const resourceClient = ResourceClient(path, internalize);

const findAllByPersonUuid = (personId) => {
  return fetch(`${path}?personId=${personId}&sort=from,desc`)
    .then(ExtractJSON)
    .then((it) => it.map(internalize))
    .catch((e) => addError(e.message));
};

export const WorkDayClient = {
  ...resourceClient,
  findAllByPersonUuid,
};
