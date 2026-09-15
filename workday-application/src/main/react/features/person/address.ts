import type { Address, AddressRequest } from '../../clients/PersonClient';

/** The address as edited in the person form: every field is a (possibly empty) string. */
export type AddressFormValues = {
  street: string;
  houseNumber: string;
  houseNumberAddition: string;
  postalCode: string;
  city: string;
};

export const EMPTY_ADDRESS: AddressFormValues = {
  street: '',
  houseNumber: '',
  houseNumberAddition: '',
  postalCode: '',
  city: '',
};

export const ADDRESS_FIELDS = Object.keys(
  EMPTY_ADDRESS,
) as (keyof AddressFormValues)[];

const trimmed = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : '';

/**
 * Form values for an address from the API. Missing values become empty strings
 * so the inputs stay controlled.
 */
export const toAddressFormValues = (
  address?: Address | null,
): AddressFormValues => ({
  street: address?.street ?? '',
  houseNumber: address?.houseNumber ?? '',
  houseNumberAddition: address?.houseNumberAddition ?? '',
  postalCode: address?.postalCode ?? '',
  city: address?.city ?? '',
});

/**
 * Request payload for the entered address, or null when nothing was entered so
 * the backend clears the address instead of storing five empty strings.
 */
export const toAddressRequest = (
  values?: Partial<AddressFormValues> | null,
): AddressRequest | null => {
  if (!values) return null;
  const street = trimmed(values.street);
  const houseNumber = trimmed(values.houseNumber);
  const houseNumberAddition = trimmed(values.houseNumberAddition);
  const postalCode = trimmed(values.postalCode);
  const city = trimmed(values.city);
  const anyFilled = [
    street,
    houseNumber,
    houseNumberAddition,
    postalCode,
    city,
  ].some(Boolean);
  if (!anyFilled) return null;
  return {
    street,
    houseNumber,
    houseNumberAddition: houseNumberAddition || undefined,
    postalCode,
    city,
  };
};

/**
 * The two lines of a Dutch address: "Sesamstraat 12A" and "1234 AB Hilversum".
 * A single-letter addition is glued to the number (12A), anything longer is
 * separated by a space (12 bis).
 */
export const formatAddressLines = (address: Address): [string, string] => {
  const addition = address.houseNumberAddition?.trim() ?? '';
  const separator = /^[a-z]$/i.test(addition) ? '' : ' ';
  const number = addition
    ? `${address.houseNumber}${separator}${addition}`
    : address.houseNumber;
  return [
    `${address.street} ${number}`,
    `${address.postalCode} ${address.city}`,
  ];
};
