import { addError } from "../hooks/ErrorHook";

const path = "/api/aggregations";

export const totalPerClientByYear = year => {
  const opts = {
    method: "GET"
  };
  return fetch(`${path}/total-per-client?year=${year}`, opts)
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }
      throw res.json();
    })
    .catch(e => addError(e.message));
};
export const totalPerPersonByYear = year => {
  const opts = {
    method: "GET"
  };
  return fetch(`${path}/total-per-person?year=${year}`, opts)
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }
      throw res.json();
    })
    .catch(e => addError(e.message));
};
export const totalPerPersonByYearMonth = (year, month) => {
  const opts = {
    method: "GET"
  };
  return fetch(`${path}/total-per-person?year=${year}&month=${month}`, opts)
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }
      throw res.json();
    })
    .catch(e => addError(e.message));
};

export const totalPerMonthByYear = year => {
  const opts = {
    method: "GET"
  };
  return fetch(`${path}/total-per-month?year=${year}`, opts)
    .then(res => {
      if (res.status === 200) {
        return res.json();
      }
      throw res.json();
    })
    .catch(e => addError(e.message));
};

export const AggregationClient = {
  totalPerClientByYear,
  totalPerPersonByYear,
  totalPerPersonByYearMonth,
  totalPerMonthByYear
};
