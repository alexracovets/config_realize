/**
 * Isolates GLB parse vs WebGL shader compile cost in real browser.
 * Run: node scripts/profile-glb-isolated.mjs
 */
import { chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelUrl = '/models/federer_pallavolo/model.glb';
const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';

const html = `<!doctype html><html><body><canvas id="c"></canvas><script type="importmap">
{"imports":{"three":"https://unpkg.com/three@0.184.0/build/three.module.js","three/addons/":"https://unpkg.com/three@0.184.0/examples/jsm/"}}
</script><script type="module">
const results = {};
const mark = (k) => { results[k] = performance.now(); window.__results = results; };

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, logarithmicDepthBuffer: true });
renderer.setSize(800, 600);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 800/600, 0.01, 100);
camera.position.z = 3;

mark('start');
const loader = new GLTFLoader();
loader.load('${modelUrl}', (gltf) => {
  mark('gltf_parsed');
  scene.add(gltf.scene);
  mark('scene_added');
  renderer.render(scene, camera);
  mark('first_render_bootstrap');
  // Upgrade all materials like compileGarmentShadersOverFrames batch (worst case)
  gltf.scene.traverse((o) => {
    if (o.isMesh && o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) m.needsUpdate = true;
    }
  });
  renderer.render(scene, camera);
  mark('second_render_needsUpdate');
}, undefined, (e) => { results.error = String(e); });
</script></body></html>`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.route('**/profile-glb.html', (route) => {
  route.fulfill({ contentType: 'text/html', body: html });
});

await page.goto(`${baseUrl}/profile-glb.html`, { waitUntil: 'domcontentloaded', timeout: 120_000 });

await page.waitForFunction(() => window.__results?.first_render_bootstrap, { timeout: 60_000 });
await page.waitForTimeout(500);

const tasks = await page.evaluate(() => {
  const obs = performance.getEntriesByType('longtask');
  return obs.map((e) => ({ start: e.startTime, duration: e.duration }));
});

const results = await page.evaluate(() => window.__results);
const start = results.start;

console.log('\n=== ISOLATED GLB (no custom garment shader) ===');
for (const [k, t] of Object.entries(results)) {
  if (k === 'start') continue;
  console.log(`  ${k}: +${(t - start).toFixed(0)}ms`);
}

tasks.sort((a, b) => b.duration - a.duration);
console.log(`\nLong tasks: ${tasks.length}`);
for (const t of tasks.slice(0, 8)) {
  console.log(`  ${t.duration.toFixed(0)}ms @ +${t.start.toFixed(0)}ms`);
}

await browser.close();
