/** Measures drei Environment PMREM cost in isolation. */
import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

const html = `<!doctype html><html><body><div id="root"></div><script type="importmap">
{"imports":{"react":"https://esm.sh/react@19","react-dom/client":"https://esm.sh/react-dom@19/client","three":"https://unpkg.com/three@0.184.0/build/three.module.js","@react-three/fiber":"https://esm.sh/@react-three/fiber@9.1.2?external=react,react-dom,three","@react-three/drei":"https://esm.sh/@react-three/drei@10.7.7?external=react,react-dom,three,@react-three/fiber"}}
</script><script type="module">
import React from 'react';
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import { Environment } from '@react-three/drei';

window.__ready = false;
window.__mountAt = performance.now();

createRoot(document.getElementById('root')).render(
  React.createElement(Canvas, { gl: { logarithmicDepthBuffer: true }, dpr: [1, 2] },
    React.createElement(Environment, { preset: 'studio', environmentIntensity: 0.2, background: false, onLoad: () => {
      window.__ready = true;
      window.__readyAt = performance.now();
    }})
  )
);
</script></body></html>`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.route('**/profile-env.html', (r) => r.fulfill({ contentType: 'text/html', body: html }));
await page.goto(`${baseUrl}/profile-env.html`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForFunction(() => window.__ready, { timeout: 120_000 });

const timing = await page.evaluate(() => ({
  mountToReady: window.__readyAt - window.__mountAt,
  longTasks: performance.getEntriesByType('longtask').map((e) => ({ d: e.duration, s: e.startTime })),
}));

console.log('\n=== Environment preset=studio ===');
console.log(`  mount → onLoad: ${timing.mountToReady.toFixed(0)}ms`);
timing.longTasks.sort((a, b) => b.d - a.d);
console.log(`  long tasks: ${timing.longTasks.length}`);
for (const t of timing.longTasks.slice(0, 5)) console.log(`    ${t.d.toFixed(0)}ms @ ${t.s.toFixed(0)}ms`);

await browser.close();
