import type { Cv } from '../../clients/CvClient';
import type { CvExperience, CvSkill } from '../../wirespec/model';
import { CV_LANGUAGES, periodText } from './cvText';

export type DiffPart = { kind: 'same' | 'added' | 'removed'; text: string };

/** The changes between two values of one field of a CV. */
export type TextDiff = {
  changed: boolean;
  parts: DiffPart[];
  /** Goes between the parts of a list, such as `, ` between technologies. */
  separator?: string;
};

// Words, runs of whitespace (line breaks included) and single other characters, so
// punctuation and Markdown marks like `**` or `-` diff on their own
const TOKEN = /\s+|[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu;

const tokens = (text: string): string[] => text.match(TOKEN) ?? [];

const push = (parts: DiffPart[], kind: DiffPart['kind'], text: string) => {
  const last = parts[parts.length - 1];
  if (last?.kind === kind) last.text += text;
  else if (text !== '') parts.push({ kind, text });
};

/**
 * A word by word diff of two texts: the longest common run of words stays, the rest
 * is removed from the old text or added in the new one. Within a run of changes the
 * removed words come before the added ones.
 */
export function diffText(
  before: string | null | undefined,
  after: string | null | undefined,
): TextDiff {
  const a = tokens(before ?? '');
  const b = tokens(after ?? '');

  // The start and end both texts share need no table
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let endA = a.length;
  let endB = b.length;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
    endA--;
    endB--;
  }

  const parts: DiffPart[] = [];
  push(parts, 'same', a.slice(0, start).join(''));

  // lcs[i][j]: the length of the longest common run of a[i..] and b[j..]
  const n = endA - start;
  const m = endB - start;
  const lcs = new Uint32Array((n + 1) * (m + 1));
  const at = (i: number, j: number) => i * (m + 1) + j;
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[at(i, j)] =
        a[start + i] === b[start + j]
          ? lcs[at(i + 1, j + 1)] + 1
          : Math.max(lcs[at(i + 1, j)], lcs[at(i, j + 1)]);
    }
  }

  let removed = '';
  let added = '';
  const flush = () => {
    push(parts, 'removed', removed);
    push(parts, 'added', added);
    removed = '';
    added = '';
  };
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[start + i] === b[start + j]) {
      flush();
      push(parts, 'same', a[start + i]);
      i++;
      j++;
    } else if (j >= m || (i < n && lcs[at(i + 1, j)] >= lcs[at(i, j + 1)])) {
      removed += a[start + i++];
    } else {
      added += b[start + j++];
    }
  }
  flush();
  push(parts, 'same', a.slice(endA).join(''));

  return {
    changed: parts.some((it) => it.kind !== 'same'),
    parts,
  };
}

/** The changes between two lists of words, such as the technologies of a job. */
export function diffList(before: string[], after: string[]): TextDiff {
  const key = (it: string) => it.trim().toLowerCase();
  const kept = new Set(before.map(key));
  const now = new Set(after.map(key));
  const parts: DiffPart[] = [];
  for (const it of after) {
    parts.push({ kind: kept.has(key(it)) ? 'same' : 'added', text: it });
  }
  for (const it of before) {
    if (!now.has(key(it))) parts.push({ kind: 'removed', text: it });
  }
  return {
    changed: parts.some((it) => it.kind !== 'same'),
    parts,
    separator: ', ',
  };
}

/** A value that is either the same or replaced as a whole, such as a logo. */
const replaced = (before: string, after: string): TextDiff => {
  if (before === after) {
    return { changed: false, parts: [{ kind: 'same', text: after }] };
  }
  const parts: DiffPart[] = [];
  push(parts, 'removed', before);
  push(parts, 'added', after);
  return { changed: true, parts };
};

export type FieldDiff = { label: string; diff: TextDiff };

export type ChangeKind = 'same' | 'changed' | 'added' | 'removed';

export type ExperienceDiff = {
  kind: ChangeKind;
  /** The job as it is in the newer version, or the removed one. */
  title: string;
  fields: FieldDiff[];
};

export type SkillDiff = {
  kind: ChangeKind;
  name: string;
  category: TextDiff;
  /** The rating before and after; null for no rating. */
  level: { before: number | null; after: number | null };
};

export type CvDiff = {
  /** The fields at the top: name, language, place, phone. */
  details: FieldDiff[];
  summary: TextDiff;
  experiences: ExperienceDiff[];
  skills: SkillDiff[];
  education: TextDiff;
  subjects: TextDiff;
  languages: TextDiff;
  /** True when nothing on the CV differs. */
  same: boolean;
};

const norm = (value: string | null | undefined) =>
  (value ?? '').trim().toLowerCase();

const languageLabel = (cv: Cv) =>
  CV_LANGUAGES.find((it) => it.value === cv.language)?.label ??
  cv.language ??
  '';

const period = (it: CvExperience | undefined, cv: Cv) =>
  it ? periodText(it.from, it.to, cv.language ?? 'NL') : '';

/**
 * How alike two jobs are: the same client counts most, then the same role and the
 * same start. Below 2 they are taken to be different jobs.
 */
const likeness = (a: CvExperience, b: CvExperience) =>
  (norm(a.client) === norm(b.client) ? 2 : 0) +
  (norm(a.role) === norm(b.role) ? 1 : 0) +
  (a.from === b.from ? 1 : 0);

/**
 * Pairs the jobs of the old version with those of the new one, best matches first, so
 * a job that moved or was edited is compared with itself rather than with whatever
 * now sits in its place. Returns, per new job, the index of its old job or -1.
 */
function matchExperiences(
  before: CvExperience[],
  after: CvExperience[],
): number[] {
  const pairs: { i: number; j: number; score: number }[] = [];
  before.forEach((a, i) => {
    after.forEach((b, j) => {
      const score = likeness(a, b);
      if (score >= 2) pairs.push({ i, j, score });
    });
  });
  // Best score first; on a tie the jobs closest to their old place
  pairs.sort(
    (x, y) => y.score - x.score || Math.abs(x.i - x.j) - Math.abs(y.i - y.j),
  );
  const match = after.map(() => -1);
  const used = new Set<number>();
  for (const { i, j } of pairs) {
    if (match[j] !== -1 || used.has(i)) continue;
    match[j] = i;
    used.add(i);
  }
  return match;
}

function experienceDiff(
  a: CvExperience | undefined,
  b: CvExperience | undefined,
  cvA: Cv,
  cvB: Cv,
): ExperienceDiff {
  const fields: FieldDiff[] = [
    { label: 'Period', diff: diffText(period(a, cvA), period(b, cvB)) },
    { label: 'Role', diff: diffText(a?.role, b?.role) },
    { label: 'Client', diff: diffText(a?.client, b?.client) },
    { label: 'Employer', diff: diffText(a?.employer, b?.employer) },
    {
      label: 'Technologies',
      diff: diffList(a?.technologies ?? [], b?.technologies ?? []),
    },
    {
      label: 'Logo',
      diff: replaced(
        a?.logoId ? 'Logo' : '',
        b?.logoId
          ? a?.logoId && a.logoId !== b.logoId
            ? 'Other logo'
            : 'Logo'
          : '',
      ),
    },
    { label: 'Description', diff: diffText(a?.description, b?.description) },
  ];
  const shown = b ?? a;
  const kind: ChangeKind = !a
    ? 'added'
    : !b
      ? 'removed'
      : fields.some((it) => it.diff.changed)
        ? 'changed'
        : 'same';
  return {
    kind,
    title: shown ? `${shown.role} · ${shown.client}` : '',
    fields,
  };
}

function diffExperiences(cvA: Cv, cvB: Cv): ExperienceDiff[] {
  const before = cvA.experiences ?? [];
  const after = cvB.experiences ?? [];
  const match = matchExperiences(before, after);
  const newIndex = new Map<number, number>();
  match.forEach((i, j) => {
    if (i !== -1) newIndex.set(i, j);
  });

  // A removed job goes right after the job that came before it in the old version,
  // or first when nothing that came before it is left
  const removed = new Map<number, number[]>();
  before.forEach((_, i) => {
    if (newIndex.has(i)) return;
    let anchor = -1;
    for (let k = i - 1; k >= 0; k--) {
      if (newIndex.has(k)) {
        anchor = newIndex.get(k) ?? -1;
        break;
      }
    }
    removed.set(anchor, [...(removed.get(anchor) ?? []), i]);
  });

  const result: ExperienceDiff[] = [];
  const pushRemoved = (anchor: number) => {
    for (const i of removed.get(anchor) ?? []) {
      result.push(experienceDiff(before[i], undefined, cvA, cvB));
    }
  };
  pushRemoved(-1);
  after.forEach((b, j) => {
    const i = match[j];
    result.push(experienceDiff(i === -1 ? undefined : before[i], b, cvA, cvB));
    pushRemoved(j);
  });
  return result;
}

function diffSkills(cvA: Cv, cvB: Cv): SkillDiff[] {
  const before = cvA.skills ?? [];
  const after = cvB.skills ?? [];
  const skillDiff = (a: CvSkill | undefined, b: CvSkill | undefined) => {
    const category = diffText(a?.category, b?.category);
    const level = { before: a?.level ?? null, after: b?.level ?? null };
    const kind: ChangeKind = !a
      ? 'added'
      : !b
        ? 'removed'
        : category.changed || level.before !== level.after
          ? 'changed'
          : 'same';
    return { kind, name: (b ?? a)?.name ?? '', category, level };
  };
  const used = new Set<number>();
  const result = after.map((b) => {
    const i = before.findIndex(
      (a, k) => !used.has(k) && norm(a.name) === norm(b.name),
    );
    if (i !== -1) used.add(i);
    return skillDiff(i === -1 ? undefined : before[i], b);
  });
  before.forEach((a, i) => {
    if (!used.has(i)) result.push(skillDiff(a, undefined));
  });
  return result;
}

/** Everything that differs between an older ([before]) and a newer ([after]) CV. */
export function diffCv(before: Cv, after: Cv): CvDiff {
  const details: FieldDiff[] = [
    { label: 'Name of this version', diff: diffText(before.name, after.name) },
    {
      label: 'Language',
      diff: diffText(languageLabel(before), languageLabel(after)),
    },
    { label: 'Place', diff: diffText(before.place, after.place) },
    { label: 'Phone', diff: diffText(before.phone, after.phone) },
  ];
  const summary = diffText(before.summary, after.summary);
  const experiences = diffExperiences(before, after);
  const skills = diffSkills(before, after);
  const education = diffText(before.education, after.education);
  const subjects = diffText(before.subjects, after.subjects);
  const languages = diffText(before.languages, after.languages);
  return {
    details,
    summary,
    experiences,
    skills,
    education,
    subjects,
    languages,
    same:
      !details.some((it) => it.diff.changed) &&
      !summary.changed &&
      experiences.every((it) => it.kind === 'same') &&
      skills.every((it) => it.kind === 'same') &&
      !education.changed &&
      !subjects.changed &&
      !languages.changed,
  };
}
