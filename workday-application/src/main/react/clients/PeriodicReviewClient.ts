import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';
import {
  internalize as internalizePerson,
  type Person,
  type PersonRaw,
} from './PersonClient';

export type PeriodicReviewDue = {
  person: Person;
  lastReview: Dayjs | null;
  dueDate: Dayjs | null;
};

export type PeriodicReviewDueRaw = {
  person: PersonRaw;
  lastReview: string | null;
  dueDate: string | null;
};

const path = '/api/persons/periodic-reviews';

const internalize = (json: PeriodicReviewDueRaw): PeriodicReviewDue => ({
  person: internalizePerson(json.person),
  lastReview: json.lastReview ? dayjs(json.lastReview) : null,
  dueDate: json.dueDate ? dayjs(json.dueDate) : null,
});

const internalizingClient = InternalizingClient<
  PeriodicReviewDue,
  PeriodicReviewDueRaw,
  PeriodicReviewDue
>(path, internalize);

const findAllDueBefore = (before: Date) =>
  internalizingClient.query({ before: before.toISOString().substring(0, 10) });

export const PeriodicReviewClient = {
  findAllDueBefore,
};
