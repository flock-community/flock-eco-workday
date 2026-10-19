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
  const [sickEventCodes, setSickEventCodes] = useState<string[]>([]);

  const fetchEvents = useCallback(() => {
    const year = new Date().getFullYear();
    EventClient.getHackDays(year).then((res) => setFlockEvents(res));
    EventClient.getSickHackDayCodes(year).then((res) => setSickEventCodes(res));
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
          lockedEventCodes={sickEventCodes}
          onEventToggle={eventToggled}
        />
      </CardContent>
    </Card>
  );
}
