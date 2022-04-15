import { AggregationClientPersonOverview } from "../graphql/aggregation";
import {
  checkResponse,
  validateResponse,
} from "@flock-community/flock-eco-core";
import moment from "moment";

const path = "/api/aggregations";

export type ClientGrossRevenue = {
  name: string;
  revenueGross: number;
};

export const totalPerClientByYear = (
  year: number
): Promise<ClientGrossRevenue[]> => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-client?year=${year}`, opts)
    .then((res) => validateResponse<ClientGrossRevenue[]>(res))
    .then((res) => checkResponse(res))
    .then((res) => res.body);
};
export const totalPerPersonByYear = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-person?year=${year}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};
export const totalPerPersonByYearMonth = (year, month) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-person?year=${year}&month=${month}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};
export const clientHourOverviewByYearMonth: (
  year: number,
  month: number
) => Promise<void | AggregationClientPersonOverview[]> = (year, month) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/client-hour-overview?year=${year}&month=${month}`, opts)
    .then((res) => validateResponse<AggregationClientPersonOverview[]>(res))
    .then(checkResponse)
    .then((res) => res.body);
};
export const totalPerPersonMe = () => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-person-me`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};
export const holidayReportMe = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/holiday-report-me?year=${year}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export const totalPerMonthByYear = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/total-per-month?year=${year}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export const holidayReportByYear = (year) => {
  const opts = {
    method: "GET",
  };
  return fetch(`${path}/holiday-report?year=${year}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

const clientAssignmentPersonBetween = (
  from: moment.Moment,
  to: moment.Moment
) => {
  const opts = {
    method: "GET",
  };
  return fetch(
    `${path}/client-assignment-hour-overview?from=${from.format(
      "YYYY-MM-DD"
    )}&to=${to.format("YYYY-MM-DD")}`,
    opts
  )
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export const AggregationClient = {
  totalPerClientByYear,
  totalPerPersonByYear,
  totalPerPersonByYearMonth,
  clientHourOverviewByYearMonth,
  clientAssignmentPersonBetween,
  totalPerMonthByYear,
  totalPerPersonMe,
  holidayReportMe,
  holidayReportByYear,
};
