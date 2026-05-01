import { expect, test } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

const USERS_URL = '/users';
const ADMIN_USERNAME = 'bert';
const NON_ADMIN_USERNAME = 'tommy';

test.describe('User API endpoints', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
  });

  test('GET /api/users/me returns the current user', async ({ page }) => {
    const response = await page.request.get('/api/users/me');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('email', 'bert@sesam.straat');
    expect(Array.isArray(body.authorities)).toBeTruthy();
  });

  test('GET /api/users/me/accounts returns the current user accounts', async ({
    page,
  }) => {
    const response = await page.request.get('/api/users/me/accounts');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
  });

  test('GET /api/authorities returns list of authorities', async ({ page }) => {
    const response = await page.request.get('/api/authorities');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    expect(body).toContain('UserAuthority.READ');
  });

  test('GET /api/users returns paginated users (admin)', async ({ page }) => {
    const response = await page.request.get('/api/users?page=0&size=20');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    const emails = body.map((it: { email: string }) => it.email);
    expect(emails).toContain('bert@sesam.straat');
  });

  test('GET /api/users supports search query', async ({ page }) => {
    const response = await page.request.get('/api/users?search=bert');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);
    const emails = body.map((it: { email: string }) => it.email);
    expect(emails).toContain('bert@sesam.straat');
  });

  test('POST /api/users/search finds users by codes', async ({ page }) => {
    const allRes = await page.request.get('/api/users?search=bert');
    const all = await allRes.json();
    const bertCode = all.find(
      (it: { email: string }) => it.email === 'bert@sesam.straat',
    ).id;

    const response = await page.request.post('/api/users/search', {
      data: [bertCode],
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBe(1);
    expect(body[0].email).toBe('bert@sesam.straat');
  });

  test('GET /api/users/{code} returns a single user', async ({ page }) => {
    const allRes = await page.request.get('/api/users?search=tommy');
    const all = await allRes.json();
    const tommy = all.find(
      (it: { email: string }) => it.email === 'tommy@sesam.straat',
    );

    const response = await page.request.get(`/api/users/${tommy.id}`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.id).toBe(tommy.id);
    expect(body.email).toBe('tommy@sesam.straat');
  });

  test('POST/PUT/DELETE /api/users full lifecycle', async ({ page }) => {
    const timestamp = Date.now();
    const email = `e2e.user.${timestamp}@example.com`;

    const createRes = await page.request.post('/api/users', {
      data: {
        name: `E2E User ${timestamp}`,
        email,
        authorities: ['WorkDayAuthority.READ'],
      },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    expect(created.email).toBe(email);
    expect(created.authorities).toContain('WorkDayAuthority.READ');

    const updateRes = await page.request.put(`/api/users/${created.id}`, {
      data: {
        name: `E2E User Updated ${timestamp}`,
        email,
        authorities: ['WorkDayAuthority.READ', 'SickdayAuthority.READ'],
      },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.name).toBe(`E2E User Updated ${timestamp}`);
    expect(updated.authorities).toContain('SickdayAuthority.READ');

    const deleteRes = await page.request.delete(`/api/users/${created.id}`);
    expect(deleteRes.ok()).toBeTruthy();
  });
});

test.describe('User Group API endpoints', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
  });

  test('POST/GET/PUT/DELETE /api/user-groups full lifecycle', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const groupName = `E2E Group ${timestamp}`;

    const createRes = await page.request.post('/api/user-groups', {
      data: { name: groupName, users: [] },
    });
    expect(createRes.ok()).toBeTruthy();
    const created = await createRes.json();
    expect(created.name).toBe(groupName);
    expect(created.id).toBeTruthy();

    const findRes = await page.request.get(`/api/user-groups/${created.id}`);
    expect(findRes.ok()).toBeTruthy();
    const found = await findRes.json();
    expect(found.id).toBe(created.id);
    expect(found.name).toBe(groupName);

    const allRes = await page.request.get(
      `/api/user-groups?search=${encodeURIComponent(groupName)}`,
    );
    expect(allRes.ok()).toBeTruthy();
    const all = await allRes.json();
    expect(Array.isArray(all)).toBeTruthy();
    expect(all.find((it: { id: string }) => it.id === created.id)).toBeTruthy();

    const updateRes = await page.request.put(`/api/user-groups/${created.id}`, {
      data: { name: `${groupName} updated`, users: [] },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updated = await updateRes.json();
    expect(updated.name).toBe(`${groupName} updated`);

    const deleteRes = await page.request.delete(
      `/api/user-groups/${created.id}`,
    );
    expect(deleteRes.ok()).toBeTruthy();
  });
});

test.describe('User Account API endpoints', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
  });

  test('GET /api/user-accounts returns paginated user accounts', async ({
    page,
  }) => {
    const response = await page.request.get(
      '/api/user-accounts?page=0&size=10',
    );
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
  });

  test('POST /api/user-accounts/generate-key creates an api key', async ({
    page,
  }) => {
    const timestamp = Date.now();
    const label = `e2e-key-${timestamp}`;
    const generateRes = await page.request.post(
      '/api/user-accounts/generate-key',
      { data: { label } },
    );
    expect(generateRes.ok()).toBeTruthy();
    const body = await generateRes.json();
    expect(body.id).toBeTruthy();
    expect(body.key).toBeTruthy();
    expect(body.label).toBe(label);

    const revokeRes = await page.request.post(
      '/api/user-accounts/revoke-key',
      { data: { id: parseInt(body.id, 10) } },
    );
    expect(revokeRes.ok()).toBeTruthy();
  });
});

test.describe('Login status endpoint', () => {
  test('GET /login/status reports authenticated user after login', async ({
    page,
  }) => {
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    const response = await page.request.get('/login/status');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.loggedIn).toBe(true);
    expect(Array.isArray(body.authorities)).toBeTruthy();
    expect(body.authorities.length).toBeGreaterThan(0);
  });
});

test.describe('User authorization', () => {
  test('non-admin user cannot list all users', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, NON_ADMIN_USERNAME);
    const response = await page.request.get('/api/users');
    expect(response.status()).toBe(403);
  });

  test('non-admin user can fetch own profile', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, NON_ADMIN_USERNAME);
    const response = await page.request.get('/api/users/me');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.email).toBe(`${NON_ADMIN_USERNAME}@sesam.straat`);
  });
});

test.describe('User UI - admin', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(USERS_URL);
  });

  test('admin can see the users list', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Add' })).toBeVisible();
    await expect(page.locator('table thead')).toContainText('Name');
    await expect(page.locator('table thead')).toContainText('Email');
    await expect(page.locator('table thead')).toContainText('Authorities');
  });
});
