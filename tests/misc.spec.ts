import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const ADMIN_USERNAME = 'bert';
const USER_USERNAME = 'tommy';
const CALENDAR_TOKEN = 'sesamstraat';

test.describe('misc.ws - TaskController', () => {
  test('GET /tasks/reminder returns 200 without authentication', async ({
    request,
  }) => {
    const response = await request.get('/tasks/reminder');
    expect(response.status()).toBe(200);
  });
});

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

  test('GET /login/type is reachable without authentication', async ({
    request,
  }) => {
    const response = await request.get('/login/type');
    expect(response.ok()).toBeTruthy();
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
    expect(body.authorities).toEqual([]);
  });

  test('GET /login/status reports loggedIn=true after login', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);

    const response = await page.request.get('/login/status');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.loggedIn).toBe(true);
    expect(Array.isArray(body.authorities)).toBe(true);
    expect(body.authorities.length).toBeGreaterThan(0);
  });
});

test.describe('misc.ws - BootstrapController', () => {
  test('GET /bootstrap returns isLoggedIn=false for anonymous request', async ({
    request,
  }) => {
    const response = await request.get('/bootstrap');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('isLoggedIn');
    expect(body).toHaveProperty('authorities');
    expect(body.isLoggedIn).toBe(false);
    expect(Array.isArray(body.authorities)).toBe(true);
    expect(body.authorities).toEqual([]);
    expect(body.userId).toBeNull();
    expect(body.personId).toBeNull();
  });

  test('GET /bootstrap returns user info after admin login', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);

    const response = await page.request.get('/bootstrap');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.isLoggedIn).toBe(true);
    expect(Array.isArray(body.authorities)).toBe(true);
    expect(body.authorities.length).toBeGreaterThan(0);
    expect(typeof body.userId).toBe('string');
    expect(body.userId.length).toBeGreaterThan(0);
  });

  test('GET /bootstrap returns personId for a regular user with a person record', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, USER_USERNAME);

    const response = await page.request.get('/bootstrap');
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.isLoggedIn).toBe(true);
    expect(typeof body.userId).toBe('string');
    expect(body.userId.length).toBeGreaterThan(0);
    expect(typeof body.personId).toBe('string');
    expect(body.personId.length).toBeGreaterThan(0);
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

  test('GET /api/ext/calendar/calendar.ics returns 400 when token is missing', async ({
    request,
  }) => {
    const response = await request.get('/api/ext/calendar/calendar.ics');
    expect(response.status()).toBe(400);
  });
});
