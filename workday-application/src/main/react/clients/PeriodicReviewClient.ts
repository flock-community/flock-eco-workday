import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';

export type PeriodicReviewDue = {
  personUuid: string;
  personName: string;
  lastReview: Dayjs;
  dueDate: Dayjs;
};

export type PeriodicReviewDueRaw = {
  personUuid: string;
  personName: string;
  lastReview: string;
  dueDate: string;
};

const path = '/api/persons/periodic-reviews';

const internalize = (json: PeriodicReviewDueRaw): PeriodicReviewDue => ({
  personUuid: json.personUuid,
  personName: json.personName,
  lastReview: dayjs(json.lastReview),
  dueDate: dayjs(json.dueDate),
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
