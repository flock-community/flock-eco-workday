import { wirespecFetch } from '@flock/wirespec/wirespec-fetch';
import { wirespecSerialization } from '@flock/wirespec/wirespec-serialization';
import { JobCreate } from '../wirespec/endpoint/JobCreate';
import { JobDeleteByCode } from '../wirespec/endpoint/JobDeleteByCode';
import { JobFindAll } from '../wirespec/endpoint/JobFindAll';
import { JobFindByCode } from '../wirespec/endpoint/JobFindByCode';
import { JobUpdate } from '../wirespec/endpoint/JobUpdate';
import type { Job, JobForm, JobStatus } from '../wirespec/model';

export type {
  Job,
  JobDocument,
  JobForm as JobRequest,
  JobStatus,
} from '../wirespec/model';

const findAllEdge = JobFindAll.client(wirespecSerialization);
const findByCodeEdge = JobFindByCode.client(wirespecSerialization);
const createEdge = JobCreate.client(wirespecSerialization);
const updateEdge = JobUpdate.client(wirespecSerialization);
const deleteEdge = JobDeleteByCode.client(wirespecSerialization);

const findAllByPage = async (pageable: {
  page: number;
  size: number;
  sort: string;
}) => {
  const request = JobFindAll.request({
    pageable: {
      page: pageable.page,
      size: pageable.size,
      sort: [pageable.sort],
    },
  });
  const raw = await wirespecFetch(findAllEdge.to(request));
  const response = findAllEdge.from(raw);
  return { list: response.body, count: response.body.length };
};

const findAllByStatus = async (status: JobStatus, page = 0, size = 100) => {
  const request = JobFindAll.request({
    status,
    pageable: { page, size, sort: ['title,asc'] },
  });
  const raw = await wirespecFetch(findAllEdge.to(request));
  const response = findAllEdge.from(raw);
  return { list: response.body, count: response.body.length };
};

const get = async (code: string): Promise<Job> => {
  const request = JobFindByCode.request({ code });
  const raw = await wirespecFetch(findByCodeEdge.to(request));
  const response = findByCodeEdge.from(raw);
  return response.body;
};

const post = async (input: JobForm): Promise<Job> => {
  const request = JobCreate.request({ body: input });
  const raw = await wirespecFetch(createEdge.to(request));
  const response = createEdge.from(raw);
  return response.body;
};

const put = async (code: string, input: JobForm): Promise<Job> => {
  const request = JobUpdate.request({ code, body: input });
  const raw = await wirespecFetch(updateEdge.to(request));
  const response = updateEdge.from(raw);
  return response.body;
};

const del = async (code: string): Promise<void> => {
  const request = JobDeleteByCode.request({ code });
  await wirespecFetch(deleteEdge.to(request));
};

export const JobClient = {
  findAllByPage,
  findAllByStatus,
  get,
  post,
  put,
  delete: del,
};
