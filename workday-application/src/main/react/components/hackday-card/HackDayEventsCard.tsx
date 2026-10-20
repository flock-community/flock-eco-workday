import { Card, CardContent, CardHeader } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import {
  EventClient,
  type FlockEvent,
  type HackDayMissReason,
} from '../../clients/EventClient';
import { subscribeToEvent, unsubscribeFromEvent } from '../../utils/EventUtils';
import { HackDayList } from './HackDayList';

type HackDayEventsCardProps = {
  onToggle?: () => void;
};

export function HackDayEventsCard({ onToggle }: HackDayEventsCardProps) {
  const [flockEvents, setFlockEvents] = useState<FlockEvent[]>([]);
  const [missedHackDays, setMissedHackDays] = useState<
    Record<string, HackDayMissReason>
  >({});

  const fetchEvents = useCallback(() => {
    const year = new Date().getFullYear();
    EventClient.getHackDays(year).then((res) => setFlockEvents(res));
    EventClient.getMissedHackDays(year).then((res) => setMissedHackDays(res));
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const eventToggled = (
    event: FlockEvent,
    isPresent: boolean,
    hours?: number,
  ) => {
    (isPresent
      ? subscribeToEvent(event, hours)
      : unsubscribeFromEvent(event)
    ).then(() => {
      fetchEvents();
      onToggle?.();
    });
  };

  return (
    <Card variant="outlined" sx={{ borderRadius: '14px' }}>
      <CardHeader title="Hack days of this year" />
      <CardContent>
        <HackDayList
          items={flockEvents}
          missedHackDays={missedHackDays}
          onEventToggle={eventToggled}
        />
      </CardContent>
    </Card>
  );
}
