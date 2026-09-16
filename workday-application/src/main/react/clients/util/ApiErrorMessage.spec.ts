import { apiErrorMessage } from './ApiErrorMessage';

describe('apiErrorMessage', () => {
  it('returns the message of a typed wirespec error body', () => {
    const error = new Error(
      JSON.stringify({ message: 'A laptop with serial number X exists' }),
    );
    expect(apiErrorMessage(error, 'fallback')).toBe(
      'A laptop with serial number X exists',
    );
  });

  it('falls back when the body is not JSON', () => {
    expect(apiErrorMessage(new Error('<html>Bad gateway</html>'), 'fb')).toBe(
      'fb',
    );
  });

  it('falls back when the body has no usable message', () => {
    expect(
      apiErrorMessage(new Error(JSON.stringify({ status: 500 })), 'fb'),
    ).toBe('fb');
    expect(
      apiErrorMessage(new Error(JSON.stringify({ message: '  ' })), 'fb'),
    ).toBe('fb');
    expect(apiErrorMessage(new Error(''), 'fb')).toBe('fb');
  });

  it('falls back for things that are not errors', () => {
    expect(apiErrorMessage(undefined, 'fb')).toBe('fb');
    expect(apiErrorMessage('boom', 'fb')).toBe('fb');
  });
});
