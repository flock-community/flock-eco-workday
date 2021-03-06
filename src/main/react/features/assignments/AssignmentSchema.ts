// import * as Yup from "yup"
import { mixed, object, string, number } from "yup";
import moment from "moment";

const schema = {
  hourlyRate: number().required().default(80),
  hoursPerWeek: number().required().default(36),
  role: string().default(""),
  from: mixed().required().default(moment()),
  to: mixed().default(null),
  clientCode: mixed().required(),
};

export const ASSIGNMENT_FORM_SCHEMA = object(schema);
