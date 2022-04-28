// import * as Yup from "yup"
import { mixed, number, object, string } from "yup";
import dayjs from "dayjs";

const schema = {
  hourlyRate: number().required().default(80),
  hoursPerWeek: number().required().default(36),
  role: string().default(""),
  from: mixed().required().default(dayjs()),
  to: mixed().default(null),
  clientCode: mixed().required(),
};

export const ASSIGNMENT_FORM_SCHEMA = object(schema);
