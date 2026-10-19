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
    phone: 'Telephone',
    mail: 'Mail',
    birthdate: 'Date of Birth',
    workingExperience: 'Work experience',
    period: 'Period',
    function: 'Job Title',
    months: 'Months',
    clientColumn: 'Client/Company',
    client: 'Client',
    role: 'Role',
    technologies: 'Technologies',
    skills: 'Skills',
    education: 'Education',
    subjects: 'Subjects',
    languages: 'Languages',
    now: 'current',
    page: 'page',
  },
} as const satisfies Record<CvLanguage, Record<string, string>>;

export const CV_LANGUAGES: { value: CvLanguage; label: string }[] = [
  { value: 'NL', label: 'Dutch' },
  { value: 'EN', label: 'English' },
];

type CvBaseInfo = {
  code?: string | null;
  language?: CvLanguage | null;
  base?: boolean | null;
  updatedAt?: string | null;
};

/** The base CV among [cvs] in [language], if there is one. */
export const baseOf = <T extends CvBaseInfo>(
  cvs: T[],
  language: CvLanguage | null | undefined,
): T | undefined => cvs.find((it) => it.base && it.language === language);

/**
 * The CV Workday suggests as the base in [language] when there is none yet: the one
 * saved last, which is most likely up to date. None when there is a base already.
 */
export const suggestedBase = <T extends CvBaseInfo>(
  cvs: T[],
  language: CvLanguage | null | undefined,
): T | undefined => {
  const inLanguage = cvs.filter((it) => it.language === language);
  if (inLanguage.some((it) => it.base)) return undefined;
  return inLanguage.reduce<T | undefined>(
    (latest, it) =>
      !latest || (it.updatedAt ?? '') > (latest.updatedAt ?? '') ? it : latest,
    undefined,
  );
};

/** `Dutch`, `English`: the language a CV is written in. */
export const cvLanguageLabel = (cv: { language?: CvLanguage | null }): string =>
  CV_LANGUAGES.find((it) => it.value === cv.language)?.label ??
  cv.language ??
  '';

/**
 * A CV page of a person, with more [params] such as the CV to show (`cv`). The
 * current user's own person ([me]) is left out: that is the default, and only admins
 * may look up a person by id.
 */
export function cvUrl(
  personId: string | null | undefined,
  me: string | null | undefined,
  params: Record<string, string | null | undefined> = {},
  page = '/cvs',
): string {
  const search = new URLSearchParams();
  if (personId && personId !== me) search.set('personId', personId);
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${page}?${query}` : page;
}

/** What a link to a CV opens: an earlier version of it, or a comparison. */
export type CvView = {
  /** The id of an earlier version to show. */
  version?: string | null;
  /** Compare versions, optionally starting `from` one and going `to` another. */
  compare?: boolean;
  from?: string | null;
  to?: string | null;
};

/**
 * The link to a CV: `/cvs/{code}`, which opens it for whoever may read it, whoever's CV
 * it is. An earlier version is `?version={id}`, a comparison `/cvs/{code}/compare`.
 */
export function cvLink(code: string, view: CvView = {}): string {
  const base = `/cvs/${encodeURIComponent(code)}`;
  const search = new URLSearchParams();
  if (view.compare) {
    if (view.from) search.set('from', view.from);
    if (view.to) search.set('to', view.to);
  } else if (view.version) {
    search.set('version', view.version);
  }
  const query = search.toString();
  const page = view.compare ? `${base}/compare` : base;
  return query ? `${page}?${query}` : page;
}

/**
 * The CV with [code] as a document to download, made by the server: PDF or Word. An
 * earlier [version] of it downloads as it was then.
 */
export function cvDownloadUrl(
  code: string,
  format: 'pdf' | 'docx',
  version?: string | null,
): string {
  const url = `/api/cvs/${encodeURIComponent(code)}/${format}`;
  return version ? `${url}?version=${encodeURIComponent(version)}` : url;
}

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

const MONTH_NAMES: Record<CvLanguage, string[]> = {
  NL: [
    'januari',
    'februari',
    'maart',
    'april',
    'mei',
    'juni',
    'juli',
    'augustus',
    'september',
    'oktober',
    'november',
    'december',
  ],
  EN: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
};

const monthName = (value: string, language: CvLanguage): string => {
  const month = parseYearMonth(value);
  return `${MONTH_NAMES[language][month.month()]} ${month.year()}`;
};

/** `January 2026 - September 2026`, `augustus 2024 - nu`: the period above an assignment. */
export function longPeriodText(
  from: string,
  to: string | null | undefined,
  language: CvLanguage,
): string {
  const end = to ? monthName(to, language) : CV_LABELS[language].now;
  return `${monthName(from, language)} - ${end}`;
}

/** `ING (via Flock)`, or just the client without an employer in between. */
export const clientText = (
  client: string,
  employer: string | null | undefined,
): string => (employer ? `${client} (via ${employer})` : client);

export type SkillGroup<T> = { category: string | undefined; skills: T[] };

/**
 * Groups skills by category, in the order the categories first appear, with the best
 * rated skills first in each group.
 */
export function groupSkills<
  T extends { category?: string | null; level?: number | null },
>(skills: T[]): SkillGroup<T>[] {
  const groups: SkillGroup<T>[] = [];
  for (const skill of skills) {
    const category = skill.category?.trim() || undefined;
    const group = groups.find((it) => it.category === category);
    if (group) group.skills.push(skill);
    else groups.push({ category, skills: [skill] });
  }
  for (const group of groups) {
    group.skills.sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
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

/**
 * Turns each single line break within a block of Markdown into a hard break (two
 * trailing spaces), so a description renders its lines the way they were typed.
 */
export const markdownLineBreaks = (text: string): string =>
  text.replace(/\r\n?/g, '\n').replace(/([^\n])[ \t]*\n(?=[^\n])/g, '$1  \n');
