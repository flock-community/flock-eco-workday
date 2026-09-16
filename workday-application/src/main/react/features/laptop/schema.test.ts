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
  it('defaults to an empty, unsigned, unassigned laptop', () => {
    expect(LAPTOP_FORM_SCHEMA.getDefault()).toEqual({
      name: '',
      serialNumber: '',
      contractSigned: false,
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

  it('accepts a laptop without a person', async () => {
    await expect(
      LAPTOP_FORM_SCHEMA.isValid({
        name: 'MacBook Pro',
        serialNumber: 'C02XK1',
        contractSigned: true,
        personId: '',
      }),
    ).resolves.toBe(true);
  });
});

describe('toLaptopRequest', () => {
  it('trims text and leaves the person out when nobody has the laptop', () => {
    expect(
      toLaptopRequest({
        name: ' MacBook Pro ',
        serialNumber: ' C02XK1 ',
        contractSigned: false,
        personId: '',
      }),
    ).toEqual({
      name: 'MacBook Pro',
      serialNumber: 'C02XK1',
      contractSigned: false,
      personId: undefined,
    });
  });

  it('sends the person uuid when one is selected', () => {
    expect(
      toLaptopRequest({
        name: 'MacBook Pro',
        serialNumber: 'C02XK1',
        contractSigned: true,
        personId: 'b1b0f7e6-0c2e-4d7b-8c31-2f4ad4b3b1a0',
      }).personId,
    ).toBe('b1b0f7e6-0c2e-4d7b-8c31-2f4ad4b3b1a0');
  });
});

describe('toLaptopFormValues', () => {
  const laptop = {
    id: 1,
    code: 'abc',
    name: 'ThinkPad',
    serialNumber: 'PF3',
    contractSigned: true,
    person: null,
  };

  it('maps an unassigned laptop to an empty person', () => {
    expect(toLaptopFormValues(laptop)).toEqual({
      name: 'ThinkPad',
      serialNumber: 'PF3',
      contractSigned: true,
      personId: '',
    });
  });

  it('maps the linked person to its uuid', () => {
    const person = {
      uuid: 'b1b0f7e6-0c2e-4d7b-8c31-2f4ad4b3b1a0',
      email: 'tommy@sesam.straat',
      firstname: 'Tommy',
      lastname: 'Dog',
      fullName: 'Tommy Dog',
      active: true,
    };
    expect(toLaptopFormValues({ ...laptop, person }).personId).toBe(
      person.uuid,
    );
  });
});
