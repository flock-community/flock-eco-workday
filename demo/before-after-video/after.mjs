// Records the "After" scenes from the current frontend.
// Usage: node after.mjs <outDir> [baseURL]
import path from 'node:path';
import { chromium } from 'playwright';
import {
  makeRecorder,
  moveTo,
  settle,
  smoothScrollTo,
  typeSlow,
} from './lib.mjs';

const OUT = process.argv[2];
const BASE = process.argv[3] || 'http://localhost:3000';
const STATE = path.join(OUT, 'state.json');

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
});
const { record } = await makeRecorder(browser, OUT, BASE);

// Log in once outside recording to persist storage state for later scenes.
{
  const ctx = await browser.newContext({ baseURL: BASE });
  const page = await ctx.newPage();
  await page.goto('/auth');
  await page.getByLabel('Username').fill('bert@sesam.straat');
  await page.getByLabel('Password').fill('bert');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForSelector('text=Hi, Bert!', { timeout: 30000 });
  await ctx.storageState({ path: STATE });
  await ctx.close();
  console.log('login state saved');
}

// ---- Scene: login (light -> dark -> back -> sign in) ----
await record('a-login', async (page) => {
  await page.goto('/auth');
  await page.waitForSelector('text=Workday Login');
  await settle(page);
  page.mark();
  await page.mouse.move(500, 500, { steps: 15 });
  await page.waitForTimeout(1100);
  const toggle = page.getByRole('button', { name: /Switch to dark mode/i });
  if (await toggle.count()) {
    await moveTo(page, toggle);
    await page.waitForTimeout(400);
    await toggle.click();
    await page.waitForTimeout(1500);
    const back = page.getByRole('button', { name: /Switch to light mode/i });
    await back.click();
    await page.waitForTimeout(800);
  }
  await typeSlow(page, page.getByLabel('Username'), 'bert@sesam.straat', 30);
  await typeSlow(page, page.getByLabel('Password'), 'bert', 55);
  const btn = page.getByRole('button', { name: 'Sign in' });
  await moveTo(page, btn);
  await page.waitForTimeout(300);
  await btn.click();
  await page.waitForSelector('text=Hi, Bert!', { timeout: 30000 });
  await settle(page, 1600);
});

// ---- Scene: home dashboard, slow tour ----
await record(
  'a-home',
  async (page) => {
    await page.goto('/');
    await page.waitForSelector('text=Hi, Bert!', { timeout: 30000 });
    await settle(page, 900);
    page.mark();
    await page.mouse.move(600, 300, { steps: 20 });
    await page.waitForTimeout(1500);
    // gauges
    await smoothScrollTo(page, 440, 1300);
    await page.mouse.move(560, 480, { steps: 25 });
    await page.waitForTimeout(1500);
    // hours overview chart
    await smoothScrollTo(page, 980, 1400);
    await page.mouse.move(760, 500, { steps: 25 });
    await page.waitForTimeout(1700);
    // expenses / missing hours / hack days widgets
    await smoothScrollTo(page, 1750, 1500);
    await page.waitForTimeout(1200);
    const hackToggle = page.locator('input[type="checkbox"]').last();
    await page.waitForTimeout(900);
  },
  { storageState: STATE },
);

// ---- Scene: hack days widget (next-up ordering + sliders) ----
await record(
  'a-hackdays',
  async (page) => {
    await page.goto('/');
    await page.waitForSelector('text=Hack days', { timeout: 30000 });
    await settle(page, 900);
    const widget = page.getByText('Hack days of this year').first();
    await widget.scrollIntoViewIfNeeded();
    await page.waitForTimeout;
    page.mark();
    await page.waitForTimeout(1000);
    await page.mouse.move(1100, 550, { steps: 25 });
    await page.waitForTimeout(2200);
  },
  { storageState: STATE },
);

// ---- Scene: events list via the rail (year filter + table) ----
await record(
  'a-events',
  async (page) => {
    await page.goto('/');
    await page.waitForSelector('text=Hi, Bert!', { timeout: 30000 });
    await settle(page, 700);
    page.mark();
    const nav = page.getByRole('link', { name: 'Events' }).first();
    const navBtn = (await nav.count())
      ? nav
      : page.getByText('Events', { exact: true }).first();
    await moveTo(page, navBtn);
    await page.waitForTimeout(350);
    await navBtn.click();
    await settle(page, 1000);
    await page.waitForTimeout(900);
    // year filter
    const year = page.getByLabel('Year').first();
    if (await year.count()) {
      await moveTo(page, year);
      await page.waitForTimeout(350);
      await year.click();
      await page.waitForTimeout(700);
      const opt = page.getByRole('option', { name: '2025' });
      if (await opt.count()) {
        await moveTo(page, opt);
        await opt.click();
        await settle(page, 900);
        await page.waitForTimeout(900);
        await year.click();
        await page.waitForTimeout(500);
        await page.getByRole('option', { name: '2026' }).click();
        await settle(page, 800);
      } else {
        await page.keyboard.press('Escape');
      }
    }
    await page.waitForTimeout(800);
  },
  { storageState: STATE },
);

// ---- Scene: event dialog (per-attendee hours & budgets) ----
await record(
  'a-event-dialog',
  async (page) => {
    await page.goto('/event');
    await settle(page, 1200);
    page.mark();
    const row = page.getByRole('row', { name: /Kotlin Conf/i }).first();
    const target = (await row.count()) ? row : page.getByRole('row').nth(2);
    await moveTo(page, target);
    await page.waitForTimeout(400);
    await target.click();
    await page.waitForTimeout(1600);
    // tour the dialog
    const dialog = page.getByRole('dialog');
    if (await dialog.count()) {
      const box = await dialog.boundingBox();
      if (box) {
        await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.4, {
          steps: 20,
        });
        await page.waitForTimeout(1000);
        // scroll inside dialog to attendees/budget
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(1400);
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(1600);
      }
    }
  },
  { storageState: STATE },
);

// ---- Scene: leave days ----
await record(
  'a-leave',
  async (page) => {
    await page.goto('/leave-days');
    await page.waitForSelector('text=Leave days', { timeout: 30000 });
    await settle(page, 1000);
    page.mark();
    await page.mouse.move(700, 400, { steps: 20 });
    await page.waitForTimeout(1600);
    await smoothScrollTo(page, 420, 1300);
    await page.waitForTimeout(1600);
  },
  { storageState: STATE },
);

// ---- Scene: sick days ----
await record(
  'a-sick',
  async (page) => {
    await page.goto('/sickdays');
    await page
      .waitForSelector('text=Sick days', { timeout: 30000 })
      .catch(() => {});
    await settle(page, 1000);
    page.mark();
    await page.mouse.move(700, 420, { steps: 20 });
    await page.waitForTimeout(2200);
  },
  { storageState: STATE },
);

// ---- Scene: expenses ----
await record(
  'a-expenses',
  async (page) => {
    await page.goto('/expenses');
    await page
      .waitForSelector('text=Expenses', { timeout: 30000 })
      .catch(() => {});
    await settle(page, 1000);
    page.mark();
    await page.mouse.move(700, 420, { steps: 20 });
    await page.waitForTimeout(2200);
  },
  { storageState: STATE },
);

// ---- Scene: dark mode sweep ----
await record(
  'a-dark',
  async (page) => {
    await page.goto('/');
    await page.waitForSelector('text=Hi, Bert!', { timeout: 30000 });
    await settle(page, 800);
    page.mark();
    const toggle = page.getByRole('button', { name: /Switch to dark mode/i });
    await moveTo(page, toggle);
    await page.waitForTimeout(600);
    await toggle.click();
    await page.waitForTimeout(2000);
    await page.goto('/expenses');
    await settle(page, 900);
    await page.waitForTimeout(2400);
  },
  { storageState: STATE },
);

await browser.close();
console.log('done');
