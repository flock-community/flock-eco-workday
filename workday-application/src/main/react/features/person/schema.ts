import { boolean, object, string } from 'yup';
import { ADDRESS_FIELDS } from './address';

/** Four digits (not starting with 0) and two letters; PostNL never issues SA, SD or SS. */
export const DUTCH_POSTAL_CODE = /^[1-9][0-9]{3}\s?(?!SA|SD|SS)[A-Z]{2}$/i;

/** A plain number between 1 and 99999; letters and suffixes go in the addition. */
export const DUTCH_HOUSE_NUMBER = /^[1-9][0-9]{0,4}$/;

const hasText = (value: unknown): boolean =>
  typeof value === 'string' && value.trim() !== '';

/**
 * The address is optional as a whole, but as soon as one of its fields is
 * filled in the others (except the addition) become required.
 */
const requiredWithinAddress = (label: string) =>
  string()
    .default('')
    .test(
      'required-within-address',
      `${label} is required when an address is given`,
      function (value) {
        const parent = this.parent ?? {};
        const anyFilled = ADDRESS_FIELDS.some((field) =>
          hasText(parent[field]),
        );
        return !anyFilled || hasText(value);
      },
    );

const ADDRESS_FORM_SCHEMA = object({
  street: requiredWithinAddress('Street').max(255),
  houseNumber: requiredWithinAddress('House number').matches(
    DUTCH_HOUSE_NUMBER,
    {
      excludeEmptyString: true,
      message: 'House number must be a number; put letters in the addition',
    },
  ),
  houseNumberAddition: string().default('').max(20),
  postalCode: requiredWithinAddress('Postal code').matches(DUTCH_POSTAL_CODE, {
    excludeEmptyString: true,
    message: 'Use a Dutch postal code such as 1234 AB',
  }),
  city: requiredWithinAddress('City').max(255),
});

const _defaultObject = {
  code: string(),
  firstname: string().required().default(''),
  lastname: string().required().default(''),
  email: string().email().default(''),
  number: string().default('').nullable(),
  position: string().default(''),
  reminders: boolean().default(false),
  receiveEmail: boolean().default(true),
  shoeSize: string().default('').nullable(),
  shirtSize: string().default('').nullable(),
  address: ADDRESS_FORM_SCHEMA,
};

const PERSON_SCHEMA = object(_defaultObject)
  .shape({
    user: string().transform((value) => (value === null ? '' : value)),
  })
  .from('userCode', 'user', false);

const PERSON_FORM_SCHEMA = object(_defaultObject).shape({
  userCode: string().transform((value) => (value === null ? '' : value)),
});

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

export {
  ADDRESS_FORM_SCHEMA,
  PERSON_SCHEMA,
  PERSON_FORM_SCHEMA,
  toPerson,
  toPersonForm,
};
