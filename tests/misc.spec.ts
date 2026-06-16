import { expect, test } from '@playwright/test';

const CALENDAR_TOKEN = 'sesamstraat';

test.describe('misc.ws - LoginConfigController', () => {
  test('GET /login/type returns the configured login type', async ({
    request,
  }) => {
    const response = await request.get('/login/type');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('type');
    expect(typeof body.type).toBe('string');
    expect(body.type.length).toBeGreaterThan(0);
  });
});

test.describe('misc.ws - LoginStatusApiController', () => {
  test('GET /login/status reports loggedIn=false for anonymous request', async ({
    request,
  }) => {
    const response = await request.get('/login/status');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('loggedIn');
    expect(body.loggedIn).toBe(false);
    expect(Array.isArray(body.authorities)).toBe(true);
  });
});

test.describe('misc.ws - BootstrapController', () => {
  test('GET /bootstrap returns a valid response shape for anonymous request', async ({
    request,
  }) => {
    const response = await request.get('/bootstrap');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('loggedIn');
    expect(body).toHaveProperty('authorities');
    expect(body).toHaveProperty('userId');
    expect(body).toHaveProperty('personId');
    expect(Array.isArray(body.authorities)).toBe(true);
  });
});

test.describe('misc.ws - CalendarController', () => {
  test('GET /api/ext/calendar/calendar.ics returns 200 with valid token', async ({
    request,
  }) => {
    const response = await request.get(
      `/api/ext/calendar/calendar.ics?token=${CALENDAR_TOKEN}`,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/calendar');

    const body = await response.text();
    expect(body).toContain('BEGIN:VCALENDAR');
    expect(body).toContain('END:VCALENDAR');
  });

  test('GET /api/ext/calendar/calendar.ics returns 401 with invalid token', async ({
    request,
  }) => {
    const response = await request.get(
      '/api/ext/calendar/calendar.ics?token=not-a-valid-token',
    );
    expect(response.status()).toBe(401);
  });
});
