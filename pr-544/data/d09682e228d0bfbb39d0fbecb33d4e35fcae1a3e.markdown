# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: leaveday.spec.ts >> LeaveDayController /api/leave-days >> Admin filters leave days by personId and approves (GET + PUT /api/leave-days)
- Location: tests/leaveday.spec.ts:75:5

# Error details

```
Error: findOnAnyPage: could not find locator within 25 pages
```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e5]:
    - button "Menu" [ref=e6] [cursor=pointer]:
      - img [ref=e7]
    - link "Flock. Workday" [ref=e9] [cursor=pointer]:
      - /url: /
      - generic [ref=e10]: Flock.
      - generic [ref=e11]: Workday
    - button "Switch to dark mode" [ref=e12] [cursor=pointer]:
      - img [ref=e13]
    - button [ref=e16] [cursor=pointer]:
      - img [ref=e17]
  - generic [ref=e19]:
    - generic [ref=e22]:
      - generic [ref=e23]: Select person
      - generic [ref=e24]:
        - combobox [ref=e25] [cursor=pointer]: Ernie Muppets
        - textbox: b452ffe6-040f-45f5-b5f8-696c6f53d878
        - img
        - group:
          - generic: Select person
    - generic [ref=e27]:
      - generic [ref=e28]:
        - generic [ref=e30]: Leave days
        - button "Add" [ref=e32] [cursor=pointer]:
          - img [ref=e33]
          - text: Add
      - generic [ref=e36]:
        - generic [ref=e37]:
          - generic [ref=e40]:
            - heading "Paid parental leave for Ernie for month JANUARY" [level=6] [ref=e41]
            - paragraph [ref=e42]: "Type: PAID_PARENTAL_LEAVE"
            - paragraph [ref=e43]: "Period: 01-01-2026 - 31-01-2026"
            - paragraph [ref=e44]: "Aantal dagen: 22"
            - paragraph [ref=e45]: "Aantal uren: 25"
            - button "REQUESTED" [ref=e48] [cursor=pointer]
          - generic [ref=e51]:
            - heading "Test paid leave for Ernie" [level=6] [ref=e52]
            - paragraph [ref=e53]: "Type: PAID_LEAVE"
            - paragraph [ref=e54]: "Period: 03-09-2025 - 04-09-2025"
            - paragraph [ref=e55]: "Aantal dagen: 2"
            - paragraph [ref=e56]: "Aantal uren: 16"
            - button "REQUESTED" [ref=e59] [cursor=pointer]
          - generic [ref=e62]:
            - heading "Test paid leave for Ernie" [level=6] [ref=e63]
            - paragraph [ref=e64]: "Type: PAID_LEAVE"
            - paragraph [ref=e65]: "Period: 27-02-2025 - 28-02-2025"
            - paragraph [ref=e66]: "Aantal dagen: 2"
            - paragraph [ref=e67]: "Aantal uren: 16"
            - button "REQUESTED" [ref=e70] [cursor=pointer]
          - generic [ref=e73]:
            - heading "Test paid leave for Ernie" [level=6] [ref=e74]
            - paragraph [ref=e75]: "Type: PAID_LEAVE"
            - paragraph [ref=e76]: "Period: 28-05-2024 - 29-05-2024"
            - paragraph [ref=e77]: "Aantal dagen: 2"
            - paragraph [ref=e78]: "Aantal uren: 16"
            - button "REQUESTED" [ref=e81] [cursor=pointer]
        - navigation "pagination navigation" [ref=e83]:
          - list [ref=e84]:
            - listitem [ref=e85]:
              - button "Go to previous page" [ref=e86] [cursor=pointer]:
                - img [ref=e87]
            - listitem [ref=e89]:
              - button "Go to page 1" [ref=e90] [cursor=pointer]: "1"
            - listitem [ref=e91]:
              - generic [ref=e92]: …
            - listitem [ref=e93]:
              - button "Go to page 4" [ref=e94] [cursor=pointer]: "4"
            - listitem [ref=e95]:
              - button "Go to page 5" [ref=e96] [cursor=pointer]: "5"
            - listitem [ref=e97]:
              - button "Go to page 6" [ref=e98] [cursor=pointer]: "6"
            - listitem [ref=e99]:
              - button "Go to page 7" [ref=e100] [cursor=pointer]: "7"
            - listitem [ref=e101]:
              - button "page 8" [ref=e102] [cursor=pointer]: "8"
            - listitem [ref=e103]:
              - button "Go to next page" [disabled]:
                - img
```

# Test source

```ts
  1  | import { expect, type Locator, type Page } from '@playwright/test';
  2  | 
  3  | // Walk the FlockPagination ("Go to next page") until `locator` resolves.
  4  | // The WorkDay/SickDay/LeaveDay listings are server-paginated and the seeded
  5  | // mock data spreads many entries across years for every fixture user, so a
  6  | // run-specific entry can sit several pages deep.
  7  | export async function findOnAnyPage(
  8  |   page: Page,
  9  |   locator: Locator,
  10 |   maxPages = 25,
  11 | ): Promise<Locator> {
  12 |   for (let i = 0; i < maxPages; i++) {
  13 |     const nextBtn = page.getByRole('button', { name: 'Go to next page' });
  14 |     // networkidle fires when the fetch settles, not when React has painted the
  15 |     // rows, so poll until the target row or the pager is on screen — otherwise
  16 |     // the count() below races the render and reports a false "not found".
  17 |     await expect
  18 |       .poll(
  19 |         async () => (await locator.count()) > 0 || (await nextBtn.count()) > 0,
  20 |         { timeout: 15000 },
  21 |       )
  22 |       .toBe(true);
  23 |     if ((await locator.count()) > 0) {
  24 |       return locator.first();
  25 |     }
  26 |     if (!(await nextBtn.isVisible()) || !(await nextBtn.isEnabled())) {
> 27 |       throw new Error(
     |             ^ Error: findOnAnyPage: could not find locator within 25 pages
  28 |         `findOnAnyPage: could not find locator within ${maxPages} pages`,
  29 |       );
  30 |     }
  31 |     await nextBtn.click();
  32 |     await page.waitForLoadState('networkidle');
  33 |   }
  34 |   throw new Error('findOnAnyPage: exceeded the page-walk safety limit');
  35 | }
  36 | 
  37 | export async function selectPersonInLayout(page: Page, personName: string) {
  38 |   await page.getByRole('combobox').first().click();
  39 |   await page.getByRole('option', { name: personName }).click();
  40 |   await page.waitForLoadState('networkidle');
  41 | }
  42 | 
  43 | export async function changeStatusOnLocator(
  44 |   page: Page,
  45 |   locator: Locator,
  46 |   fromStatus: string,
  47 |   toStatus: string,
  48 | ) {
  49 |   await expect(locator).toBeVisible();
  50 |   await locator.getByRole('button', { name: fromStatus }).click();
  51 |   await page.getByRole('menuitem', { name: toStatus }).click();
  52 |   await page.waitForLoadState('networkidle');
  53 |   await expect(locator.getByRole('button', { name: toStatus })).toBeVisible();
  54 | }
  55 | 
```