import dayjs, { type Dayjs } from 'dayjs';
import { boolean, mixed, object, string } from 'yup';
import type { Laptop, LaptopRequest } from '../../clients/LaptopClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';
import { validateIsoDate } from '../../wirespec/model/IsoDate';
import { validateLaptopName } from '../../wirespec/model/LaptopName';
import { validateLaptopSerialNumber } from '../../wirespec/model/LaptopSerialNumber';
import { validateUUID } from '../../wirespec/model/UUID';

export type LaptopFormValues = {
  name: string;
  serialNumber: string;
  contractSigned: boolean;
  /** The day the laptop was bought; null when unknown. */
  purchaseDate: Dayjs | null;
  /** The uuid of the person the laptop is handed out to; '' when nobody has it. */
  personId: string;
};

/**
 * Mirrors the wirespec contract (laptops.ws): `required` gives the friendly message
 * for an empty field, the generated `validate*` guards apply the contract's patterns.
 */
export const LAPTOP_FORM_SCHEMA = object({
  name: string()
    .trim()
    .required('Name is required')
    .default('')
    .test('contract', 'Name may be at most 255 characters', (value) =>
      validateLaptopName(value),
    ),
  serialNumber: string()
    .trim()
    .required('Serial number is required')
    .default('')
    .test('contract', 'Serial number may be at most 255 characters', (value) =>
      validateLaptopSerialNumber(value),
    ),
  contractSigned: boolean().default(false),
  purchaseDate: mixed<Dayjs>()
    .nullable()
    .default(null)
    .test(
      'contract',
      'Purchase date must be a valid date',
      (value) =>
        value == null ||
        (dayjs.isDayjs(value) &&
          value.isValid() &&
          validateIsoDate(value.format(ISO_8601_DATE))),
    ),
  personId: string()
    .default('')
    .test(
      'contract',
      'Pick a person from the list',
      (value) => value === '' || validateUUID(value),
    ),
});

export const toLaptopFormValues = (laptop: Laptop): LaptopFormValues => ({
  name: laptop.name,
  serialNumber: laptop.serialNumber,
  contractSigned: laptop.contractSigned,
  purchaseDate: laptop.purchaseDate ?? null,
  personId: laptop.person?.uuid ?? '',
});

export const toLaptopRequest = (values: LaptopFormValues): LaptopRequest => ({
  name: values.name.trim(),
  serialNumber: values.serialNumber.trim(),
  contractSigned: values.contractSigned,
  purchaseDate: values.purchaseDate
    ? values.purchaseDate.format(ISO_8601_DATE)
    : undefined,
  personId: values.personId || undefined,
});
