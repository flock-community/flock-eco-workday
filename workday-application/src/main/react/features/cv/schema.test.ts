import dayjs from 'dayjs';
import type { Cv, CvImport } from '../../clients/CvClient';
import {
  CV_FORM_SCHEMA,
  type CvFormValues,
  emptyExperience,
  fromCvImport,
  toCvFormValues,
  toCvRequest,
} from './schema';

const errorsOf = async (values: unknown) => {
  try {
    await CV_FORM_SCHEMA.validate(values, { abortEarly: false });
    return [];
  } catch (error) {
    return error.inner.map((inner) => inner.path);
  }
};

const experience = {
  ...emptyExperience(),
  from: dayjs('2024-08-01'),
  role: 'Software Engineer',
  client: 'ING',
};

const values = (overrides: Partial<CvFormValues> = {}): CvFormValues => ({
  ...(CV_FORM_SCHEMA.getDefault() as CvFormValues),
  ...overrides,
});

describe('CV_FORM_SCHEMA', () => {
  it('defaults to an empty Dutch CV of your own', () => {
    expect(CV_FORM_SCHEMA.getDefault()).toEqual({
      personId: '',
      language: 'NL',
      place: '',
      phone: '',
      summary: '',
      experiences: [],
      skills: [],
      education: '',
      subjects: '',
      languages: '',
    });
  });

  it('accepts a CV without any experience', async () => {
    await expect(errorsOf(values())).resolves.toEqual([]);
  });

  it('requires a start month, role and client for every experience', async () => {
    await expect(
      errorsOf(values({ experiences: [emptyExperience()] })),
    ).resolves.toEqual(
      expect.arrayContaining([
        'experiences[0].from',
        'experiences[0].role',
        'experiences[0].client',
      ]),
    );
  });

  it('does not let an experience end before it starts', async () => {
    await expect(
      errorsOf(
        values({ experiences: [{ ...experience, to: dayjs('2024-07-01') }] }),
      ),
    ).resolves.toEqual(['experiences[0].to']);
    await expect(
      errorsOf(
        values({ experiences: [{ ...experience, to: dayjs('2024-08-01') }] }),
      ),
    ).resolves.toEqual([]);
  });

  it('limits the length of a technology', async () => {
    await expect(
      errorsOf(
        values({
          experiences: [
            { ...experience, technologies: ['Kotlin', 'x'.repeat(101)] },
          ],
        }),
      ),
    ).resolves.toEqual(['experiences[0].technologies[1]']);
  });

  it('applies the length limits of the contract', async () => {
    await expect(
      errorsOf(
        values({
          place: 'x'.repeat(256),
          summary: 'x'.repeat(10001),
          experiences: [{ ...experience, role: 'x'.repeat(256) }],
        }),
      ),
    ).resolves.toEqual(
      expect.arrayContaining(['place', 'summary', 'experiences[0].role']),
    );
  });

  it('requires a name for a skill and a rating from 1 to 5', async () => {
    await expect(
      errorsOf(
        values({
          skills: [
            { category: 'Tools', name: '', level: null },
            { category: '', name: 'Git', level: 6 },
            { category: '', name: 'Kotlin', level: null },
          ],
        }),
      ),
    ).resolves.toEqual(['skills[0].name', 'skills[1].level']);
  });

  it('only accepts a uuid as person', async () => {
    await expect(errorsOf(values({ personId: 'tommy' }))).resolves.toEqual([
      'personId',
    ]);
  });
});

describe('toCvRequest', () => {
  it('writes months as yyyy-MM, trims technologies and drops empty fields', () => {
    expect(
      toCvRequest(
        values({
          place: ' Utrecht ',
          languages: 'Dutch – Native\n',
          skills: [
            { category: ' Tools ', name: ' Git ', level: 5 },
            { category: '', name: 'Kotlin', level: null },
          ],
          experiences: [
            {
              ...experience,
              to: dayjs('2025-03-01'),
              employer: 'Flock',
              technologies: ['Kotlin', ' ', ' Typescript ', 'HTML, CSS'],
              description: '  Built things.  ',
            },
          ],
        }),
      ),
    ).toEqual({
      personId: undefined,
      language: 'NL',
      place: 'Utrecht',
      phone: undefined,
      summary: undefined,
      education: undefined,
      subjects: undefined,
      languages: 'Dutch – Native',
      skills: [
        { category: 'Tools', name: 'Git', level: 5 },
        { category: undefined, name: 'Kotlin', level: undefined },
      ],
      experiences: [
        {
          from: '2024-08',
          to: '2025-03',
          role: 'Software Engineer',
          client: 'ING',
          employer: 'Flock',
          technologies: ['Kotlin', 'Typescript', 'HTML, CSS'],
          description: 'Built things.',
        },
      ],
    });
  });

  it('sends no end month for the current job', () => {
    expect(
      toCvRequest(values({ experiences: [experience] })).experiences?.[0].to,
    ).toBeUndefined();
  });
});

describe('toCvFormValues and fromCvImport', () => {
  const stored: CvImport['experiences'] = [
    {
      from: '2024-08',
      to: undefined,
      role: 'Software Engineer',
      client: 'ING',
      employer: 'Flock',
      technologies: ['Kotlin', 'React'],
      description: 'Built things.',
    },
  ];

  it('reads a stored CV back into the form', () => {
    const cv = {
      code: 'cv-1',
      language: 'EN',
      place: 'Utrecht',
      phone: null,
      summary: 'Engineer.',
      experiences: stored,
      person: { uuid: '9b2f6c3e-4d1a-4a8e-9c1b-2f3e4d5a6b7c' },
    } as unknown as Cv;
    const form = toCvFormValues(cv);
    expect(form).toMatchObject({
      personId: '9b2f6c3e-4d1a-4a8e-9c1b-2f3e4d5a6b7c',
      language: 'EN',
      place: 'Utrecht',
      phone: '',
      summary: 'Engineer.',
    });
    expect(form.experiences[0].from?.format('YYYY-MM')).toBe('2024-08');
    expect(form.experiences[0].to).toBeNull();
    expect(form.experiences[0].technologies).toEqual(['Kotlin', 'React']);
  });

  it('starts a new CV from an import, falling back to Dutch', () => {
    const imported = {
      personId: null,
      name: 'Tommy Dog',
      language: null,
      summary: 'Engineer.',
      experiences: stored,
    } as unknown as CvImport;
    const form = fromCvImport(imported);
    expect(form.personId).toBe('');
    expect(form.language).toBe('NL');
    expect(form.summary).toBe('Engineer.');
    expect(form.experiences).toHaveLength(1);
    expect(toCvRequest(form).experiences?.[0]).toEqual({
      from: '2024-08',
      to: undefined,
      role: 'Software Engineer',
      client: 'ING',
      employer: 'Flock',
      technologies: ['Kotlin', 'React'],
      description: 'Built things.',
    });
  });
});
