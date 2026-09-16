import { boolean, type InferType, object, string } from 'yup';
import type { Laptop, LaptopRequest } from '../../clients/LaptopClient';

export const LAPTOP_FORM_SCHEMA = object({
  name: string().trim().required('Name is required').max(255).default(''),
  serialNumber: string()
    .trim()
    .required('Serial number is required')
    .max(255)
    .default(''),
  contractSigned: boolean().default(false),
  // The uuid of the person the laptop is handed out to; '' when nobody has it.
  personId: string().default(''),
});

export type LaptopFormValues = InferType<typeof LAPTOP_FORM_SCHEMA>;

export const toLaptopFormValues = (laptop: Laptop): LaptopFormValues => ({
  name: laptop.name,
  serialNumber: laptop.serialNumber,
  contractSigned: laptop.contractSigned,
  personId: laptop.person?.uuid ?? '',
});

export const toLaptopRequest = (values: LaptopFormValues): LaptopRequest => ({
  name: values.name.trim(),
  serialNumber: values.serialNumber.trim(),
  contractSigned: values.contractSigned,
  personId: values.personId || undefined,
});
