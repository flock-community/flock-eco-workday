import dayjs from 'dayjs';
import en from 'dayjs/locale/en';
import isoWeek from 'dayjs/plugin/isoWeek';
import { dateInPeriod, getDay, type Period } from '../features/period/Period';
import { stringifyDate } from './stringifyDate';

dayjs.extend(isoWeek);
dayjs.locale({
  ...en,
  weekStart: 1,
});

/**
 * Calculates the 'grid' that has all the days in it from the selected period
 */
export const calcGrid = (period: Period) => {
  const diff =
    Math.ceil(
      period.to.startOf('week').diff(period.from.startOf('week'), 'days') / 7,
    ) + 1;
  const weeks = Array.from(Array(diff > 0 ? diff : 1).keys());

  return weeks.map((week) => {
    const day = period.from.startOf('week').add(week, 'weeks');

    const weekNumber = day.isoWeek();

    const year = day.year();
    const res = Array.from(Array(7).keys()).map((dayDiff) => {
      const date = day.add(dayDiff, 'days');
      const enabled = dateInPeriod(period, date);
      const key = stringifyDate(date);
      return {
        key,
        date,
        disabled: !enabled,
        value: enabled ? String(getDay(period, date)) : '',
      };
    });
    const total = res
      .filter((it) => !it.disabled)
      .reduce((acc, cur) => acc + getDay(period, cur.date) || acc, 0);
    return { year, weekNumber, days: res, total };
  });
};
