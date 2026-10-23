import * as Yup from 'yup';

// Parses user input as a decimal number, accepting both a dot and a comma
// as decimal separator (e.g. "12.50" and "12,50").
export const parseDecimal = (input: string): number | undefined => {
  const normalized = input.trim().replace(',', '.');
  return normalized === '' ? undefined : Number(normalized);
};

export const decimalNumber = () =>
  Yup.number()
    .transform((value, originalValue) =>
      typeof originalValue === 'string' ? parseDecimal(originalValue) : value,
    )
    .typeError('Must be a number');
