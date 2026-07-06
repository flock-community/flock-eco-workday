// Composes the final before/after video from recorded clips + rendered cards.
// Usage: node compose.mjs <scratchpadDir>
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const S = process.argv[2];
const CARDS = path.join(S, 'cards');
const BUILD = path.join(S, 'build');
fs.mkdirSync(BUILD, { recursive: true });

const metaAfter = JSON.parse(
  fs.readFileSync(path.join(S, 'clips-after/meta.json'), 'utf8'),
);
const metaBefore = JSON.parse(
  fs.readFileSync(path.join(S, 'clips-before/meta.json'), 'utf8'),
);

// timeline definition ------------------------------------------------------
// caption: single id (whole clip) or [{id, from, to}] in seconds relative to trimmed clip
const timeline = [
  { card: 'card-intro', dur: 3.2, fade: true },
  { card: 'card-before', dur: 2.0, fade: true },

  {
    clip: 'clips-before/b-login',
    max: 9.0,
    captions: [{ id: 'b-login', from: 0.3 }],
  },
  {
    clip: 'clips-before/b-home',
    max: 10.5,
    captions: [
      { id: 'b-home-1', from: 0.3, to: 5.2 },
      { id: 'b-home-2', from: 5.4 },
    ],
  },
  {
    clip: 'clips-before/b-events',
    max: 5.0,
    captions: [{ id: 'b-events', from: 0.3 }],
  },
  {
    clip: 'clips-before/b-event-dialog',
    max: 6.5,
    captions: [{ id: 'b-event-dialog', from: 0.5 }],
  },
  {
    clip: 'clips-before/b-leave',
    max: 5.0,
    captions: [{ id: 'b-leave', from: 0.3 }],
  },
  {
    clip: 'clips-before/b-sick',
    max: 3.4,
    captions: [{ id: 'b-sick', from: 0.3 }],
  },
  {
    clip: 'clips-before/b-expenses',
    max: 5.0,
    captions: [{ id: 'b-expenses', from: 0.3 }],
  },

  { card: 'card-after', dur: 2.0, fade: true },

  {
    clip: 'clips-after/a-login',
    max: 10.0,
    captions: [{ id: 'a-login', from: 0.3 }],
  },
  {
    clip: 'clips-after/a-home',
    max: 11.0,
    captions: [
      { id: 'a-home-1', from: 0.3, to: 5.0 },
      { id: 'a-home-2', from: 5.2 },
    ],
  },
  {
    clip: 'clips-after/a-hackdays',
    max: 4.0,
    captions: [{ id: 'a-hackdays', from: 0.2 }],
  },
  {
    clip: 'clips-after/a-events',
    max: 8.5,
    captions: [{ id: 'a-events', from: 0.3 }],
  },
  {
    clip: 'clips-after/a-event-dialog',
    max: 8.0,
    skew: 1.3,
    captions: [{ id: 'a-event-dialog', from: 0.5 }],
  },
  {
    clip: 'clips-after/a-leave',
    max: 5.5,
    captions: [{ id: 'a-leave', from: 0.3 }],
  },
  {
    clip: 'clips-after/a-sick',
    max: 3.4,
    captions: [{ id: 'a-sick', from: 0.3 }],
  },
  {
    clip: 'clips-after/a-expenses',
    max: 3.4,
    captions: [{ id: 'a-expenses', from: 0.3 }],
  },
  {
    clip: 'clips-after/a-dark',
    max: 8.0,
    captions: [{ id: 'a-dark', from: 0.5 }],
  },

  { card: 'card-outro', dur: 3.2, fade: true },
];

const ENC = [
  '-c:v',
  'libx264',
  '-preset',
  'medium',
  '-crf',
  '18',
  '-pix_fmt',
  'yuv420p',
  '-r',
  '25',
  '-an',
];

function ffprobeDur(f) {
  return Number.parseFloat(
    execFileSync('ffprobe', [
      '-v',
      'error',
      '-show_entries',
      'format=duration',
      '-of',
      'csv=p=0',
      f,
    ]).toString(),
  );
}

function run(args) {
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], {
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}

const segments = [];
let idx = 0;
let total = 0;

for (const seg of timeline) {
  const out = path.join(BUILD, `seg-${String(idx).padStart(2, '0')}.mp4`);
  if (seg.card) {
    const png = path.join(CARDS, `${seg.card}.png`);
    const vf = ['scale=1440:900', 'setsar=1'];
    if (seg.fade)
      vf.push(
        `fade=t=in:st=0:d=0.35,fade=t=out:st=${(seg.dur - 0.35).toFixed(2)}:d=0.35`,
      );
    run([
      '-loop',
      '1',
      '-t',
      String(seg.dur),
      '-i',
      png,
      '-vf',
      vf.join(','),
      ...ENC,
      out,
    ]);
    total += seg.dur;
  } else {
    const webm = path.join(S, `${seg.clip}.webm`);
    const name = path.basename(seg.clip);
    const meta = seg.clip.includes('after') ? metaAfter : metaBefore;
    // recorded video time lags the wall clock slightly; shift forward so
    // segments start on a fully painted page instead of a loading flash
    const ready = Math.max(
      0,
      (meta[name]?.readyAt ?? 0) + 0.9 + (seg.skew ?? 0),
    );
    const full = ffprobeDur(webm);
    const avail = Math.max(1, full - ready - 0.1);
    const dur = Math.min(seg.max, avail);
    const inputs = ['-ss', ready.toFixed(3), '-t', dur.toFixed(3), '-i', webm];
    const capInputs = [];
    let filter = '[0:v]scale=1440:900,setsar=1,fps=25[v0]';
    let cur = 'v0';
    (seg.captions ?? []).forEach((c, i) => {
      capInputs.push('-i', path.join(CARDS, `cap-${c.id}.png`));
      const from = c.from ?? 0;
      const to = c.to ?? dur - 0.15;
      const next = `v${i + 1}`;
      // caption PNGs are rendered at 2x for sharpness; scale down at overlay time
      filter += `;[${i + 1}:v]scale=iw/2:-1[cap${i}]`;
      filter += `;[${cur}][cap${i}]overlay=(W-w)/2:H-h-40:enable='between(t,${from},${to})'[${next}]`;
      cur = next;
    });
    run([
      ...inputs,
      ...capInputs,
      '-filter_complex',
      filter,
      '-map',
      `[${cur}]`,
      ...ENC,
      out,
    ]);
    total += dur;
  }
  segments.push(out);
  console.log('segment', idx, seg.card ?? seg.clip, 'ok');
  idx++;
}

const list = segments.map((f) => `file '${f}'`).join('\n');
fs.writeFileSync(path.join(BUILD, 'list.txt'), list);
run([
  '-f',
  'concat',
  '-safe',
  '0',
  '-i',
  path.join(BUILD, 'list.txt'),
  '-c',
  'copy',
  '-movflags',
  '+faststart',
  path.join(S, 'workday-before-after.mp4'),
]);
console.log(`final video written, ~${total.toFixed(1)}s`);
