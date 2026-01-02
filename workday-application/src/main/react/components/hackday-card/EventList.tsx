import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import type { FlockEvent } from '../../clients/EventClient';
import { EventListItem } from './EventListItem';

type FlockEventListProps = {
  events: FlockEvent[];
  onEventToggle: (event: FlockEvent, isSubscribed: boolean) => void;
};

export function EventList({ events, onEventToggle }: FlockEventListProps) {
  if (events && events.length === 0) {
    return (
      <Typography display={'block'}>There are no events planned.</Typography>
    );
  }

  return (
    <List data-testid={'flock-event-list'}>
      {events.map((event) => (
        <EventListItem
          key={event.code}
          event={event}
          onEventToggle={onEventToggle}
        />
      ))}
    </List>
  );
}
