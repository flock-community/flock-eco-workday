import { ADDRESS_FORM_SCHEMA, PERSON_FORM_SCHEMA } from './schema';

const validAddress = {
  street: 'Sesamstraat',
  houseNumber: '12',
  houseNumberAddition: 'A',
  postalCode: '1234 AB',
  city: 'Hilversum',
};

const emptyAddress = {
  street: '',
  houseNumber: '',
  houseNumberAddition: '',
  postalCode: '',
  city: '',
};

const errorsOf = async (address: Record<string, string>) => {
  try {
    await ADDRESS_FORM_SCHEMA.validate(address, { abortEarly: false });
    return [];
  } catch (error) {
    return error.inner.map((inner) => inner.path);
  }
};

describe('ADDRESS_FORM_SCHEMA', () => {
  it('accepts an empty address', async () => {
    await expect(ADDRESS_FORM_SCHEMA.isValid(emptyAddress)).resolves.toBe(true);
  });

  it('accepts a complete Dutch address', async () => {
    await expect(ADDRESS_FORM_SCHEMA.isValid(validAddress)).resolves.toBe(true);
    await expect(
      ADDRESS_FORM_SCHEMA.isValid({
        ...validAddress,
        houseNumberAddition: '',
        postalCode: '1234ab',
      }),
    ).resolves.toBe(true);
  });

  it('requires street, house number, postal code and city once any field is filled', async () => {
    expect(await errorsOf({ ...emptyAddress, street: 'Sesamstraat' })).toEqual(
      expect.arrayContaining(['houseNumber', 'postalCode', 'city']),
    );
    expect(
      await errorsOf({ ...emptyAddress, houseNumberAddition: 'A' }),
    ).toEqual(
      expect.arrayContaining(['street', 'houseNumber', 'postalCode', 'city']),
    );
  });

  it('rejects postal codes that are not Dutch', async () => {
    for (const postalCode of [
      '1234',
      '0234 AB',
      '1234 ABC',
      'SW1A 1AA',
      '1234 SS',
    ]) {
      expect(await errorsOf({ ...validAddress, postalCode })).toEqual([
        'postalCode',
      ]);
    }
  });

  it('rejects house numbers that are not a plain number', async () => {
    for (const houseNumber of ['12A', '0', '12-14', '100000']) {
      expect(await errorsOf({ ...validAddress, houseNumber })).toEqual([
        'houseNumber',
      ]);
    }
  });
});

describe('PERSON_FORM_SCHEMA', () => {
  it('defaults to an empty address', () => {
    expect(PERSON_FORM_SCHEMA.getDefault().address).toEqual(emptyAddress);
  });

  it('accepts a person with a complete address', async () => {
    await expect(
      PERSON_FORM_SCHEMA.isValid({
        ...PERSON_FORM_SCHEMA.getDefault(),
        firstname: 'Bert',
        lastname: 'Muppets',
        address: validAddress,
      }),
    ).resolves.toBe(true);
  });

  it('rejects a person with a half-filled address', async () => {
    await expect(
      PERSON_FORM_SCHEMA.isValid({
        ...PERSON_FORM_SCHEMA.getDefault(),
        firstname: 'Bert',
        lastname: 'Muppets',
        address: { ...emptyAddress, city: 'Hilversum' },
      }),
    ).resolves.toBe(false);
  });
});
