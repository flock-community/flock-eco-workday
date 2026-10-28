import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';

export type PeriodicReviewDue = {
  personUuid: string;
  personName: string;
  lastReview: Dayjs | null;
  dueDate: Dayjs | null;
};

export type PeriodicReviewDueRaw = {
  personUuid: string;
  personName: string;
  lastReview: string | null;
  dueDate: string | null;
};

const path = '/api/persons/periodic-reviews';

const internalize = (json: PeriodicReviewDueRaw): PeriodicReviewDue => ({
  personUuid: json.personUuid,
  personName: json.personName,
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
