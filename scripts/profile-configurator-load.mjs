/**
 * Profiles main-thread long tasks while opening the configurator.
 * Run: node scripts/profile-configurator-load.mjs [path]
 */
import { chromium } from '@playwright/test';

const route = `/${(process.argv[2] ?? 'federer_pallavolo').replace(/^\//, '')}`;
const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
const pageUrl = `${baseUrl}${route}`;

const profilePage = async (page, label) => {
  const longTasks = [];

  await page.addInitScript(() => {
    window.__longTasks = [];
    const obs = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__longTasks.push({
          name: entry.name,
          start: entry.startTime,
          duration: entry.duration,
        });
      }
    });
    obs.observe({ type: 'longtask', buffered: true });
  });

  const marks = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.startsWith('[PROFILE]')) marks.push(text);
  });

  const t0 = Date.now();
  await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 120_000 });

  // Wait until loader hides or watchdog
  await page.waitForFunction(
    () => {
      const loader = document.querySelector('[aria-busy="true"]');
      return !loader || loader.getAttribute('aria-busy') === 'false';
    },
    { timeout: 60_000 },
  ).catch(() => {});

  await page.waitForTimeout(1500);

  const tasks = await page.evaluate(() => window.__longTasks ?? []);
  const totalMs = Date.now() - t0;

  tasks.sort((a, b) => b.duration - a.duration);

  console.log(`\n=== ${label} (${route}) total ${totalMs}ms ===`);
  console.log(`Long tasks (>=50ms): ${tasks.length}`);
  for (const t of tasks.slice(0, 15)) {
    console.log(`  ${t.duration.toFixed(1)}ms @ ${t.start.toFixed(0)}ms  ${t.name}`);
  }
  const sumLong = tasks.reduce((s, t) => s + t.duration, 0);
  console.log(`Sum long-task time: ${sumLong.toFixed(0)}ms`);

  if (marks.length) {
    console.log('Console marks:');
    for (const m of marks) console.log(`  ${m}`);
  }

  return { tasks, totalMs, sumLong };
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

// Cold-ish: clear cache
await context.clearCookies();
await page.goto(pageUrl, { waitUntil: 'commit' }).catch(() => {});
await context.clearPermissions();

await profilePage(page, 'FIRST LOAD');

// Second navigation — product switch simulation
await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(500);
await profilePage(page, 'SECOND LOAD (warm cache likely)');

await browser.close();
