# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project.spec.ts >> Project CRUD Operations >> should edit an existing project
- Location: tests/project.spec.ts:46:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('cell', { name: 'E2E editable project 1782219119723 (renamed)' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('cell', { name: 'E2E editable project 1782219119723 (renamed)' })

```

```yaml
- main:
  - button "Menu"
  - link "Flock. Workday":
    - /url: /
  - button "Switch to dark mode"
  - button
  - text: Projects
  - button "Add"
  - table "collapsible table":
    - rowgroup:
      - row "Project name":
        - columnheader
        - columnheader "Project name"
        - columnheader
    - rowgroup:
      - row "Empty project":
        - cell:
          - button
        - cell "Empty project"
        - cell:
          - button
      - row "Project A1":
        - cell:
          - button
        - cell "Project A1"
        - cell:
          - button
      - row "Project A2":
        - cell:
          - button
        - cell "Project A2"
        - cell:
          - button
      - row "Project C":
        - cell:
          - button
        - cell "Project C"
        - cell:
          - button
      - row "Project D":
        - cell:
          - button
        - cell "Project D"
        - cell:
          - button
      - row "E2E created project 1782219111607":
        - cell:
          - button
        - cell "E2E created project 1782219111607"
        - cell:
          - button
      - row "E2E editable project 1782219119723":
        - cell:
          - button
        - cell "E2E editable project 1782219119723"
        - cell:
          - button
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';
  3   | 
  4   | const PROJECT_URL = '/projects';
  5   | const ADMIN_USERNAME = 'bert';
  6   | 
  7   | test.describe('Project CRUD Operations', () => {
  8   |   test.beforeEach(async ({ page }) => {
  9   |     await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
  10  |     await page.goto(PROJECT_URL);
  11  |     await page.waitForLoadState('networkidle');
  12  |   });
  13  | 
  14  |   async function openCreateDialog(page) {
  15  |     await page.getByRole('button', { name: 'Add' }).click();
  16  |     await expect(page.getByText('Create a project')).toBeVisible();
  17  |   }
  18  | 
  19  |   async function openEditDialogFor(page, projectName: string) {
  20  |     const row = page.getByRole('row', { name: new RegExp(projectName) });
  21  |     await row.getByRole('button').last().click();
  22  |     await expect(page.getByText('Create a project')).toBeVisible();
  23  |   }
  24  | 
  25  |   test('should display the seeded project list', async ({ page }) => {
  26  |     await expect(page.getByText('Projects')).toBeVisible();
  27  |     await expect(
  28  |       page.getByRole('cell', { name: 'Empty project' }),
  29  |     ).toBeVisible();
  30  |   });
  31  | 
  32  |   test('should create a new project', async ({ page }) => {
  33  |     const projectName = `E2E created project ${Date.now()}`;
  34  | 
  35  |     await openCreateDialog(page);
  36  | 
  37  |     await page.getByLabel('Name').fill(projectName);
  38  |     await page.getByRole('button', { name: 'Save' }).click();
  39  | 
  40  |     await expect(page.getByText('Create a project')).not.toBeVisible();
  41  |     await page.waitForLoadState('networkidle');
  42  | 
  43  |     await expect(page.getByRole('cell', { name: projectName })).toBeVisible();
  44  |   });
  45  | 
  46  |   test('should edit an existing project', async ({ page }) => {
  47  |     const originalName = `E2E editable project ${Date.now()}`;
  48  |     const updatedName = `${originalName} (renamed)`;
  49  | 
  50  |     // Seed a project we own so the test does not depend on other tests
  51  |     await openCreateDialog(page);
  52  |     await page.getByLabel('Name').fill(originalName);
  53  |     await page.getByRole('button', { name: 'Save' }).click();
  54  |     await expect(page.getByText('Create a project')).not.toBeVisible();
  55  |     await page.waitForLoadState('networkidle');
  56  | 
  57  |     await openEditDialogFor(page, originalName);
  58  | 
  59  |     const nameField = page.getByLabel('Name');
  60  |     await nameField.clear();
  61  |     await nameField.fill(updatedName);
  62  |     await page.getByRole('button', { name: 'Save' }).click();
  63  | 
  64  |     await expect(page.getByText('Create a project')).not.toBeVisible();
  65  |     await page.waitForLoadState('networkidle');
  66  | 
> 67  |     await expect(page.getByRole('cell', { name: updatedName })).toBeVisible();
      |                                                                 ^ Error: expect(locator).toBeVisible() failed
  68  |     await expect(
  69  |       page.getByRole('cell', { name: originalName, exact: true }),
  70  |     ).toHaveCount(0);
  71  |   });
  72  | 
  73  |   test('should delete a project without assignments', async ({ page }) => {
  74  |     const projectName = `E2E deletable project ${Date.now()}`;
  75  | 
  76  |     // Seed a fresh project (no assignments => delete is enabled)
  77  |     await openCreateDialog(page);
  78  |     await page.getByLabel('Name').fill(projectName);
  79  |     await page.getByRole('button', { name: 'Save' }).click();
  80  |     await expect(page.getByText('Create a project')).not.toBeVisible();
  81  |     await page.waitForLoadState('networkidle');
  82  | 
  83  |     await openEditDialogFor(page, projectName);
  84  | 
  85  |     // The Delete button is only visible when there are no assignments
  86  |     await page.getByRole('button', { name: 'Delete' }).click();
  87  | 
  88  |     await expect(page.getByText('Create a project')).not.toBeVisible();
  89  |     await page.waitForLoadState('networkidle');
  90  | 
  91  |     await expect(
  92  |       page.getByRole('cell', { name: projectName, exact: true }),
  93  |     ).toHaveCount(0);
  94  |   });
  95  | 
  96  |   test('should disable delete for a project that has assignments', async ({
  97  |     page,
  98  |   }) => {
  99  |     // "Project D" is seeded with assignments via LoadAssignmentData
  100 |     await openEditDialogFor(page, 'Project D');
  101 | 
  102 |     await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  103 |     await expect(
  104 |       page.getByText(
  105 |         'This project cannot be deleted because it contains assignments',
  106 |       ),
  107 |     ).toBeVisible();
  108 |   });
  109 | });
  110 | 
```