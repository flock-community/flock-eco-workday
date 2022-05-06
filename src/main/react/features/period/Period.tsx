import { addError } from "../../hooks/ErrorHook";
import { Dayjs } from "dayjs";

export type Period = {
  from: Dayjs;
  to: Dayjs;
  days?: number[];
};

function daysBefore(before: Dayjs, after: Dayjs): number {
  return after.startOf("days").diff(before.startOf("days"), "days");
}

function correctDaysLength(period: Period): boolean {
  return period.days
    ? daysBefore(period.from, period.to) + 1 === period.days.length
    : false;
}

function initDay(date: Dayjs, hoursPerDay: number): number {
  const day = date.day();
  if (day === 0 || day === 6) return 0;
  return hoursPerDay;
}

export function initDays(
  period: Period,
  overwrite: boolean = false,
  hoursPerDay: number = 8
): number[] {
  if (period.days && !overwrite) {
    if (correctDaysLength(period)) {
      return period.days;
    }
    throw new Error(
      `The amount of days (with hours) (${period.days.length}) is incorrect in period (${period.from} - ${period.to}).`
    );
  }
  const length = daysBefore(period.from, period.to) + 1;
  const array = Array(length).fill(0);
  return array.map((_, index) =>
    initDay(period.from.add(index, "days"), hoursPerDay)
  );
}

export function dateInPeriod(period: Period, date: Dayjs): boolean {
  return daysBefore(period.from, date) >= 0 && daysBefore(date, period.to) >= 0;
}

export function mutatePeriod(
  value: Period,
  mutation?: Omit<Period, "days">
): Period {
  let period: Period = {
    ...value,
    days: initDays(value),
  };

  const setPeriod = (period1: Period) => {
    period = period1;
  };

  const newStartDate = (from) => {
    if (!period.days) {
      throw new Error(
        `Initialize period (${period.from} - ${period.to}) properly before editing.`
      );
    }
    if (period.from.isAfter(from)) {
      const oldDays = period.days;
      const addedDays = initDays({
        from,
        to: period.from.add(-1, "days"),
      });
      const days = addedDays.concat(oldDays);
      setPeriod({ ...period, from, days });
    }
    if (period.from.isBefore(from)) {
      if (daysBefore(from, period.to) < 0) {
        addError(
          `Please pick a startdate (${from}) earlier than the enddate (${period.to}).`
        );
      } else {
        const diff = daysBefore(period.from, from);
        const days = period.days.slice(diff);
        setPeriod({ ...period, from, days });
      }
    }
  };

  const newEndDate = (to) => {
    if (!period.days) {
      throw new Error(
        `Initialize period (${period.from} - ${period.to}) properly before editing.`
      );
    }
    if (period.to.isBefore(to)) {
      const oldDays = period.days;
      const addedDays = initDays({
        from: period.to.add(1, "days"),
        to: to,
        days: undefined,
      });
      const days = oldDays.concat(addedDays);
      setPeriod({ ...period, to: to, days: days });
    }
    if (period.to.isAfter(to)) {
      if (daysBefore(period.from, to) < 0) {
        addError(
          `Please pick a enddate (${to}) later than the startdate (${period.from}).`
        );
      } else {
        const diff = period.days.length - daysBefore(to, period.to);
        const days = period.days.slice(0, diff);
        setPeriod({ ...period, to: to, days: days });
      }
    }
  };

  if (!mutation) {
    return period;
  }

  if (mutation.from !== period.from && mutation.to !== period.to) {
    if (mutation.from.isAfter(period.to)) {
      newEndDate(mutation.to);
      newStartDate(mutation.from);
    } else {
      newStartDate(mutation.from);
      newEndDate(mutation.to);
    }
    return period;
  }

  if (mutation.from !== period.from) {
    newStartDate(mutation.from);
    return period;
  }

  if (mutation.to !== period.to) {
    newEndDate(mutation.to);
    return period;
  }

  return period;
}

export function getDay(period: Period, date: Dayjs): number {
  if (!dateInPeriod(period, date)) {
    throw new Error(`${date} not in period (${period.from} - ${period.to})`);
  }
  if (!period.days) {
    throw new Error(`Days in period not in initialized.`);
  }
  const index = daysBefore(period.from, date);
  return period.days[index];
}

export function editDay(period: Period, date: Dayjs, day: number): Period {
  if (!dateInPeriod(period, date) || !period.days) {
    throw new Error(
      `Please edit a date (${date}) within the period (${period.from} - ${period.to})`
    );
  }
  const index = daysBefore(period.from, date);
  const days = [...period.days];
  days[index] = day;
  return { from: period.from, to: period.to, days: days };
}
