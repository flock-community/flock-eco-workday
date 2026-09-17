import dayjs, { type Dayjs } from 'dayjs';
import { boolean, mixed, object, string } from 'yup';
import type { Laptop, LaptopRequest } from '../../clients/LaptopClient';
import { ISO_8601_DATE } from '../../clients/util/DateFormats';

export type LaptopFormValues = {
  name: string;
  serialNumber: string;
  contractSigned: boolean;
  /** The day the laptop was bought; null when unknown. */
  purchaseDate: Dayjs | null;
  /** The uuid of the person the laptop is handed out to; '' when nobody has it. */
  personId: string;
};

export const LAPTOP_FORM_SCHEMA = object({
  name: string().trim().required('Name is required').max(255).default(''),
  serialNumber: string()
    .trim()
    .required('Serial number is required')
    .max(255)
    .default(''),
  contractSigned: boolean().default(false),
  purchaseDate: mixed<Dayjs>()
    .nullable()
    .default(null)
    .test(
      'valid-date',
      'Purchase date must be a valid date',
      (value) => value == null || (dayjs.isDayjs(value) && value.isValid()),
    ),
  personId: string().default(''),
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
