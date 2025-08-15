import { test, expect } from '@playwright/test';
import { Given_I_am_logged_in_as_user } from './steps/workdaySteps';

// Test configuration
const BASE_URL = 'http://localhost:3000';
const PERSON_URL = `${BASE_URL}/person`;
const VALID_USERNAME = 'tommy';
const ADMIN_USERNAME = 'bert';

test.describe('Person CRUD Operations', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test as admin (required for person operations)
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);

    // Navigate to person page
    await page.goto(PERSON_URL);

    // Verify we're on the person page
    await expect(page.getByText('Persons').last()).toBeVisible();
  });

  test('should create a new person successfully', async ({ page }) => {
    // Click Add button to open person dialog
    await page.getByRole('button', { name: 'Add' }).click();

    // Verify dialog is open
    await expect(page.getByText('Create Person')).toBeVisible();

    // Fill in person details with unique timestamp to avoid conflicts
    const timestamp = Date.now();
    const testPersonData = {
      firstname: `TestUser${timestamp}`,
      lastname: 'Create',
      email: `test.create.${timestamp}@example.com`,
      number: `${timestamp.toString().slice(-5)}`
    };

    // Fill in the form fields using correct selectors
    await page.getByRole('textbox', { name: 'firstname' }).fill(testPersonData.firstname);
    await page.getByRole('textbox', { name: 'lastname' }).fill(testPersonData.lastname);
    await page.getByRole('textbox', { name: 'email' }).fill(testPersonData.email);
    await page.getByRole('textbox', { name: 'number' }).fill(testPersonData.number);

    // Set reminders
    await page.getByRole('checkbox', { name: 'Reminders' }).check();

    // Click Save button
    await page.getByRole('button', { name: 'Save' }).click();

    // Wait for dialog to close and verify person was created
    await expect(page.getByText('Create Person')).not.toBeVisible();

    // Search for the newly created person
    await page.getByPlaceholder('Search name').fill(`${testPersonData.firstname} ${testPersonData.lastname}`);

    // Verify the person appears in the table
    await expect(page.getByRole('link', { name: `${testPersonData.firstname} ${testPersonData.lastname}` })).toBeVisible();
    await expect(page.getByText(testPersonData.email)).toBeVisible();
  });

  test('should view person details', async ({ page }) => {
    // First create a person for testing
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create Person')).toBeVisible();

    const timestamp = Date.now();
    const testPersonData = {
      firstname: `TestUser${timestamp}`,
      lastname: 'View',
      email: `test.view.${timestamp}@example.com`,
      number: `${timestamp.toString().slice(-5)}`
    };

    await page.getByRole('textbox', { name: 'firstname' }).fill(testPersonData.firstname);
    await page.getByRole('textbox', { name: 'lastname' }).fill(testPersonData.lastname);
    await page.getByRole('textbox', { name: 'email' }).fill(testPersonData.email);
    await page.getByRole('textbox', { name: 'number' }).fill(testPersonData.number);
    await page.getByRole('checkbox', { name: 'Reminders' }).check();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create Person')).not.toBeVisible();

    // Search for the person and click on their name to view details
    await page.getByPlaceholder('Search name').fill(`${testPersonData.firstname} ${testPersonData.lastname}`);
    await page.getByRole('link', { name: `${testPersonData.firstname} ${testPersonData.lastname}` }).click();

    // Wait for navigation to person details page
    await page.waitForURL(/.*\/person\/code\/.*/);

    // Verify person details are displayed
    await expect(page.getByText(`${testPersonData.firstname} ${testPersonData.lastname}`)).toBeVisible();
    await expect(page.getByText(testPersonData.email)).toBeVisible();
  });

  test('should edit an existing person', async ({ page }) => {
    // Already logged in as admin from beforeEach

    // First create a person for testing
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create Person')).toBeVisible();

    const timestamp = Date.now();
    const originalData = {
      firstname: `TestUser${timestamp}`,
      lastname: 'Edit',
      email: `test.edit.${timestamp}@example.com`,
      number: `${timestamp.toString().slice(-5)}`
    };

    await page.getByRole('textbox', { name: 'firstname' }).fill(originalData.firstname);
    await page.getByRole('textbox', { name: 'lastname' }).fill(originalData.lastname);
    await page.getByRole('textbox', { name: 'email' }).fill(originalData.email);
    await page.getByRole('textbox', { name: 'number' }).fill(originalData.number);
    await page.getByRole('checkbox', { name: 'Reminders' }).check();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create Person')).not.toBeVisible();

    // Navigate to person details
    await page.getByPlaceholder('Search name').fill(`${originalData.firstname} ${originalData.lastname}`);
    await page.getByRole('link', { name: `${originalData.firstname} ${originalData.lastname}` }).click();
    await page.waitForURL(/.*\/person\/code\/.*/);

    // Wait for the page to load completely
    await page.waitForTimeout(1000);

    // Based on my interactive debugging, I know edit/delete buttons exist
    // Let's try a different approach - look for buttons by their position/context
    // Skip the first few buttons (Menu, Profile, etc.) and try the action buttons
    const allMainButtons = page.locator('main button');
    const buttonCount = await allMainButtons.count();

    // The edit button should be one of the later buttons (not Menu, not Add buttons)
    // Try clicking buttons starting from a reasonable offset
    let editButtonFound = false;
    for (let i = 2; i < Math.min(buttonCount, 6); i++) {
      try {
        await allMainButtons.nth(i).click();
        await page.waitForTimeout(500);

        // Check if edit dialog opened
        if (await page.getByText('Create Person').isVisible()) {
          editButtonFound = true;
          break;
        }
      } catch (e) {
        // Continue to next button if this one fails
        continue;
      }
    }

    if (!editButtonFound) {
      throw new Error('Could not find edit button that opens Create Person dialog');
    }

    // Verify edit dialog is open
    await expect(page.getByText('Create Person')).toBeVisible();

    // Update person details
    const updatedData = {
      firstname: `UpdatedUser${timestamp}`,
      lastname: 'EditUpdated',
      email: `test.edit.updated.${timestamp}@example.com`
    };

    // Clear and fill updated values
    await page.getByRole('textbox', { name: 'firstname' }).clear();
    await page.getByRole('textbox', { name: 'firstname' }).fill(updatedData.firstname);
    await page.getByRole('textbox', { name: 'email' }).clear();
    await page.getByRole('textbox', { name: 'email' }).fill(updatedData.email);

    // Save changes
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify dialog closes and changes are reflected
    await expect(page.getByText('Create Person')).not.toBeVisible();

    // Verify updated information is displayed
    await expect(page.getByRole('cell', { name: updatedData.firstname })).toBeVisible();
    await expect(page.getByText(updatedData.email)).toBeVisible();
  });

  test('should delete a person', async ({ page }) => {
    // Already logged in as admin from beforeEach

    // First create a person for testing
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page.getByText('Create Person')).toBeVisible();

    const timestamp = Date.now();
    const testPersonData = {
      firstname: `TestUser${timestamp}`,
      lastname: 'Delete',
      email: `test.delete.${timestamp}@example.com`,
      number: `${timestamp.toString().slice(-5)}`
    };

    await page.getByRole('textbox', { name: 'firstname' }).fill(testPersonData.firstname);
    await page.getByRole('textbox', { name: 'lastname' }).fill(testPersonData.lastname);
    await page.getByRole('textbox', { name: 'email' }).fill(testPersonData.email);
    await page.getByRole('textbox', { name: 'number' }).fill(testPersonData.number);
    await page.getByRole('checkbox', { name: 'Reminders' }).check();

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Create Person')).not.toBeVisible();

    // Navigate to person details
    await page.getByPlaceholder('Search name').fill(`${testPersonData.firstname} ${testPersonData.lastname}`);
    await page.getByRole('link', { name: `${testPersonData.firstname} ${testPersonData.lastname}` }).click();
    await page.waitForURL(/.*\/person\/code\/.*/);

    // Wait for the page to load completely
    await page.waitForTimeout(1000);

    // Based on the working edit test, we know the edit button is found by the discovery algorithm
    // The delete button should be the next button after the edit button
    // Let's use a targeted approach similar to edit test but offset by 1
    const allMainButtons = page.locator('main button');
    const buttonCount = await allMainButtons.count();

    // First find the edit button (to establish baseline)
    let editButtonIndex = -1;
    for (let i = 2; i < Math.min(buttonCount, 6); i++) {
      try {
        await allMainButtons.nth(i).click();
        await page.waitForTimeout(500);

        if (await page.getByText('Create Person').isVisible()) {
          editButtonIndex = i;
          // Close the edit dialog
          await page.getByRole('button', { name: 'Cancel' }).click();
          await page.waitForTimeout(500);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // Now try the button right after the edit button for delete
    let deleteButtonFound = false;
    if (editButtonIndex >= 0 && editButtonIndex + 1 < buttonCount) {
      try {
        await allMainButtons.nth(editButtonIndex + 1).click();
        await page.waitForTimeout(500);

        if (await page.getByText('Surely you cant be serious?').isVisible()) {
          deleteButtonFound = true;
        }
      } catch (e) {
        // Continue with fallback approach
      }
    }

    // Fallback: try remaining buttons if direct approach failed
    if (!deleteButtonFound) {
      for (let i = Math.max(0, editButtonIndex + 2); i < buttonCount; i++) {
        try {
          await allMainButtons.nth(i).click();
          await page.waitForTimeout(500);

          if (await page.getByText('Surely you cant be serious?').isVisible()) {
            deleteButtonFound = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (!deleteButtonFound) {
      throw new Error('Could not find delete button that opens confirmation dialog');
    }

    // Verify confirmation dialog is open
    await expect(page.getByText('Surely you cant be serious?')).toBeVisible();
    await expect(page.getByText(`Delete ${testPersonData.firstname} ${testPersonData.lastname}`)).toBeVisible();

    // Confirm deletion
    await page.getByRole('button', { name: 'Confirm' }).click();

    // Verify redirect back to person list
    await page.waitForURL(PERSON_URL);

    // Search for the deleted person and verify it's not found
    await page.getByPlaceholder('Search name').fill(`${testPersonData.firstname} ${testPersonData.lastname}`);

    // Wait for search to complete and verify person is not in the table
    await page.waitForTimeout(1000);
    await expect(page.getByRole('link', { name: `${testPersonData.firstname} ${testPersonData.lastname}` })).not.toBeVisible();
  });
});

// Cleanup test to remove test data
test.describe('Person Test Cleanup', () => {
  test('should clean up test data', async ({ page }) => {
    // Login as admin and navigate to persons for cleanup
    await Given_I_am_logged_in_as_user(page, ADMIN_USERNAME);
    await page.goto(PERSON_URL);

    // List of test emails to clean up
    const testEmails = [
      'john.doe@test.com',
      'jane.smith@test.com',
      'bob.wilson@test.com',
      'robert.wilson@test.com',
      'alice.johnson@test.com',
      'test.user@test.com',
      'john.dev@test.com',
      'jane.design@test.com',
      'mike.mgr@test.com'
    ];

    // Delete each test person if they exist
    for (const email of testEmails) {
      try {
        // Search for person by email
        await page.fill('input[placeholder="Search name"]', email);
        await page.waitForTimeout(500);

        // Check if person exists
        const personLink = page.locator('a').filter({ hasText: /@test\.com/ }).first();
        if (await personLink.isVisible()) {
          await personLink.click();
          await page.waitForURL(/.*\/person\/code\/.*/);

          // Delete the person
          await page.click('button[aria-label="delete"]');
          await page.click('button:has-text("Delete")');
          await page.waitForURL(PERSON_URL);
        }
      } catch (error) {
        // Continue with next person if this one fails
        console.log(`Could not delete person with email ${email}:`, error);
      }
    }
  });
});
