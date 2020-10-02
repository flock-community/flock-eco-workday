import { useEffect, useState } from "react";
import moment from "moment";
import { addError } from "../../hooks/ErrorHook";

function daysBefore(before, after) {
  return after.diff(before, "days");
}

function correctDaysLength(period) {
  return daysBefore(period.from, period.to) + 1 === period.days.length;
}

function initDays(period) {
  if (!period) {
    addError("Initialize period before initializing days.");
    return null;
  }

  if (period.days) {
    if (correctDaysLength(period)) {
      return period.days;
    }
    addError(
      `The amount of days (with hours) (${period.days.length}) is incorrect. They will be reset.`
    );
  }
  const length = daysBefore(period.from, period.to) + 1;
  return Array(length).fill(0);
}

export function Period({
  from = moment().startOf("day"),
  to = moment().startOf("day"),
  days = []
}) {
  const [period, setPeriod1] = useState({ loading: true });

  function setPeriod(period1) {
    console.log(period1);
    return setPeriod1(period1);
  }

  useEffect(
    () =>
      setPeriod({
        from,
        to,
        days: initDays({ from, to, days }),
        loading: false
      }),
    []
  );

  const dateInPeriod = date => {
    return daysBefore(from, date) >= 0 && daysBefore(date, to) >= 0;
  };

  const newStartDate = from1 => {
    if (period.from.isAfter(from1)) {
      const oldDays = period.days;
      const addedDays = initDays({
        from: from1,
        to: period.from.MinusDays(1),
        days: []
      });
      const days1 = addedDays.concat(oldDays);
      setPeriod({ ...period, from: from1, days: days1 });
    }
    if (period.from.isBefore(from1)) {
      if (daysBefore(from1, period.to) < 0) {
        addError(
          `Please pick a startdate (${from1}) earlier than the enddate (${period.to}).`
        );
      } else {
        const diff = daysBefore(period.from, from1);
        const days1 = period.days.slice(diff);
        setPeriod({ ...period, from: from1, days: days1 });
      }
    }
  };

  const newEndDate = to1 => {
    if (period.to.isBefore(to1)) {
      const oldDays = period.days;
      const addedDays = initDays({
        from: period.to.PlusDays(1),
        to: to1,
        days: []
      });
      const days1 = oldDays.concat(addedDays);
      setPeriod({ ...period, to: to1, days: days1 });
    }
    if (period.to.isAfter(to1)) {
      if (daysBefore(period.from, to1) < 0) {
        addError(
          `Please pick a enddate (${to1}) later than the startdate (${period.from}).`
        );
      } else {
        const diff = daysBefore(to1, period.to);
        const days1 = period.days.slice(diff);
        setPeriod({ ...period, to: to1, days: days1 });
      }
    }
  };

  const editDay = (date, day) => {
    if (dateInPeriod(date, period)) {
      const index = daysBefore(period.from, date);
      const days1 = period.days.map((d, i) => (i === index ? day : d));
      setPeriod({ ...period, days: days1 });
    } else {
      addError(
        `Pease edit a date (${date}) within the period (${period.from} - ${period.to}).`
      );
    }
  };

  const getDay = date => {
    if (dateInPeriod(date, period)) {
      const index = daysBefore(period.from, date);
      return period.days[index];
    }
    addError(
      `Pease view a date (${date}) within the period (${period.from} - ${period.to}).`
    );
    return null;
  };

  return { ...period, newStartDate, newEndDate, editDay, getDay, dateInPeriod };
}
