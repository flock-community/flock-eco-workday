import { Card, CardContent, CardHeader } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { EventClient, type FlockEvent } from '../../clients/EventClient';
import { subscribeToEvent, unsubscribeFromEvent } from '../../utils/EventUtils';
import { HackDayList } from './HackDayList';

type HackDayEventsCardProps = {
  onToggle?: () => void;
};

export function HackDayEventsCard({ onToggle }: HackDayEventsCardProps) {
  const [flockEvents, setFlockEvents] = useState<FlockEvent[]>([]);

  const fetchEvents = useCallback(() => {
    EventClient.getHackDays(new Date().getFullYear()).then((res) =>
      setFlockEvents(res),
    );
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const eventToggled = (event: FlockEvent, isPresent: boolean) => {
    (isPresent ? subscribeToEvent(event) : unsubscribeFromEvent(event)).then(
      () => {
        fetchEvents();
        onToggle?.();
      },
    );
  };

  return (
    <Card variant="outlined" style={{ borderRadius: 0 }}>
      <CardHeader title="Hack days of this year" />
      <CardContent>
        <HackDayList items={flockEvents} onEventToggle={eventToggled} />
      </CardContent>
    </Card>
  );
}
