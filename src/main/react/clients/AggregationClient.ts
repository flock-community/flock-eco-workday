import { addError } from "../hooks/ErrorHook";
import { ExtractJSON } from "../utils/ResourceClient";
import {AggregationClientPersonOverview} from "../graphql/aggregation";

const path = "/api/aggregations";

export const totalPerClientByYear = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-client?year=${year}`, opts)
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
};
export const totalPerPersonByYear = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-person?year=${year}`, opts)
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
};
export const totalPerPersonByYearMonth = (year, month) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-person?year=${year}&month=${month}`, opts)
    .then(it => ExtractJSON(it))
    .catch((e) => addError(e.message));
};
export const clientHourOverviewByYearMonth: (year:number, month:number) => Promise<void | AggregationClientPersonOverview[]> = (year, month) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/client-hour-overview?year=${year}&month=${month}`, opts)
      .then(it => ExtractJSON(it))
      .then(it => it as AggregationClientPersonOverview[])
      .catch((e) => addError(e.message));
};
export const totalPerPersonMe = () => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-person-me`, opts)
    .then(it => ExtractJSON(it))
    .catch((e) => addError(e.message));
};

export const totalPerMonthByYear = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-month?year=${year}`, opts)
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
};

export const holidayReportByYear = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/holiday-report?year=${year}`, opts)
    .then(ExtractJSON)
    .catch((e) => addError(e.message));
};

export const AggregationClient = {
  totalPerClientByYear,
  totalPerPersonByYear,
  totalPerPersonByYearMonth,
  clientHourOverviewByYearMonth,
  totalPerMonthByYear,
  totalPerPersonMe,
  holidayReportByYear,
};
