import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import type { FlockEvent, HackDayMissReason } from '../../clients/EventClient';
import { EventListItem } from './EventListItem';

type FlockEventListProps = {
  events: FlockEvent[];
  missedHackDays?: Record<string, HackDayMissReason>;
  onEventToggle: (
    event: FlockEvent,
    isSubscribed: boolean,
    hours?: number,
  ) => void;
};

export function EventList({
  events,
  missedHackDays = {},
  onEventToggle,
}: FlockEventListProps) {
  if (events && events.length === 0) {
    return (
      <Typography display={'block'}>There are no events planned.</Typography>
    );
  }

  return (
    <List data-testid={'flock-event-list'} disablePadding>
      {events.map((event) => (
        <EventListItem
          key={event.code}
          event={event}
          missedDueTo={missedHackDays[event.code]}
          onEventToggle={onEventToggle}
        />
      ))}
    </List>
  );
}
