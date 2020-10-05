import {Moment} from "moment"
import {addError} from "../../hooks/ErrorHook"

type Period = {
  from: Moment;
  to: Moment;
  days?: number[];
};

function daysBefore(before: Moment, after: Moment): number {
  return after.diff(before, "days")
}

function correctDaysLength(period: Period): boolean {
  return daysBefore(period.from, period.to) + 1 === period.days?.length
}

function initDays(period: Period): number[] {
  if (period.days) {
    if (correctDaysLength(period)) {
      return period.days
    }
    addError(
      `The amount of days (with hours) (${period.days.length}) is incorrect. They will be reset.`,
    )
    console.log(period)
  }
  const length = daysBefore(period.from, period.to) + 1
  return Array(length).fill(10)
}

export function dateInPeriod(period: Period, date: Moment): boolean {
  console.log("date in period", date, period, daysBefore(period.from, date) >= 0 && daysBefore(period.to, date) >= 0);
  return daysBefore(period.from, date) >= 0 && daysBefore(period.to, date) >= 0;
}

export function Period(value: Period, mutation?: Omit<Period, "days">) {
  let period: Period = {
    ...value,
    days: initDays(value),
  }

  const setPeriod = (period1: Period) => {
    console.log(period1);
    period = period1;
  }

  const newStartDate = from => {
    console.log(from)
    if (period.from.isAfter(from)) {
      const oldDays = period.days ? period.days : []
      const addedDays = initDays({
        from,
        to: period.from.add(-1, "days"),
      })
      const days = addedDays.concat(oldDays)
      setPeriod({...period, from, days})
    }
    if (period.from.isBefore(from)) {
      if (daysBefore(from, period.to) < 0) {
        addError(
          `Please pick a startdate (${from}) earlier than the enddate (${period.to}).`,
        )
        console.log(period)
      } else {
        const diff = daysBefore(period.from, from)
        const days = period.days?.slice(diff)
        setPeriod({...period, from, days})
      }
    }
  }

  const newEndDate = to => {
    console.log(to)
    if (period.to.isBefore(to)) {
      const oldDays = period.days
      const addedDays = initDays({
        from: period.to.add(1, "days"),
        to,
      })
      const days = oldDays?.concat(addedDays)
      setPeriod({...period, to, days})
    }
    if (period.to.isAfter(to)) {
      if (daysBefore(period.from, to) < 0) {
        addError(
          `Please pick a enddate (${to}) later than the startdate (${period.from}).`,
        )
        console.log(period)
      } else {
        const diff = daysBefore(to, period.to)
        const days = period.days?.slice(diff)
        setPeriod({...period, to, days})
      }
    }
  }

  if(mutation?.from !== period.from){
    newStartDate(mutation?.from);
  }
  if(mutation?.to !== period.to) {
    newEndDate(mutation?.to);
  }

  return period
}
