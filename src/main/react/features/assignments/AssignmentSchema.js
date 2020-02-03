// import * as Yup from "yup"
import {mixed, object, string, number} from "yup"
import moment from "moment"

// eslint-disable-next-line no-underscore-dangle
const schema = {
  hourlyRate: number()
    .required()
    .default(80),
  role: string().default(""),
  startDate: mixed()
    .required()
    .default(moment()),
  endDate: mixed().default(null),
  clientCode: mixed().required(),
}

export const ASSIGNMENT_FORM_SCHEMA = object(schema)
