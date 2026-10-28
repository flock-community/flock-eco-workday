import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';
import {
  internalize as internalizePerson,
  type Person,
  type PersonRaw,
} from './PersonClient';

export type MidYearTalkDue = {
  person: Person;
  lastTalk: Dayjs | null;
  dueDate: Dayjs | null;
};

export type MidYearTalkDueRaw = {
  person: PersonRaw;
  lastTalk: string | null;
  dueDate: string | null;
};

const path = '/api/persons/mid-year-talks';

const internalize = (json: MidYearTalkDueRaw): MidYearTalkDue => ({
  person: internalizePerson(json.person),
  lastTalk: json.lastTalk ? dayjs(json.lastTalk) : null,
  dueDate: json.dueDate ? dayjs(json.dueDate) : null,
});

const internalizingClient = InternalizingClient<
  MidYearTalkDue,
  MidYearTalkDueRaw,
  MidYearTalkDue
>(path, internalize);

const findAllDueBefore = (before: Date) =>
  internalizingClient.query({ before: before.toISOString().substring(0, 10) });

export const MidYearTalkClient = {
  findAllDueBefore,
};
