// Renders title cards (1440x900 PNG) and caption chips (transparent PNG)
// in the style of the original before/after video.
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });

const BIRD = `<svg viewBox="113 22 62 62" fill="#1c1b14" xmlns="http://www.w3.org/2000/svg" style="width:92px;height:92px">
  <path d="M116.681,62.281c0.52,0.199,7.561-6.28,10.608-6.987c2.944-0.683,8.771,0.327,15.103,6.207l9.354-7.678c0,0,5.832-4.971,15.313-12.767c8.328-6.844,2.625-16.402,2.625-16.402s-20.08,16.919-20.816,17.486c-0.187,0.146-0.354,0.271-0.51,0.389c-3.735,2.185-7.277,1.705-9.948,0.89c-1.563-0.478-3.014-1.047-4.393-1.382c-4.719-1.144-9.397,0.481-10.71,5.155c-0.941,3.356,0.306,3.806-1.127,6.435C120.654,56.43,116.333,62.149,116.681,62.281z"/>
  <path d="M157.981,81.616c0,0-3.808-6.32-12.976-17.078l8.85-7.379l15.675-13.075c0,0,5.939,7.841-4.076,16.723l-3.515,3.135c-2.965,2.585-1.101,6.219-1.069,9.292C160.933,79.17,159.242,80.556,157.981,81.616z"/>
</svg>`;

const BASE_CSS = `
  * { margin:0; padding:0; box-sizing:border-box; }
  html,body { width:1440px; height:900px; font-family:'Roboto',sans-serif; }
`;

const cards = {
  'card-intro': `
    <style>${BASE_CSS}
      body { background:#faf8f0; display:flex; align-items:center; justify-content:center; }
      .wrap { text-align:center; }
      h1 { font-size:64px; font-weight:700; color:#1c1b14; letter-spacing:-1px; margin-top:34px; }
      h1 .dot { color:#fcde00; }
      h1 .sub { color:#5c594c; font-weight:500; }
      p { font-size:30px; font-weight:600; color:#1c1b14; margin-top:22px; }
    </style>
    <div class="wrap">
      ${BIRD}
      <h1>Flock<span class="dot">.</span> <span class="sub">Workday</span></h1>
      <p>Frontend refresh — before &amp; after</p>
    </div>`,
  'card-before': `
    <style>${BASE_CSS}
      body { background:#faf8f0; display:flex; align-items:center; justify-content:center; }
      .wrap { text-align:center; }
      h1 { font-size:96px; font-weight:700; color:#1c1b14; letter-spacing:-2px; }
      .bar { width:96px; height:10px; background:#fcde00; border-radius:5px; margin:18px auto 0; }
    </style>
    <div class="wrap"><h1>Before</h1><div class="bar"></div></div>`,
  'card-after': `
    <style>${BASE_CSS}
      body { background:#faf8f0; display:flex; align-items:center; justify-content:center; }
      .wrap { text-align:center; }
      h1 { font-size:96px; font-weight:700; color:#1c1b14; letter-spacing:-2px; }
      .bar { width:96px; height:10px; background:#fcde00; border-radius:5px; margin:18px auto 0; }
    </style>
    <div class="wrap"><h1>After</h1><div class="bar"></div></div>`,
  'card-outro': `
    <style>${BASE_CSS}
      body { background:#17160f; display:flex; align-items:center; justify-content:center; }
      .wrap { text-align:center; }
      h1 { font-size:56px; font-weight:700; color:#f5f2e6; letter-spacing:-1px; margin-top:30px; }
      h1 .dot { color:#fcde00; }
      p { font-size:26px; font-weight:500; color:#b4ae99; margin-top:18px; }
    </style>
    <div class="wrap">
      ${BIRD.replace('#1c1b14', '#fcde00')}
      <h1>Flock<span class="dot">.</span> Workday</h1>
      <p>Same app. New feathers.</p>
    </div>`,
};

function captionHTML(text) {
  return `
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      html,body { background:transparent; font-family:'Roboto',sans-serif; }
      body { display:inline-block; }
      .chip { display:inline-flex; align-items:center; background:#111111; border-radius:12px;
              padding:14px 26px 14px 0; overflow:hidden; }
      .accent { width:7px; align-self:stretch; background:#fcde00; border-radius:12px 0 0 12px; margin-right:19px; }
      .txt { color:#ffffff; font-size:23px; font-weight:700; letter-spacing:0.1px; white-space:nowrap; }
    </style>
    <span class="chip"><span class="accent"></span><span class="txt">${text}</span></span>`;
}

const captions = JSON.parse(
  fs.readFileSync(path.join(OUT, 'captions.json'), 'utf8'),
);

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium',
});
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

for (const [name, html] of Object.entries(cards)) {
  await page.setContent(html, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
  console.log('card', name);
}

for (const [id, text] of Object.entries(captions)) {
  await page.setContent(captionHTML(text), { waitUntil: 'networkidle' });
  const el = page.locator('.chip');
  await el.screenshot({
    path: path.join(OUT, `cap-${id}.png`),
    omitBackground: true,
  });
  console.log('caption', id, '->', text);
}

await browser.close();
