// Employee view and contract e2e tests. Run against a freshly started dev server (-Pdevelop).
// Tests run sequentially (fullyParallel: false).
// Employee user: pino@sesam.straat (password: pino).
// Admin user: bert@sesam.straat (password: bert).
//
// Dev data for pino (current year):
//   Contract: hackHours=160, studyHours=100, studyMoney=EUR2500
//   Allocations: 1 HackTime event-linked (16h, "Hack Day - March")
//   Expected summary: Hack(budget=160, used=16, avail=144), Study(budget=100, used=0, avail=100), Money(budget=€2.500, used=€0, avail=€2.500)
import { test, expect } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';
import {
  Then_summary_card_shows,
  Then_allocation_list_contains,
} from './steps/budgetSteps';

test.describe('Employee View (Read-Only)', () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test.afterEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.evaluate(() => {
      if (typeof window.localStorage !== 'undefined')
        window.localStorage.clear();
      if (typeof window.sessionStorage !== 'undefined')
        window.sessionStorage.clear();
    });
  });

  test('EMPV-01: Employee views budget summary cards', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'pino');
    await page.goto('/budget-allocations');
    // Wait for budget data to actually load -- networkidle fires before React state updates
    await expect(page.getByRole('heading', { name: 'Hack Hours', level: 6 })).toBeVisible({ timeout: 15000 });

    // Verify all three summary cards show correct values
    await Then_summary_card_shows(page, 'Hack Hours', '144h', '160h', '16h');
    await Then_summary_card_shows(page, 'Study Hours', '100h', '100h', '0h');
    await Then_summary_card_shows(page, 'Study Money', '€2.500', '€2.500', '€0');
  });

  test('EMPV-02: Employee sees allocation list with correct details', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'pino');
    await page.goto('/budget-allocations');
    // Wait for budget data to actually load
    await expect(page.getByRole('heading', { name: 'Hack Hours', level: 6 })).toBeVisible({ timeout: 15000 });

    // Verify the "Budget Allocations" section heading is visible
    await expect(page.getByRole('heading', { name: /Budget Allocations/i })).toBeVisible();

    // Verify the event-linked allocation is visible
    // EventAllocationListItem may render differently than StudyMoneyAllocationListItem,
    // so use direct locator as fallback
    const paper = page.locator('.MuiPaper-root').filter({ hasText: 'Budget Allocations' });
    await expect(paper.locator('.MuiCard-root').filter({ hasText: 'Hack Time' }).first()).toBeVisible();
    await expect(paper.locator('.MuiCard-root').filter({ hasText: '16h' }).first()).toBeVisible();
  });

  test('EMPV-03: Employee cannot create, edit, or delete allocations', async ({ page }) => {
    await Given_I_am_logged_in_as_user(page, 'pino');
    await page.goto('/budget-allocations');
    // Wait for budget data to actually load
    await expect(page.getByRole('heading', { name: 'Hack Hours', level: 6 })).toBeVisible({ timeout: 15000 });

    // PersonSelector renders inside a FormControl with "Person" label -- should not exist for employees
    const personControl = page.locator('.MuiFormControl-root').filter({ hasText: 'Person' });
    await expect(personControl).not.toBeVisible();

    // "Add Study Money" button should not be visible for employees
    await expect(page.getByRole('button', { name: 'Add Study Money' })).not.toBeVisible();

    // Edit and delete buttons should not be visible within the allocation list
    const paper = page.locator('.MuiPaper-root').filter({ hasText: 'Budget Allocations' });
    await expect(paper.getByRole('button', { name: 'edit' })).not.toBeVisible();
    await expect(paper.getByRole('button', { name: 'delete' })).not.toBeVisible();
  });
});
