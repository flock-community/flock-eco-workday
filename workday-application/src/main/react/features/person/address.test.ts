import type { Address } from '../../clients/PersonClient';
import {
  formatAddressLines,
  toAddressFormValues,
  toAddressRequest,
} from './address';

const sesamstraat: Address = {
  street: 'Sesamstraat',
  houseNumber: '12',
  houseNumberAddition: 'A',
  postalCode: '1234 AB',
  city: 'Hilversum',
};

describe('toAddressFormValues', () => {
  it('maps a missing address to empty strings so inputs stay controlled', () => {
    expect(toAddressFormValues(null)).toEqual({
      street: '',
      houseNumber: '',
      houseNumberAddition: '',
      postalCode: '',
      city: '',
    });
    expect(toAddressFormValues(undefined)).toEqual(toAddressFormValues(null));
  });

  it('maps a null addition to an empty string and keeps the other fields', () => {
    expect(
      toAddressFormValues({ ...sesamstraat, houseNumberAddition: null }),
    ).toEqual({
      street: 'Sesamstraat',
      houseNumber: '12',
      houseNumberAddition: '',
      postalCode: '1234 AB',
      city: 'Hilversum',
    });
  });
});

describe('toAddressRequest', () => {
  it('returns null when nothing was entered', () => {
    expect(toAddressRequest(null)).toBeNull();
    expect(toAddressRequest(undefined)).toBeNull();
    expect(
      toAddressRequest({
        street: '',
        houseNumber: '  ',
        houseNumberAddition: '',
        postalCode: '',
        city: '',
      }),
    ).toBeNull();
  });

  it('trims the fields and drops an empty addition', () => {
    expect(
      toAddressRequest({
        street: ' Sesamstraat ',
        houseNumber: ' 12',
        houseNumberAddition: ' ',
        postalCode: '1234ab ',
        city: ' Hilversum',
      }),
    ).toEqual({
      street: 'Sesamstraat',
      houseNumber: '12',
      houseNumberAddition: undefined,
      postalCode: '1234ab',
      city: 'Hilversum',
    });
  });

  it('keeps a partial address so the backend can reject it', () => {
    expect(
      toAddressRequest({
        street: 'Sesamstraat',
        houseNumber: '',
        houseNumberAddition: '',
        postalCode: '',
        city: '',
      }),
    ).toEqual({
      street: 'Sesamstraat',
      houseNumber: '',
      houseNumberAddition: undefined,
      postalCode: '',
      city: '',
    });
  });
});

describe('formatAddressLines', () => {
  it('glues a single-letter addition to the house number', () => {
    expect(formatAddressLines(sesamstraat)).toEqual([
      'Sesamstraat 12A',
      '1234 AB Hilversum',
    ]);
  });

  it('separates a longer addition with a space', () => {
    expect(
      formatAddressLines({ ...sesamstraat, houseNumberAddition: 'bis' }),
    ).toEqual(['Sesamstraat 12 bis', '1234 AB Hilversum']);
  });

  it('omits the addition when there is none', () => {
    expect(
      formatAddressLines({ ...sesamstraat, houseNumberAddition: null }),
    ).toEqual(['Sesamstraat 12', '1234 AB Hilversum']);
  });
});
