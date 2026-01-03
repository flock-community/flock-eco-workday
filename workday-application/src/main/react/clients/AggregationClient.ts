import { checkResponse, validateResponse } from '@workday-core';
import type { Dayjs } from 'dayjs';
import type {
  AggregationClientPersonAssignmentOverview,
  AggregationClientPersonOverview,
  AggregationHackDay as AggregationHackDayApi,
  PersonHackdayDetails as PersonHackdayDetailsApi,
} from '../wirespec/model';
import { ISO_8601_DATE } from './util/DateFormats';

const path = '/api/aggregations';

export type ClientGrossRevenue = {
  name: string;
  revenueGross: number;
};

export const totalPerClientByYear = (
  year: number,
): Promise<ClientGrossRevenue[]> => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/total-per-client?year=${year}`, opts)
    .then((res) => validateResponse<ClientGrossRevenue[]>(res))
    .then((res) => checkResponse(res))
    .then((res) => res.body);
};
export const totalPerPersonByYear = (year) => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/total-per-person?year=${year}`, opts)
    .then(validateResponse<any[]>)
    .then(checkResponse)
    .then((res) => res.body);
};
export const totalPerPersonByYearMonth = (year, month) => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/total-per-person?year=${year}&month=${month}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};
export const clientHourOverviewByYearMonth: (
  year: number,
  month: number,
) => Promise<undefined | AggregationClientPersonOverview[]> = (year, month) => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/client-hour-overview?year=${year}&month=${month}`, opts)
    .then((res) => validateResponse<AggregationClientPersonOverview[]>(res))
    .then(checkResponse)
    .then((res) => res.body);
};

export const totalPerPersonMe = () => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/total-per-person-me`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export type AggregationLeaveDay = {
  name: string;
  contractHours: number;
  plusHours: number;
  holidayHours: number;
  paidParentalLeaveHours: number;
  unpaidParentalLeaveHours: number;
  paidLeaveHours: number;
};

export type PersonHackdayDetails = {
  name: string;
  hackHoursFromContract: number;
  hackHoursUsed: number;
  totalHoursRemaining: number;
};

export type AggregationHackDay = {
  name: string;
  contractHours: number;
  hackHoursUsed: number;
};
export type PersonHolidayDetails = {
  name: string;
  holidayHoursFromContract: number;
  plusHours: number;
  holidayHoursDone: number;
  holidayHoursApproved: number;
  holidayHoursRequested: number;
  totalHoursAvailable: number;
  totalHoursUsed: number;
  totalHoursRemaining: number;
};

const internalizePersonHackdayDetails: (
  api: PersonHackdayDetailsApi,
) => PersonHackdayDetails = (api) => ({
  name: api.name,
  hackHoursFromContract: api.hackHoursFromContract,
  hackHoursUsed: api.hackHoursUsed,
  totalHoursRemaining: api.totalHoursRemaining,
});

export const holidayDetailsMeYear = (year): Promise<PersonHolidayDetails> => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/holiday-details-me?year=${year}`, opts)
    .then((res) => validateResponse<PersonHolidayDetails>(res))
    .then(checkResponse)
    .then((res) => res.body);
};

export const hackdayDetailsMeYear = (year): Promise<PersonHackdayDetails> => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/hackday-details-me?year=${year}`, opts)
    .then((res) => validateResponse<PersonHackdayDetailsApi>(res))
    .then(checkResponse)
    .then((res) => internalizePersonHackdayDetails(res.body));
};

export const totalPerMonthByYear = (year) => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/total-per-month?year=${year}`, opts)
    .then(validateResponse)
    .then(checkResponse)
    .then((res) => res.body);
};

export const leaveDayReportByYear = (year): Promise<AggregationLeaveDay[]> => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/leave-day-report?year=${year}`, opts)
    .then((res) => validateResponse<AggregationLeaveDay[]>(res))
    .then(checkResponse)
    .then((res) => res.body);
};

export const hackDayReportByYear = (year): Promise<AggregationHackDay[]> => {
  const opts = {
    method: 'GET',
  };
  return fetch(`${path}/hack-day-report?year=${year}`, opts)
    .then((res) => validateResponse<AggregationHackDayApi[]>(res))
    .then(checkResponse)
    .then((res) => res.body);
};

const clientAssignmentPersonBetween = (
  from: Dayjs,
  to: Dayjs,
): Promise<AggregationClientPersonAssignmentOverview[]> => {
  const opts = {
    method: 'GET',
  };
  return fetch(
    `${path}/client-assignment-hour-overview?from=${from.format(
      ISO_8601_DATE,
    )}&to=${to.format(ISO_8601_DATE)}`,
    opts,
  )
    .then((res) =>
      validateResponse<AggregationClientPersonAssignmentOverview[]>(res),
    )
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
  leaveDayReportByYear,
  hackDayReportByYear,
  holidayDetailsMeYear,
  hackdayDetailsMeYear,
};
