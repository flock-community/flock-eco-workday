import dayjs, { type Dayjs } from 'dayjs';
import type { CvLanguage } from '../../wirespec/model';

/** The labels of the Flock CV template, per language of the CV. */
export const CV_LABELS = {
  NL: {
    title: 'Curriculum Vitae',
    name: 'Naam',
    place: 'Woonplaats',
    phone: 'Telefoon',
    mail: 'E-mail',
    birthdate: 'Geboortedatum',
    workingExperience: 'Werkervaring',
    period: 'Periode',
    function: 'Functie',
    months: 'Maanden',
    clientColumn: 'Opdrachtgever',
    client: 'Klant',
    role: 'Rol',
    technologies: 'Technologieën',
    skills: 'Vaardigheden',
    education: 'Opleiding',
    subjects: 'Kennisgebieden',
    languages: 'Talen',
    now: 'nu',
    page: 'pagina',
  },
  EN: {
    title: 'Curriculum Vitae',
    name: 'Name',
    place: 'Place',
    phone: 'Phone',
    mail: 'Mail',
    birthdate: 'Date of birth',
    workingExperience: 'Working experience',
    period: 'Period',
    function: 'Function',
    months: 'Months',
    clientColumn: 'Employer / client',
    client: 'Client',
    role: 'Role',
    technologies: 'Technologies',
    skills: 'Skills',
    education: 'Education',
    subjects: 'Subjects',
    languages: 'Languages',
    now: 'now',
    page: 'page',
  },
} as const satisfies Record<CvLanguage, Record<string, string>>;

export const CV_LANGUAGES: { value: CvLanguage; label: string }[] = [
  { value: 'NL', label: 'Dutch' },
  { value: 'EN', label: 'English' },
];

/** A month on the wire is `yyyy-MM`; on a CV it reads `MM-yyyy`. */
export const YEAR_MONTH = 'YYYY-MM';
export const CV_MONTH = 'MM-YYYY';

export const parseYearMonth = (value: string): Dayjs => dayjs(`${value}-01`);

/**
 * The number of months worked from `from` up to and including `to`; without `to` the
 * job is the current one and runs up to and including `today`'s month.
 */
export function monthsWorked(
  from: string,
  to: string | null | undefined,
  today: Dayjs = dayjs(),
): number {
  const start = parseYearMonth(from);
  const end = to ? parseYearMonth(to) : today.startOf('month');
  return Math.max(0, end.diff(start, 'month') + 1);
}

/** `08-2024 - now`, `12-2022 - 07-2024`. */
export function periodText(
  from: string,
  to: string | null | undefined,
  language: CvLanguage,
): string {
  const end = to
    ? parseYearMonth(to).format(CV_MONTH)
    : CV_LABELS[language].now;
  return `${parseYearMonth(from).format(CV_MONTH)} - ${end}`;
}

/** `ING (via Flock)`, or just the client without an employer in between. */
export const clientText = (
  client: string,
  employer: string | null | undefined,
): string => (employer ? `${client} (via ${employer})` : client);

export type SkillGroup<T> = { category: string | undefined; skills: T[] };

/** Groups skills by category, in the order the categories first appear. */
export function groupSkills<T extends { category?: string | null }>(
  skills: T[],
): SkillGroup<T>[] {
  const groups: SkillGroup<T>[] = [];
  for (const skill of skills) {
    const category = skill.category?.trim() || undefined;
    const group = groups.find((it) => it.category === category);
    if (group) group.skills.push(skill);
    else groups.push({ category, skills: [skill] });
  }
  return groups;
}

/** Splits CV text into paragraphs on blank lines; a single line break stays within a paragraph. */
export const paragraphs = (text: string | null | undefined): string[] =>
  (text ?? '')
    .split(/\n\s*\n/)
    .map((it) => it.trim())
    .filter((it) => it !== '');

export type TextPart = { text: string; href?: string };

/** Splits a line into plain text and links, so the links on a CV are clickable. */
export function linkify(line: string): TextPart[] {
  const parts: TextPart[] = [];
  const url = /https?:\/\/[^\s]+[^\s.,;:!?)]/g;
  let last = 0;
  for (const match of line.matchAll(url)) {
    const index = match.index ?? 0;
    if (index > last) parts.push({ text: line.slice(last, index) });
    parts.push({ text: match[0], href: match[0] });
    last = index + match[0].length;
  }
  if (last < line.length) parts.push({ text: line.slice(last) });
  return parts;
}
