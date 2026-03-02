import { array, mixed, number, object, string } from 'yup';

const schema = {
  title: string().required('Title is required').default(''),
  description: string().required('Description is required').default(''),
  hourlyRate: number().nullable().default(null),
  hoursPerWeek: number().nullable().default(null),
  from: mixed().nullable().default(null),
  to: mixed().nullable().default(null),
  status: string().required().default('DRAFT'),
  clientCode: mixed().nullable().default(null),
  documents: array().default([]),
};

export const JOB_FORM_SCHEMA = object(schema);
