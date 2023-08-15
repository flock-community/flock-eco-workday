import { object, string, boolean } from "yup";

// eslint-disable-next-line no-underscore-dangle
const _defaultObject = {
  code: string(),
  firstname: string().required().default(""),
  lastname: string().required().default(""),
  email: string().email().default(""),
  number: string().default("").nullable(),
  position: string().default(""),
  reminders: boolean().default(false),
  shoeSize: string().default("").nullable(),
  shirtSize: string().default("").nullable(),
};

const PERSON_SCHEMA = object(_defaultObject)
  .shape({
    user: string().transform((value) => (value === null ? "" : value)),
  })
  .from("userCode", "user", false);

const PERSON_FORM_SCHEMA = object(_defaultObject)
  .shape({
    userCode: string().transform((value) => (value === null ? "" : value)),
  })
  .from("user", "userCode", false);

const toPerson = async (personForm) => {
  const isPersonForm = await PERSON_FORM_SCHEMA.isValid(personForm);
  if (isPersonForm) return PERSON_SCHEMA.cast(personForm);
  return null;
};

const toPersonForm = async (person) => {
  const isPersonForm = await PERSON_FORM_SCHEMA.isValid(person);
  const isPerson = await PERSON_SCHEMA.isValid(person);
  if (isPerson) return PERSON_FORM_SCHEMA.cast(person);
  if (isPersonForm) return person;
  return null;
};

export { PERSON_SCHEMA, PERSON_FORM_SCHEMA, toPerson, toPersonForm };
