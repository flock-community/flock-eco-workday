import dayjs from 'dayjs';
import {
  LAPTOP_FORM_SCHEMA,
  toLaptopFormValues,
  toLaptopRequest,
} from './schema';

const errorsOf = async (values: Record<string, unknown>) => {
  try {
    await LAPTOP_FORM_SCHEMA.validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    return error.inner.map((inner) => inner.path);
  }
};

describe('LAPTOP_FORM_SCHEMA', () => {
  it('defaults to an empty, unsigned, unassigned laptop without a purchase date', () => {
    expect(LAPTOP_FORM_SCHEMA.getDefault()).toEqual({
      name: '',
      serialNumber: '',
      contractSigned: false,
      purchaseDate: null,
      personId: '',
    });
  });

  it('requires a name and a serial number', async () => {
    await expect(errorsOf(LAPTOP_FORM_SCHEMA.getDefault())).resolves.toEqual(
      expect.arrayContaining(['name', 'serialNumber']),
    );
  });

  it('treats whitespace-only values as missing', async () => {
    await expect(
      errorsOf({ name: '   ', serialNumber: '\t', contractSigned: false }),
    ).resolves.toEqual(expect.arrayContaining(['name', 'serialNumber']));
  });

  it('accepts a laptop without a person or purchase date', async () => {
    await expect(
      LAPTOP_FORM_SCHEMA.isValid({
        name: 'MacBook Pro',
        serialNumber: 'C02XK1',
        contractSigned: true,
        purchaseDate: null,
        personId: '',
      }),
    ).resolves.toBe(true);
  });

  it('accepts a valid purchase date and rejects an invalid one', async () => {
    const valid = {
      name: 'MacBook Pro',
      serialNumber: 'C02XK1',
      contractSigned: false,
      personId: '',
    };
    await expect(
      LAPTOP_FORM_SCHEMA.isValid({
        ...valid,
        purchaseDate: dayjs('2024-05-03'),
      }),
    ).resolves.toBe(true);
    await expect(
      errorsOf({ ...valid, purchaseDate: dayjs('not a date') }),
    ).resolves.toEqual(['purchaseDate']);
  });
});

describe('toLaptopRequest', () => {
  it('trims text and leaves the person and date out when unknown', () => {
    expect(
      toLaptopRequest({
        name: ' MacBook Pro ',
        serialNumber: ' C02XK1 ',
        contractSigned: false,
        purchaseDate: null,
        personId: '',
      }),
    ).toEqual({
      name: 'MacBook Pro',
      serialNumber: 'C02XK1',
      contractSigned: false,
      purchaseDate: undefined,
      personId: undefined,
    });
  });

  it('sends the person uuid and the purchase date as an ISO date', () => {
    const request = toLaptopRequest({
      name: 'MacBook Pro',
      serialNumber: 'C02XK1',
      contractSigned: true,
      purchaseDate: dayjs('2024-05-03'),
      personId: 'b1b0f7e6-0c2e-4d7b-8c31-2f4ad4b3b1a0',
    });
    expect(request.personId).toBe('b1b0f7e6-0c2e-4d7b-8c31-2f4ad4b3b1a0');
    expect(request.purchaseDate).toBe('2024-05-03');
  });
});

describe('toLaptopFormValues', () => {
  const laptop = {
    id: 1,
    code: 'abc',
    name: 'ThinkPad',
    serialNumber: 'PF3',
    contractSigned: true,
    purchaseDate: null,
    person: null,
  };

  it('maps an unassigned laptop without a date to empty form values', () => {
    expect(toLaptopFormValues(laptop)).toEqual({
      name: 'ThinkPad',
      serialNumber: 'PF3',
      contractSigned: true,
      purchaseDate: null,
      personId: '',
    });
  });

  it('maps the linked person to its uuid and keeps the purchase date', () => {
    const person = {
      uuid: 'b1b0f7e6-0c2e-4d7b-8c31-2f4ad4b3b1a0',
      email: 'tommy@sesam.straat',
      firstname: 'Tommy',
      lastname: 'Dog',
      fullName: 'Tommy Dog',
      active: true,
    };
    const purchaseDate = dayjs('2024-05-03');
    const values = toLaptopFormValues({ ...laptop, person, purchaseDate });
    expect(values.personId).toBe(person.uuid);
    expect(values.purchaseDate).toBe(purchaseDate);
  });
});
