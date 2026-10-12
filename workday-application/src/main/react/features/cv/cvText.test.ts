import dayjs from 'dayjs';
import {
  clientText,
  cvUrl,
  linkify,
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

describe('periodText', () => {
  it('writes months the way the CV template does', () => {
    expect(periodText('2022-12', '2024-07', 'NL')).toBe('12-2022 - 07-2024');
  });

  it('says now in the language of the CV', () => {
    expect(periodText('2024-08', undefined, 'NL')).toBe('08-2024 - nu');
    expect(periodText('2024-08', undefined, 'EN')).toBe('08-2024 - now');
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
