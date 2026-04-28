import dayjs, { type Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { EventClient, type FlockEvent } from '../clients/EventClient';
import { LeaveDayClient } from '../clients/LeaveDayClient';
import { stringifyDate } from '../utils/stringifyDate';

export type LeaveDayStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'DONE';
export type LeaveDayType =
  | 'HOLIDAY'
  | 'PLUSDAY'
  | 'PAID_PARENTAL_LEAVE'
  | 'UNPAID_PARENTAL_LEAVE'
  | 'PAID_LEAVE';

export type DayMeta = {
  hackday?: { description: string };
  leave?: {
    type: LeaveDayType;
    status: LeaveDayStatus;
    description?: string;
  };
};

type LeaveDayLite = {
  from: Dayjs;
  to: Dayjs;
  days?: number[];
  status: LeaveDayStatus;
  type: LeaveDayType;
  description?: string;
};

const LEAVE_DAY_FETCH_SIZE = 200;

const leaveLabel = (type: LeaveDayType): string => {
  switch (type) {
    case 'HOLIDAY':
      return 'Holiday';
    case 'PLUSDAY':
      return 'Plusday';
    case 'PAID_PARENTAL_LEAVE':
      return 'Paid parental leave';
    case 'UNPAID_PARENTAL_LEAVE':
      return 'Unpaid parental leave';
    case 'PAID_LEAVE':
      return 'Paid leave';
  }
};

const eachDay = (from: Dayjs, to: Dayjs): Dayjs[] => {
  const days: Dayjs[] = [];
  let cursor = from.startOf('day');
  const end = to.startOf('day');
  while (!cursor.isAfter(end)) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }
  return days;
};

const overlapDays = (
  rangeFrom: Dayjs,
  rangeTo: Dayjs,
  itemFrom: Dayjs,
  itemTo: Dayjs,
  itemDays?: number[],
): Dayjs[] => {
  if (itemTo.isBefore(rangeFrom, 'day') || itemFrom.isAfter(rangeTo, 'day')) {
    return [];
  }
  return eachDay(itemFrom, itemTo).filter((date, index) => {
    if (itemDays && itemDays[index] != null && itemDays[index] === 0) {
      return false;
    }
    return !date.isBefore(rangeFrom, 'day') && !date.isAfter(rangeTo, 'day');
  });
};

const yearsInRange = (from: Dayjs, to: Dayjs): number[] => {
  const years: number[] = [];
  for (let year = from.year(); year <= to.year(); year++) {
    years.push(year);
  }
  return years;
};

export function useDayMeta(
  personId: string | undefined,
  from: Dayjs | undefined,
  to: Dayjs | undefined,
): Map<string, DayMeta> {
  const [meta, setMeta] = useState<Map<string, DayMeta>>(() => new Map());

  const fromKey = from ? stringifyDate(from) : '';
  const toKey = to ? stringifyDate(to) : '';

  // biome-ignore lint/correctness/useExhaustiveDependencies: fromKey/toKey are stable string projections of from/to to avoid re-fetching on every render
  useEffect(() => {
    if (!personId || !from || !to || from.isAfter(to, 'day')) {
      setMeta(new Map());
      return;
    }

    let cancelled = false;

    const hackdaysPromise = Promise.all(
      yearsInRange(from, to).map((year) => EventClient.getHackDays(year)),
    ).then((pages) =>
      pages
        .flat()
        .filter((event: FlockEvent) =>
          event.persons.some((p) => p.uuid === personId),
        ),
    );

    const leavePromise = LeaveDayClient.queryByPage(
      { page: 0, size: LEAVE_DAY_FETCH_SIZE, sort: 'from,desc' },
      { personId },
    ).then((res) => res.list as unknown as LeaveDayLite[]);

    Promise.all([hackdaysPromise, leavePromise])
      .then(([hackdays, leaveDays]) => {
        if (cancelled) return;

        const next = new Map<string, DayMeta>();

        for (const event of hackdays) {
          const dates = overlapDays(from, to, event.from, event.to);
          for (const date of dates) {
            const key = stringifyDate(date);
            const existing = next.get(key) ?? {};
            next.set(key, {
              ...existing,
              hackday: { description: event.description },
            });
          }
        }

        for (const leave of leaveDays) {
          if (leave.status === 'REJECTED') continue;
          const dates = overlapDays(
            from,
            to,
            dayjs(leave.from),
            dayjs(leave.to),
            leave.days,
          );
          for (const date of dates) {
            const key = stringifyDate(date);
            const existing = next.get(key) ?? {};
            const incoming = {
              type: leave.type,
              status: leave.status,
              description: leave.description ?? leaveLabel(leave.type),
            };
            // Prefer the more "definitive" status if multiple leave records overlap
            if (
              !existing.leave ||
              statusWeight(incoming.status) >
                statusWeight(existing.leave.status)
            ) {
              next.set(key, { ...existing, leave: incoming });
            }
          }
        }

        setMeta(next);
      })
      .catch(() => {
        if (!cancelled) setMeta(new Map());
      });

    return () => {
      cancelled = true;
    };
  }, [personId, fromKey, toKey]);

  return meta;
}

const statusWeight = (status: LeaveDayStatus): number => {
  switch (status) {
    case 'DONE':
      return 3;
    case 'APPROVED':
      return 2;
    case 'REQUESTED':
      return 1;
    case 'REJECTED':
      return 0;
  }
};
