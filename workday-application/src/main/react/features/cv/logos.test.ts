import { matchLogo } from './logos';

const logo = (name: string) => ({
  id: name,
  name,
  contentType: 'image/png',
  updatedAt: '2025-01-01T00:00:00Z',
});

describe('matchLogo', () => {
  const logos = [
    logo('ING'),
    logo('ING Touchpoint'),
    logo('Bol.com'),
    logo('DHL'),
  ];

  it('finds the logo whose name is all in the name of the client', () => {
    expect(matchLogo('ING, Amsterdam', logos)?.name).toBe('ING');
    expect(matchLogo('bol.com Webshop', logos)?.name).toBe('Bol.com');
    expect(matchLogo('DHL', logos)?.name).toBe('DHL');
  });

  it('prefers the most specific logo', () => {
    expect(matchLogo('ING Touchpoint', logos)?.name).toBe('ING Touchpoint');
  });

  it('does not match on part of a word, or without a client', () => {
    expect(matchLogo('Ingenico', logos)).toBeUndefined();
    expect(matchLogo('', logos)).toBeUndefined();
    expect(matchLogo(undefined, logos)).toBeUndefined();
  });
});
