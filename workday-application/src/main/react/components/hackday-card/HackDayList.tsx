import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import type { FlockEvent } from '../../clients/EventClient';
import { FlockPagination } from '../pagination/FlockPagination';
import { EventList } from './EventList';

type UpcomingEventsCardProps = {
  items: FlockEvent[];
  onEventToggle: (
    event: FlockEvent,
    isSubscribed: boolean,
    hours?: number,
  ) => void;
};

const rowsPerPage = 4;

const lastPage = (count: number) =>
  Math.max(0, Math.ceil(count / rowsPerPage) - 1);

const pageOfNextUpcomingEvent = (items: FlockEvent[]) => {
  const today = dayjs();
  const idx = items.findIndex((event) => !event.from.isBefore(today, 'day'));
  return idx === -1 ? lastPage(items.length) : Math.floor(idx / rowsPerPage);
};

export function HackDayList({ items, onEventToggle }: UpcomingEventsCardProps) {
  const [page, setPage] = useState(0);
  const landedOnUpcoming = useRef(false);

  useEffect(() => {
    if (!landedOnUpcoming.current && items.length > 0) {
      landedOnUpcoming.current = true;
      setPage(pageOfNextUpcomingEvent(items));
    }
  }, [items]);

  return (
    <>
      <EventList
        events={items.slice(
          page * rowsPerPage,
          page * rowsPerPage + rowsPerPage,
        )}
        onEventToggle={onEventToggle}
      />
      {items.length > rowsPerPage && (
        <FlockPagination
          currentPage={page + 1}
          itemsPerPage={rowsPerPage}
          numberOfItems={items.length}
          changePageCb={setPage}
        />
      )}
    </>
  );
}
