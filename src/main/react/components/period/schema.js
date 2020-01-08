import {array, mixed, number, object, string} from "yup"
import moment from "moment"

const DATE_FORMAT = "YYYY-MM-DD"

const internalizeDate = date => moment(date, DATE_FORMAT)

const PERIOD_DAY_SCHEMA = object().shape({
  id: number(),
  hours: number(),
  date: string(),
})

const PERIOD_DAY_FORM_SCHEMA = object().shape({
  id: number(),
  hours: number(),
  date: mixed().transform(internalizeDate),
})

const PERIOD_SCHEMA = object().shape({
  id: number(),
  days: array(),
  from: string().transform(internalizeDate),
  to: string().transform(internalizeDate),
})

const PERIOD_FORM_SCHEMA = object().shape({
  id: number(),
  days: array(PERIOD_DAY_FORM_SCHEMA),
  from: mixed().transform(internalizeDate),
  to: mixed().transform(internalizeDate),
})

export {PERIOD_DAY_SCHEMA, PERIOD_DAY_FORM_SCHEMA, PERIOD_SCHEMA, PERIOD_FORM_SCHEMA}
