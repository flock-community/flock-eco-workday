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

  it("appends the status of Spring's default error body", () => {
    const forbidden = new Error(
      JSON.stringify({ status: 403, error: 'Forbidden', path: '/api/laptops' }),
    );
    expect(apiErrorMessage(forbidden, 'The laptop could not be saved')).toBe(
      'The laptop could not be saved (403: you are missing the required authority)',
    );
    const serverError = new Error(
      JSON.stringify({ status: 500, error: 'Internal Server Error' }),
    );
    expect(apiErrorMessage(serverError, 'fb')).toBe(
      'fb (500: Internal Server Error)',
    );
  });

  it('falls back when the body is not JSON', () => {
    expect(apiErrorMessage(new Error('<html>Bad gateway</html>'), 'fb')).toBe(
      'fb',
    );
  });

  it('falls back when the body has no usable message', () => {
    expect(
      apiErrorMessage(new Error(JSON.stringify({ path: '/api' })), 'fb'),
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
