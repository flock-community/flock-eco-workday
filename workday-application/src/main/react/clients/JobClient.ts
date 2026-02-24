import NonInternalizingClient from '../utils/NonInternalizingClient';

export type JobDocument = {
  name: string;
  file: string;
};

export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED';

export type Job = {
  id: number;
  code: string;
  title: string;
  description: string;
  hourlyRate: number | null;
  hoursPerWeek: number | null;
  from: string | null;
  to: string | null;
  status: JobStatus;
  client: { id: number; code: string; name: string } | null;
  documents: JobDocument[];
};

export type JobRequest = {
  title: string;
  description: string;
  hourlyRate: number | null;
  hoursPerWeek: number | null;
  from: string | null;
  to: string | null;
  status: JobStatus;
  clientCode: string | null;
  documents: JobDocument[];
};

const path = '/api/jobs';

const nonInternalizingClient = NonInternalizingClient<JobRequest, Job>(path);

const findAllByStatus = (status: JobStatus, page = 0, size = 100) =>
  nonInternalizingClient.queryByPage(
    { page, size, sort: 'title,asc' },
    { status },
  );

export const JobClient = {
  ...nonInternalizingClient,
  findAllByStatus,
};
