const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SOCIAL_DIR = path.join(__dirname, 'social');
const OUT_DIR = path.join(SOCIAL_DIR, 'images');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const graphics = [
  // Square 1080×1080
  { file: 'sq-save-date.html',     w: 1080, h: 1080, label: 'Save the Date (Square)' },
  { file: 'sq-announce.html',      w: 1080, h: 1080, label: "You're Invited (Square)" },
  { file: 'sq-music.html',         w: 1080, h: 1080, label: 'Live Music (Square)' },
  { file: 'sq-kids.html',          w: 1080, h: 1080, label: 'Kids & Families (Square)' },
  { file: 'sq-food.html',          w: 1080, h: 1080, label: 'Food & Fun (Square)' },
  { file: 'sq-community.html',     w: 1080, h: 1080, label: 'Community (Square)' },
  // Portrait 1080×1350
  { file: 'portrait-montage.html', w: 1080, h: 1350, label: 'Photo Montage (Portrait)' },
  // Stories 1080×1920
  { file: 'story-save-date.html',  w: 1080, h: 1920, label: 'Save the Date (Story)' },
  { file: 'story-announce.html',   w: 1080, h: 1920, label: 'Announcement (Story)' },
  { file: 'story-activities.html', w: 1080, h: 1920, label: 'Activities (Story)' },
  // Wide 1200×630
  { file: 'wide-save-date.html',   w: 1200, h: 630,  label: 'Save the Date (Wide)' },
  { file: 'wide-announce.html',    w: 1200, h: 630,  label: 'Announcement (Wide)' },
  { file: 'wide-music.html',       w: 1200, h: 630,  label: 'Music & Performances (Wide)' },
  // Twitter/X 1200×675
  { file: 'twitter-card.html',     w: 1200, h: 675,  label: 'Twitter/X Card' },
  // LinkedIn 1200×627
  { file: 'linkedin-post.html',    w: 1200, h: 627,  label: 'LinkedIn Post' },
  // Post-event thank you. These two land at the repo root as JPGs because the
  // wide one is the link preview the recap page points at, and the square one
  // is what gets posted to Instagram after the day.
  { file: 'wide-thanks.html',      w: 1200, h: 630,  label: 'Thank You (Wide)',   out: '../og-recap.jpg',            jpegQuality: 86 },
  { file: 'sq-thanks.html',        w: 1080, h: 1080, label: 'Thank You (Square)', out: '../share-recap-square.jpg',  jpegQuality: 86 },
];

// Optional filter: `node capture-social.js thanks` renders only the graphics
// whose filename matches, instead of re-rendering the whole kit.
const only = process.argv.slice(2);
const queue = only.length
  ? graphics.filter((g) => only.some((m) => g.file.includes(m)))
  : graphics;

(async () => {
  // PW_CHROMIUM_PATH lets this run against a Chromium that is already on the
  // machine, for anyone who skipped Playwright's own browser download.
  const browser = await chromium.launch(
    process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : {}
  );
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  console.log(`\n🎨  GNG 2026 Social Media Kit — Capturing ${queue.length} graphics\n`);

  for (const g of queue) {
    const srcPath = path.join(SOCIAL_DIR, g.file);
    const outName = g.out || g.file.replace('.html', '.png');
    const outPath = g.out
      ? path.join(SOCIAL_DIR, g.out)
      : path.join(OUT_DIR, outName);

    await page.setViewportSize({ width: g.w, height: g.h });
    await page.goto(`file://${srcPath}`, { waitUntil: 'networkidle' });

    // Extra wait for web fonts to render
    await page.waitForTimeout(800);

    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: g.w, height: g.h },
      ...(g.jpegQuality ? { type: 'jpeg', quality: g.jpegQuality } : {}),
    });

    const kb = Math.round(fs.statSync(outPath).size / 1024);
    console.log(`  ✅  ${g.label.padEnd(32)} → ${g.out ? outName.replace('../', '') : `images/${outName}`}  (${kb} KB)`);
  }

  await browser.close();
  console.log(`\n✨  Done! All images saved to social/images/\n`);
})();
