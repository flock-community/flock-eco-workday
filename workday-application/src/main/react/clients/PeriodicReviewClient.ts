import dayjs, { type Dayjs } from 'dayjs';
import InternalizingClient from '../utils/InternalizingClient';

// Last review and due date are missing for a person who never had a review.
export type PeriodicReviewDue = {
  personUuid: string;
  personName: string;
  lastReview?: Dayjs;
  dueDate?: Dayjs;
};

export type PeriodicReviewDueRaw = {
  personUuid: string;
  personName: string;
  lastReview?: string;
  dueDate?: string;
};

const path = '/api/persons/periodic-reviews';

const internalize = (json: PeriodicReviewDueRaw): PeriodicReviewDue => ({
  personUuid: json.personUuid,
  personName: json.personName,
  lastReview: json.lastReview ? dayjs(json.lastReview) : undefined,
  dueDate: json.dueDate ? dayjs(json.dueDate) : undefined,
});

const internalizingClient = InternalizingClient<
  PeriodicReviewDue,
  PeriodicReviewDueRaw,
  PeriodicReviewDue
>(path, internalize);

const internalClient = InternalizingClient<
  PeriodicReviewDue,
  PeriodicReviewDueRaw,
  PeriodicReviewDue
>(`${path}/internal`, internalize);

const findAllDueBefore = (before: Date) =>
  internalizingClient.query({ before: before.toISOString().substring(0, 10) });

const findAllInternal = () => internalClient.all();

export const PeriodicReviewClient = {
  findAllDueBefore,
  findAllInternal,
};
