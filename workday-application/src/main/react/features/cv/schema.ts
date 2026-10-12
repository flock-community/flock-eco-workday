import dayjs, { type Dayjs } from 'dayjs';
import { array, mixed, number, object, string } from 'yup';
import type { Cv, CvImport, CvRequest } from '../../clients/CvClient';
import type { CvExperience, CvLanguage } from '../../wirespec/model';
import { validateCvName } from '../../wirespec/model/CvName';
import { validateCvRequiredText } from '../../wirespec/model/CvRequiredText';
import { validateUUID } from '../../wirespec/model/UUID';
import { validateYearMonth } from '../../wirespec/model/YearMonth';
import { parseYearMonth, YEAR_MONTH } from './cvText';

export type CvExperienceValues = {
  /** First month of the job; the day is ignored. */
  from: Dayjs | null;
  /** Last month of the job; null while it is the current one. */
  to: Dayjs | null;
  role: string;
  client: string;
  employer: string;
  technologies: string[];
  description: string;
};

export type CvSkillValues = {
  category: string;
  name: string;
  /** 1 to 5 stars; null when the skill has no rating. */
  level: number | null;
};

export type CvFormValues = {
  /** The uuid of the person the CV is about; '' means the current user's own person. */
  personId: string;
  /** Tells the versions of a person's CV apart, e.g. "2025 NL" or "Frontend EN". */
  name: string;
  language: CvLanguage;
  place: string;
  phone: string;
  summary: string;
  experiences: CvExperienceValues[];
  skills: CvSkillValues[];
  education: string;
  subjects: string;
  languages: string;
};

const LINE = 255;
const TEXT = 10000;
const SECTION = 2000;

const isValidMonth = (value: unknown): value is Dayjs =>
  dayjs.isDayjs(value) &&
  value.isValid() &&
  validateYearMonth(value.format(YEAR_MONTH));

const line = (label: string) =>
  string()
    .trim()
    .default('')
    .max(LINE, `${label} may be at most ${LINE} characters`);

const requiredLine = (label: string) =>
  string()
    .trim()
    .default('')
    .required(`${label} is required`)
    // An empty value is the required rule's to report
    .test(
      'contract',
      `${label} may be at most ${LINE} characters`,
      (value) => !value || validateCvRequiredText(value),
    );

const text = (label: string) =>
  string().default('').max(TEXT, `${label} may be at most ${TEXT} characters`);

export const CV_EXPERIENCE_SCHEMA = object({
  from: mixed<Dayjs>()
    .nullable()
    .default(null)
    .test('required', 'From is required', (value) => value != null)
    .test(
      'contract',
      'From must be a valid month',
      (value) => value == null || isValidMonth(value),
    ),
  to: mixed<Dayjs>()
    .nullable()
    .default(null)
    .test(
      'contract',
      'To must be a valid month',
      (value) => value == null || isValidMonth(value),
    )
    .test('after-from', 'To may not be before from', function (value) {
      const { from } = this.parent as CvExperienceValues;
      return (
        value == null ||
        !isValidMonth(from) ||
        !isValidMonth(value) ||
        !value.startOf('month').isBefore(from.startOf('month'))
      );
    }),
  role: requiredLine('Role'),
  client: requiredLine('Client'),
  employer: line('Employer'),
  technologies: array(
    string()
      .trim()
      .max(100, 'A technology may be at most 100 characters')
      .required(),
  ).default([]),
  description: text('Description'),
});

export const CV_SKILL_SCHEMA = object({
  category: line('Category'),
  name: requiredLine('Skill'),
  level: number()
    .nullable()
    .default(null)
    .min(1, 'Rate a skill from 1 to 5')
    .max(5, 'Rate a skill from 1 to 5'),
});

const section = (label: string) =>
  string()
    .default('')
    .max(SECTION, `${label} may be at most ${SECTION} characters`);

/**
 * Mirrors the wirespec contract (cvs.ws): required fields get a friendly message,
 * the generated `validate*` guards apply the contract's patterns, the lengths match
 * the columns the service checks.
 */
export const CV_FORM_SCHEMA = object({
  personId: string()
    .default('')
    .test(
      'contract',
      'Pick a person from the list',
      (value) => !value || validateUUID(value),
    ),
  name: string()
    .trim()
    .default('')
    .required('Name is required')
    .test(
      'contract',
      'Name may be at most 100 characters',
      (value) => !value || validateCvName(value),
    ),
  language: mixed<CvLanguage>()
    .oneOf(['NL', 'EN'], 'Pick a language')
    .default('NL'),
  place: line('Place'),
  phone: line('Phone'),
  summary: text('Profile'),
  experiences: array(CV_EXPERIENCE_SCHEMA).default([]),
  skills: array(CV_SKILL_SCHEMA).default([]),
  education: section('Education'),
  subjects: section('Subjects'),
  languages: section('Languages'),
});

export const emptySkill = (category = ''): CvSkillValues => ({
  category,
  name: '',
  level: null,
});

export const emptyExperience = (): CvExperienceValues => ({
  from: null,
  to: null,
  role: '',
  client: '',
  employer: '',
  technologies: [],
  description: '',
});

const toExperienceValues = (it: CvExperience): CvExperienceValues => ({
  from: parseYearMonth(it.from),
  to: it.to ? parseYearMonth(it.to) : null,
  role: it.role ?? '',
  client: it.client ?? '',
  employer: it.employer ?? '',
  technologies: it.technologies ?? [],
  description: it.description ?? '',
});

export const toCvFormValues = (cv: Cv): CvFormValues => ({
  personId: cv.person?.uuid ?? '',
  name: cv.name ?? '',
  language: cv.language ?? 'NL',
  place: cv.place ?? '',
  phone: cv.phone ?? '',
  summary: cv.summary ?? '',
  experiences: (cv.experiences ?? []).map(toExperienceValues),
  skills: (cv.skills ?? []).map((it) => ({
    category: it.category ?? '',
    name: it.name ?? '',
    level: it.level ?? null,
  })),
  education: cv.education ?? '',
  subjects: cv.subjects ?? '',
  languages: cv.languages ?? '',
});

/** A CV read from a PDF, as the starting point of a new CV. */
export const fromCvImport = (imported: CvImport, name = ''): CvFormValues => ({
  personId: imported.personId ?? '',
  name,
  language: imported.language ?? 'NL',
  place: imported.place ?? '',
  phone: imported.phone ?? '',
  summary: imported.summary ?? '',
  experiences: (imported.experiences ?? []).map(toExperienceValues),
  skills: [],
  education: imported.education ?? '',
  subjects: imported.subjects ?? '',
  languages: imported.languages ?? '',
});

const optional = (value: string): string | undefined =>
  value.trim() === '' ? undefined : value.trim();

export const toCvRequest = (values: CvFormValues): CvRequest => ({
  personId: optional(values.personId),
  name: values.name.trim(),
  language: values.language,
  place: optional(values.place),
  phone: optional(values.phone),
  summary: optional(values.summary),
  experiences: values.experiences.map((it) => ({
    from: (it.from as Dayjs).format(YEAR_MONTH),
    to: it.to ? it.to.format(YEAR_MONTH) : undefined,
    role: it.role.trim(),
    client: it.client.trim(),
    employer: optional(it.employer),
    technologies: it.technologies
      .map((tech) => tech.trim())
      .filter((tech) => tech !== ''),
    description: optional(it.description),
  })),
  skills: values.skills.map((it) => ({
    category: optional(it.category),
    name: it.name.trim(),
    level: it.level ?? undefined,
  })),
  education: optional(values.education),
  subjects: optional(values.subjects),
  languages: optional(values.languages),
});
