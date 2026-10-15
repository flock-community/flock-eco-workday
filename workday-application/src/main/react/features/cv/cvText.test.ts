import dayjs from 'dayjs';
import {
  clientText,
  cvLink,
  cvUrl,
  groupSkills,
  linkify,
  longPeriodText,
  markdownLineBreaks,
  monthsWorked,
  paragraphs,
  periodText,
} from './cvText';

describe('monthsWorked', () => {
  const today = dayjs('2025-04-15');

  it('counts both the first and the last month', () => {
    expect(monthsWorked('2022-12', '2024-07', today)).toBe(20);
    expect(monthsWorked('2020-01', '2021-12', today)).toBe(24);
    expect(monthsWorked('2024-05', '2024-05', today)).toBe(1);
  });

  it('runs a current job up to and including this month', () => {
    expect(monthsWorked('2024-08', undefined, today)).toBe(9);
    expect(monthsWorked('2024-08', null, today)).toBe(9);
  });

  it('never goes below zero', () => {
    expect(monthsWorked('2025-06', undefined, today)).toBe(0);
  });
});

describe('longPeriodText', () => {
  it('writes the months out in the language of the CV', () => {
    expect(longPeriodText('2026-01', '2026-09', 'EN')).toBe(
      'January 2026 - September 2026',
    );
    expect(longPeriodText('2024-08', undefined, 'NL')).toBe(
      'augustus 2024 - nu',
    );
  });
});

describe('periodText', () => {
  it('writes months the way the CV template does', () => {
    expect(periodText('2022-12', '2024-07', 'NL')).toBe('12-2022 - 07-2024');
  });

  it('says now in the language of the CV', () => {
    expect(periodText('2024-08', undefined, 'NL')).toBe('08-2024 - nu');
    expect(periodText('2024-08', undefined, 'EN')).toBe('08-2024 - current');
  });
});

describe('clientText', () => {
  it('names the employer in between', () => {
    expect(clientText('ING', 'Flock')).toBe('ING (via Flock)');
    expect(clientText('Information Makers', undefined)).toBe(
      'Information Makers',
    );
  });
});

describe('paragraphs', () => {
  it('splits on empty lines and keeps single line breaks', () => {
    expect(paragraphs('One\ntwo\n\n  \nThree\n')).toEqual([
      'One\ntwo',
      'Three',
    ]);
    expect(paragraphs(undefined)).toEqual([]);
  });
});

describe('linkify', () => {
  it('turns links into parts with an href and leaves trailing punctuation out', () => {
    expect(
      linkify('See https://www.flock.community/cases/ing. Or not'),
    ).toEqual([
      { text: 'See ' },
      {
        text: 'https://www.flock.community/cases/ing',
        href: 'https://www.flock.community/cases/ing',
      },
      { text: '. Or not' },
    ]);
  });

  it('leaves text without links alone', () => {
    expect(linkify('Plain text')).toEqual([{ text: 'Plain text' }]);
  });
});

describe('cvUrl', () => {
  it('links to a CV of a person', () => {
    expect(cvUrl('p-1', 'me', { cv: 'cv-1' })).toBe(
      '/cvs?personId=p-1&cv=cv-1',
    );
    expect(cvUrl('p-1', 'me', { copyFrom: 'cv-1' }, '/cvs/new')).toBe(
      '/cvs/new?personId=p-1&copyFrom=cv-1',
    );
  });

  it('leaves out your own person, which only admins could look up', () => {
    expect(cvUrl('me', 'me', { cv: 'cv-1' })).toBe('/cvs?cv=cv-1');
    expect(cvUrl(undefined, 'me', { cv: undefined })).toBe('/cvs');
  });
});

describe('cvLink', () => {
  it('links to a CV by its code', () => {
    expect(cvLink('cv-1')).toBe('/cvs/cv-1');
  });

  it('links to an earlier version of a CV', () => {
    expect(cvLink('cv-1', { version: 'r-1' })).toBe('/cvs/cv-1?version=r-1');
  });

  it('links to a comparison, with the versions it compares', () => {
    expect(cvLink('cv-1', { compare: true })).toBe('/cvs/cv-1/compare');
    expect(
      cvLink('cv-1', { compare: true, from: 'cv:cv-2', to: 'current' }),
    ).toBe('/cvs/cv-1/compare?from=cv%3Acv-2&to=current');
    // A comparison shows no single version
    expect(cvLink('cv-1', { compare: true, version: 'r-1' })).toBe(
      '/cvs/cv-1/compare',
    );
  });
});

describe('markdownLineBreaks', () => {
  it('keeps single line breaks as hard breaks and leaves blank lines alone', () => {
    expect(markdownLineBreaks('een\r\ntwee\n\n- a\n- b')).toBe(
      'een  \ntwee\n\n- a  \n- b',
    );
  });
});

describe('groupSkills', () => {
  it('groups by category with the best rated skills first', () => {
    expect(
      groupSkills([
        { category: 'Programming', name: 'Java', level: 3 },
        { category: 'Tools', name: 'Git', level: 4 },
        { category: 'Programming', name: 'Kotlin', level: 5 },
        { category: 'Programming', name: 'Go', level: 3 },
      ]),
    ).toEqual([
      {
        category: 'Programming',
        skills: [
          { category: 'Programming', name: 'Kotlin', level: 5 },
          { category: 'Programming', name: 'Java', level: 3 },
          { category: 'Programming', name: 'Go', level: 3 },
        ],
      },
      {
        category: 'Tools',
        skills: [{ category: 'Tools', name: 'Git', level: 4 }],
      },
    ]);
  });
});
