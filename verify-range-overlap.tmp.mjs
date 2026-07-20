import { chromium } from '@playwright/test';

const shotsDir = 'C:/Users/alexr/AppData/Local/Temp/claude/d--work-configurators-config-realize/867767ec-be50-4fed-9e94-b54b9c904f75/scratchpad';

const browser = await chromium.launch({ args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });

const errors = [];
page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });
page.on('pageerror', (err) => errors.push(String(err)));

await page.goto('http://localhost:3000/completo-gara-calcio/baggio_calcio', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForSelector('text=TESTO', { timeout: 30000 });
await page.click('text=TESTO');
await page.waitForTimeout(500);
await page.click('text=Seleziona posizione');
await page.waitForTimeout(500);
await page.locator('[role="dialog"] button, [role="dialog"] [role="button"]').first().click();
await page.waitForTimeout(800);

await page.locator('text=Larghezza testo').scrollIntoViewIfNeeded();
await page.waitForTimeout(300);

// Drag the width slider thumb near the left edge, where min-label overlap is most likely.
const widthSlider = page.locator('text=Larghezza testo').locator('xpath=following::*[@role="slider"][1]');
const box = await widthSlider.boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 5, box.y + box.height / 2, { steps: 15 });
  await page.mouse.up();
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${shotsDir}/range-01-near-min.png` });

// Now drag near the right edge (max overlap case).
const box2 = await widthSlider.boundingBox();
if (box2) {
  await page.mouse.move(box2.x + box2.width / 2, box2.y + box2.height / 2);
  await page.mouse.down();
  await page.mouse.move(box2.x + box2.width - 5, box2.y + box2.height / 2, { steps: 15 });
  await page.mouse.up();
}
await page.waitForTimeout(400);
await page.screenshot({ path: `${shotsDir}/range-02-near-max.png` });

console.log('CONSOLE_ERRORS', JSON.stringify(errors));
await browser.close();
