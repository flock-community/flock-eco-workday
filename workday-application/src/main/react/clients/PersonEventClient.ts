import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';
import {
  internalize as internalizePerson,
  type Person,
  type PersonRaw,
} from './PersonClient';

export type PersonEvent = {
  person: Person;
  eventType: PersonEventType;
  eventDate: Dayjs;
};

export type PersonEventRaw = {
  person: PersonRaw;
  eventType: PersonEventType;
  eventDate: string;
};

export type PersonEventType = 'BIRTHDAY' | 'JOIN_DAY';

const path = '/api/persons/specialDates';

const internalize = (json: PersonEventRaw): PersonEvent => ({
  ...json,
  person: internalizePerson(json.person),
  eventDate: dayjs(json.eventDate),
});

const internalizingClient = InternalizingClient<
  PersonEvent,
  PersonEventRaw,
  PersonEvent
>(path, internalize);

const findAllBetween = (start: Date, end: Date) => {
  const startString = start.toISOString().substring(0, 10);
  const endString = end.toISOString().substring(0, 10);

  return internalizingClient.query({ start: startString, end: endString });
};

export const PersonEventClient = {
  findAllBetween,
};
