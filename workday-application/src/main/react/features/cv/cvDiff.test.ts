import type { Cv } from '../../clients/CvClient';
import type { CvExperience, CvSkill } from '../../wirespec/model';
import { diffCv, diffList, diffText } from './cvDiff';

const job = (it: Partial<CvExperience>): CvExperience =>
  ({
    from: '2021-03',
    role: 'Developer',
    client: 'NS',
    technologies: [],
    ...it,
  }) as CvExperience;

const cv = (it: Partial<Cv>): Cv =>
  ({
    name: 'Algemeen',
    language: 'NL',
    ...it,
  }) as Cv;

const render = (parts: { kind: string; text: string }[], separator = '') =>
  parts
    .map((it) =>
      it.kind === 'added'
        ? `{+${it.text}+}`
        : it.kind === 'removed'
          ? `[-${it.text}-]`
          : it.text,
    )
    .join(separator);

describe('diffText', () => {
  it('marks the words that changed', () => {
    const diff = diffText(
      'Builds web apps in Kotlin',
      'Builds mobile apps in Kotlin',
    );
    expect(diff.changed).toBe(true);
    expect(render(diff.parts)).toBe('Builds [-web-]{+mobile+} apps in Kotlin');
  });

  it('keeps the line breaks and Markdown marks of a description', () => {
    const diff = diffText('- Kotlin\n- Java', '- Kotlin\n- **Java**\n- Go');
    expect(render(diff.parts)).toBe('- Kotlin\n- {+**+}Java{+**\n- Go+}');
  });

  it('sees no change in the same text', () => {
    expect(diffText('Same', 'Same')).toEqual({
      changed: false,
      parts: [{ kind: 'same', text: 'Same' }],
    });
    expect(diffText(undefined, '').changed).toBe(false);
  });

  it('adds or removes a whole text', () => {
    expect(render(diffText('', 'New').parts)).toBe('{+New+}');
    expect(render(diffText('Old', null).parts)).toBe('[-Old-]');
  });
});

describe('diffList', () => {
  it('marks the technologies that were added or removed', () => {
    const diff = diffList(['Kotlin', 'Java'], ['Kotlin', 'React']);
    expect(render(diff.parts, diff.separator)).toBe(
      'Kotlin, {+React+}, [-Java-]',
    );
  });

  it('ignores case and order', () => {
    expect(diffList(['Kotlin', 'Java'], ['java', 'kotlin']).changed).toBe(
      false,
    );
  });
});

describe('diffCv', () => {
  it('sees no change between the same CVs', () => {
    const it = cv({ summary: 'Hi', experiences: [job({})] });
    expect(diffCv(it, it).same).toBe(true);
  });

  it('compares a job with itself after it moved and was edited', () => {
    const diff = diffCv(
      cv({ experiences: [job({ client: 'NS' }), job({ client: 'ING' })] }),
      cv({
        experiences: [
          job({ client: 'ING', description: 'More' }),
          job({ client: 'NS' }),
        ],
      }),
    );
    expect(diff.experiences.map((it) => [it.title, it.kind])).toEqual([
      ['Developer · ING', 'changed'],
      ['Developer · NS', 'same'],
    ]);
  });

  it('lists added and removed jobs where they were', () => {
    const diff = diffCv(
      cv({
        experiences: [
          job({ client: 'A' }),
          job({ client: 'B', role: 'Tester', from: '2019-01' }),
          job({ client: 'C' }),
        ],
      }),
      cv({
        experiences: [
          job({ client: 'New', role: 'Lead', from: '2024-01' }),
          job({ client: 'A' }),
          job({ client: 'C' }),
        ],
      }),
    );
    expect(diff.experiences.map((it) => [it.title, it.kind])).toEqual([
      ['Lead · New', 'added'],
      ['Developer · A', 'same'],
      ['Tester · B', 'removed'],
      ['Developer · C', 'same'],
    ]);
  });

  it('shows the changed period of a job as it reads on the CV', () => {
    const diff = diffCv(
      cv({ experiences: [job({})] }),
      cv({ experiences: [job({ to: '2023-12' })] }),
    );
    const period = diff.experiences[0].fields.find(
      (it) => it.label === 'Period',
    );
    expect(render(period?.diff.parts ?? [])).toBe(
      '03-2021 - [-nu-]{+12-2023+}',
    );
  });

  it('matches skills by name and sees a new rating or category', () => {
    const diff = diffCv(
      cv({
        skills: [
          { name: 'Kotlin', level: 4, category: 'Languages' },
          { name: 'Cobol', level: 2 } as CvSkill,
        ],
      }),
      cv({
        skills: [
          { name: 'kotlin', level: 5, category: 'Languages' },
          { name: 'React', level: 3 } as CvSkill,
        ],
      }),
    );
    expect(diff.skills.map((it) => [it.name, it.kind, it.level])).toEqual([
      ['kotlin', 'changed', { before: 4, after: 5 }],
      ['React', 'added', { before: null, after: 3 }],
      ['Cobol', 'removed', { before: 2, after: null }],
    ]);
  });

  it('compares the details and the other sections', () => {
    const diff = diffCv(
      cv({ language: 'NL', place: 'Utrecht', education: 'HBO' }),
      cv({ language: 'EN', place: 'Utrecht', education: 'HBO, MSc' }),
    );
    expect(
      diff.details.filter((it) => it.diff.changed).map((it) => it.label),
    ).toEqual(['Language']);
    expect(render(diff.education.parts)).toBe('HBO{+, MSc+}');
    expect(diff.same).toBe(false);
  });
});
