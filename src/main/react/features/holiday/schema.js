import { object, string, array, number } from "yup";
import { PERIOD_FORM_SCHEMA } from "../../components/period";

// eslint-disable-next-line no-underscore-dangle
const _defaultObject = {
  id: string(),
  code: string(),
  description: string()
    .required("Field required")
    .default(""),
  hours: number(),
  status: string()
};

const HOLIDAY_SCHEMA = object(_defaultObject)
  .shape({
    person: string().transform(value => (value === null ? "" : value)),
    period: object().shape({
      id: number(),
      days: array(
        object().shape({
          id: number(),
          hours: number(),
          date: string()
        })
      ),
      from: string(),
      to: string()
    })
  })
  .from("personCode", "person", false);

const HOLIDAY_FORM_SCHEMA = object(_defaultObject)
  .shape({
    personCode: string().transform(value => (value === null ? "" : value)),
    period: PERIOD_FORM_SCHEMA
  })
  .from("person", "personCode", false);

const isHoliday = async it => {
  const valid = await HOLIDAY_SCHEMA.isValid(it);
  return valid;
};

const isHolidayForm = async it => {
  const valid = await HOLIDAY_FORM_SCHEMA.isValid(it);
  return valid;
};

const toHoliday = holidayForm => {
  if (isHolidayForm) return HOLIDAY_SCHEMA.cast(holidayForm);
  return null;
};

const toHolidayForm = holiday => {
  if (isHoliday(holiday)) return HOLIDAY_FORM_SCHEMA.cast(holiday);
  if (isHolidayForm) return holiday;
  return null;
};

export {
  HOLIDAY_SCHEMA,
  HOLIDAY_FORM_SCHEMA,
  isHoliday,
  isHolidayForm,
  toHoliday,
  toHolidayForm
};
