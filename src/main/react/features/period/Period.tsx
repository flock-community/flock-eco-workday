import {Moment} from "moment"
import {addError} from "../../hooks/ErrorHook"

export type Period = {
  from: Moment;
  to: Moment;
  days?: number[];
};

function daysBefore(before: Moment, after: Moment): number {
  return after.diff(before, "days");
}

function correctDaysLength(period: Period): boolean {
  return period.days
    ? daysBefore(period.from, period.to) + 1 === period.days.length
    : false;
}

function initDay(date: Moment): number {
  const day = date.day();
  if(day === 0 || day === 6)
    return 0;
  return 8;
}

function initDays(period: Period): number[] {
  if (period.days) {
    if (correctDaysLength(period)) {
      return period.days;
    }
    addError(
      `The amount of days (with hours) (${period.days.length}) is incorrect. They will be reset.`
    );
  }
  const length = daysBefore(period.from, period.to) + 1;
  const array = Array(length).fill(0);
  return array.map((_, index) => initDay(period.from.clone().add(index, "days")));
}

export function dateInPeriod(period: Period, date: Moment): boolean {
  return daysBefore(period.from, date) >= 0 && daysBefore(date, period.to) >= 0;
}

export function MutatePeriod(value: Period, mutation?: Omit<Period, "days">): Period {
  console.log(value, mutation);
  let period: Period = {
    ...value,
    days: initDays(value)
  };
  console.log(period, mutation);

  const setPeriod = (period1: Period) => {
    console.log(period1, "set period");
    period = period1;
  };

  const newStartDate = from => {
    console.log(from);
    if (period.from.isAfter(from)) {
      const oldDays = period.days ? period.days : [];
      const addedDays = initDays({
        from,
        to: period.from.add(-1, "days")
      });
      const days = addedDays.concat(oldDays);
      setPeriod({ ...period, from, days });
    }
    if (period.from.isBefore(from)) {
      if (daysBefore(from, period.to) < 0) {
        addError(
          `Please pick a startdate (${from}) earlier than the enddate (${period.to}).`
        );
        console.log(period);
      } else {
        const diff = daysBefore(period.from, from);
        const days = period.days ? period.days.slice(diff) : undefined;
        setPeriod({ ...period, from, days });
      }
    }
  };

  const newEndDate = to => {
    console.log(to);
    if (period.to.isBefore(to)) {
      const oldDays = period.days;
      const addedDays = initDays({
        from: period.to.add(1, "days"),
        to: to,
        days: undefined
      });
      const days = oldDays ? oldDays.concat(addedDays) : undefined;
      setPeriod({ ...period, to: to, days: days });
    }
    if (period.to.isAfter(to)) {
      if (daysBefore(period.from, to) < 0) {
        addError(
          `Please pick a enddate (${to}) later than the startdate (${period.from}).`
        );
        console.log(period);
      } else {
        const diff = daysBefore(to, period.to);
        const days = period.days ? period.days.slice(diff) : undefined;
        setPeriod({ ...period, to, days });
      }
    }
  };

  if (mutation && mutation.from !== period.from) {
    newStartDate(mutation.from);
  }
  if (mutation && mutation.to !== period.to) {
    newEndDate(mutation.to);
  }

  return period;
}

export function GetDay(period: Period, date: Moment): number {
  if (!dateInPeriod(period, date)) {
    addError(`${date} not in ${period}`);
    return -1;
  }
  if (!period.days) {
    addError(`Days in period not in initialized.`);
    return -1;
  }
  const index = daysBefore(period.from, date);
  return period.days[index];
}
