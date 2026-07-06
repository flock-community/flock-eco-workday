// Records the "Before" scenes from the pre-refresh frontend (worktree @ c58c987).
// Usage: node before.mjs <outDir> [baseURL]
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

// ---- Scene: old login ----
await record('b-login', async (page) => {
  await page.goto('/auth');
  await page.waitForSelector('text=Workday Login');
  await settle(page);
  page.mark();
  await page.mouse.move(500, 500, { steps: 15 });
  await page.waitForTimeout(1400);
  await typeSlow(page, page.getByLabel('Username'), 'bert@sesam.straat', 30);
  await typeSlow(page, page.getByLabel('Password'), 'bert', 55);
  const btn = page.getByRole('button', { name: 'Sign in' });
  await moveTo(page, btn);
  await page.waitForTimeout(300);
  await btn.click();
  await page.waitForSelector('text=Hi, Bert!', { timeout: 30000 });
  await settle(page, 1600);
});

// ---- Scene: old home + hamburger drawer ----
await record(
  'b-home',
  async (page) => {
    await page.goto('/');
    await page.waitForSelector('text=Hi, Bert!', { timeout: 30000 });
    await settle(page, 900);
    page.mark();
    await page.mouse.move(600, 300, { steps: 20 });
    await page.waitForTimeout(1500);
    // open the hamburger drawer, show old nav, close it
    const burger = page.locator('header button').first();
    await moveTo(page, burger);
    await page.waitForTimeout(300);
    await burger.click();
    await page.waitForTimeout(1600);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(700);
    // scroll: quick links, leave/hack widgets
    await smoothScrollTo(page, 620, 1400);
    await page.waitForTimeout(1500);
    await smoothScrollTo(page, 1150, 1400);
    await page.waitForTimeout(1800);
  },
  { storageState: STATE },
);

// ---- Scene: old events (cards) ----
await record(
  'b-events',
  async (page) => {
    await page.goto('/event');
    await settle(page, 1200);
    page.mark();
    await page.mouse.move(650, 400, { steps: 20 });
    await page.waitForTimeout(1600);
    await smoothScrollTo(page, 500, 1300);
    await page.waitForTimeout(1500);
  },
  { storageState: STATE },
);

// ---- Scene: old event dialog ----
await record(
  'b-event-dialog',
  async (page) => {
    await page.goto('/event');
    await settle(page, 1200);
    page.mark();
    const card = page
      .getByText('Kotlin Conf (training)', { exact: false })
      .first();
    const target = (await card.count())
      ? card
      : page.getByText('Conference').first();
    await moveTo(page, target);
    await page.waitForTimeout(400);
    await target.click();
    await page.waitForTimeout(1800);
    const dialog = page.getByRole('dialog');
    if (await dialog.count()) {
      const box = await dialog.boundingBox();
      if (box) {
        await page.mouse.move(
          box.x + box.width / 2,
          box.y + box.height * 0.45,
          { steps: 20 },
        );
        await page.waitForTimeout(1200);
        await page.mouse.wheel(0, 250);
        await page.waitForTimeout(1600);
      }
    }
  },
  { storageState: STATE },
);

// ---- Scene: old leave days ----
await record(
  'b-leave',
  async (page) => {
    await page.goto('/leave-days');
    await settle(page, 1200);
    page.mark();
    await page.mouse.move(650, 420, { steps: 20 });
    await page.waitForTimeout(1800);
    await smoothScrollTo(page, 400, 1300);
    await page.waitForTimeout(1400);
  },
  { storageState: STATE },
);

// ---- Scene: old sick days ----
await record(
  'b-sick',
  async (page) => {
    await page.goto('/sickdays');
    await settle(page, 1200);
    page.mark();
    await page.mouse.move(650, 420, { steps: 20 });
    await page.waitForTimeout(2200);
  },
  { storageState: STATE },
);

// ---- Scene: old expenses ----
await record(
  'b-expenses',
  async (page) => {
    await page.goto('/expenses');
    await settle(page, 1200);
    page.mark();
    await page.mouse.move(650, 420, { steps: 20 });
    await page.waitForTimeout(1800);
    await smoothScrollTo(page, 380, 1200);
    await page.waitForTimeout(1400);
  },
  { storageState: STATE },
);

await browser.close();
console.log('done');
