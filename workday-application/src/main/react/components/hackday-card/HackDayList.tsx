import dayjs from 'dayjs';
import { useState } from 'react';
import type { FlockEvent } from '../../clients/EventClient';
import { FlockPagination } from '../pagination/FlockPagination';
import { EventList } from './EventList';

type UpcomingEventsCardProps = {
  items: FlockEvent[];
  onEventToggle: (event: FlockEvent, isSubscribed: boolean) => void;
};

const rowsPerPage = 4;

const getFirstUpcomingEventPage = (items: FlockEvent[]) => {
  const today = dayjs();
  const closestEventIndex = items.findIndex((event) =>
    event.from.isAfter(today, 'day'),
  );
  return closestEventIndex === -1
    ? 0
    : Math.floor(closestEventIndex / rowsPerPage);
};

export function HackDayList({ items, onEventToggle }: UpcomingEventsCardProps) {
  const [page, setPage] = useState(getFirstUpcomingEventPage(items));

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
