import { toTechnologies } from './TechnologiesField';

describe('toTechnologies', () => {
  it('splits typed or pasted text on commas and trims it', () => {
    expect(toTechnologies(['Kotlin', 'React, Typescript ', '  '])).toEqual([
      'Kotlin',
      'React',
      'Typescript',
    ]);
  });

  it('keeps every technology once, in the order it was added', () => {
    expect(toTechnologies(['Kotlin', 'React', 'Kotlin'])).toEqual([
      'Kotlin',
      'React',
    ]);
  });
});
