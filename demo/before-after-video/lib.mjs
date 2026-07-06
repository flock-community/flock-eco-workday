// Shared capture helpers: fake cursor overlay, smooth scroll, per-scene recording.
import fs from 'node:fs';
import path from 'node:path';

export const VIEWPORT = { width: 1440, height: 900 };

// Injected into every page: renders a macOS-style cursor arrow that follows
// real mouse events, so the recorded video shows pointer movement.
const CURSOR_INIT = `
(() => {
  if (window.__fakeCursorInstalled) return;
  window.__fakeCursorInstalled = true;
  const ns = 'http://www.w3.org/2000/svg';
  function ensureCursor() {
    let el = document.getElementById('__fake_cursor');
    if (el) return el;
    if (!document.body) return null;
    el = document.createElement('div');
    el.id = '__fake_cursor';
    el.style.cssText = 'position:fixed;left:0;top:0;width:22px;height:26px;pointer-events:none;z-index:2147483647;transform:translate(-2px,-2px);display:none;';
    el.innerHTML = '<svg xmlns="' + ns + '" width="22" height="26" viewBox="0 0 22 26"><path d="M3 1 L3 20 L8 16 L11.5 24 L14.8 22.6 L11.3 14.8 L17.5 14.4 Z" fill="#111" stroke="#fff" stroke-width="1.4"/></svg>';
    document.body.appendChild(el);
    return el;
  }
  window.addEventListener('mousemove', (e) => {
    const el = ensureCursor();
    if (!el) return;
    el.style.display = 'block';
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
  }, { capture: true, passive: true });
  window.addEventListener('mousedown', () => {
    const el = ensureCursor();
    if (!el) return;
    el.firstChild.style.transform = 'scale(0.85)';
    setTimeout(() => { if (el.firstChild) el.firstChild.style.transform = ''; }, 160);
  }, { capture: true, passive: true });
})();
`;

export async function makeRecorder(browser, outDir, baseURL) {
  fs.mkdirSync(outDir, { recursive: true });
  const meta = {};
  const metaPath = path.join(outDir, 'meta.json');

  async function record(name, fn, { storageState } = {}) {
    const t0 = Date.now();
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: 1,
      baseURL,
      storageState,
      recordVideo: { dir: outDir, size: VIEWPORT },
    });
    await context.addInitScript(CURSOR_INIT);
    const page = await context.newPage();
    // mark() lets a scene report when its content is actually on screen,
    // so composition can trim the blank/loading head of the clip.
    let readyAt = null;
    page.mark = () => {
      if (readyAt === null) readyAt = (Date.now() - t0) / 1000;
    };
    let err = null;
    try {
      await fn(page);
    } catch (e) {
      err = e;
    }
    const video = page.video();
    await context.close();
    if (video) {
      const target = path.join(outDir, `${name}.webm`);
      try {
        await video.saveAs(target);
        await video.delete();
      } catch {}
    }
    meta[name] = { readyAt: readyAt ?? 0, error: err ? String(err) : null };
    fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2));
    if (err) {
      console.error(`SCENE ${name} FAILED:`, err);
    } else {
      console.log(`SCENE ${name} ok (ready at ${readyAt ?? 0}s)`);
    }
    return !err;
  }

  return { record, meta };
}

export async function settle(page, ms = 700) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(ms);
}

// Smooth window scroll to a Y position.
export async function smoothScrollTo(page, y, ms = 1200) {
  await page.evaluate(
    ([target, dur]) =>
      new Promise((resolve) => {
        const start = window.scrollY;
        const dist = target - start;
        const t0 = performance.now();
        const ease = (t) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
        function step(now) {
          const p = Math.min(1, (now - t0) / dur);
          window.scrollTo(0, start + dist * ease(p));
          if (p < 1) requestAnimationFrame(step);
          else resolve();
        }
        requestAnimationFrame(step);
      }),
    [y, ms],
  );
}

export async function moveTo(page, locator, opts = {}) {
  const box = await locator.boundingBox();
  if (!box) return null;
  const x = box.x + box.width * (opts.fx ?? 0.5);
  const y = box.y + box.height * (opts.fy ?? 0.5);
  await page.mouse.move(x, y, { steps: opts.steps ?? 28 });
  return { x, y };
}

export async function typeSlow(page, locator, text, delay = 55) {
  await moveTo(page, locator);
  await locator.click();
  await locator.pressSequentially(text, { delay });
}
