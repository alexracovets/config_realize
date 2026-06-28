/** Hooks WebGL compileShader during full configurator load. */
import { chromium } from '@playwright/test';

const baseUrl = process.env.BASE_URL ?? 'http://localhost:3000';
const route = '/federer_pallavolo';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.addInitScript(() => {
  window.__shaderCompile = { compileMs: 0, linkMs: 0, linkCount: 0, linkSamples: [] };
  window.__longTasks = [];
  new PerformanceObserver((list) => {
    for (const e of list.getEntries()) window.__longTasks.push(Math.round(e.duration));
  }).observe({ type: 'longtask', buffered: true });

  const wrapCompile = (proto) => {
    const compile = proto.compileShader;
    proto.compileShader = function (shader) {
      const t0 = performance.now();
      compile.call(this, shader);
      window.__shaderCompile.compileMs += performance.now() - t0;
    };
    const link = proto.linkProgram;
    proto.linkProgram = function (program) {
      const t0 = performance.now();
      link.call(this, program);
      const dt = performance.now() - t0;
      window.__shaderCompile.linkMs += dt;
      window.__shaderCompile.linkCount += 1;
      if (dt > 20) window.__shaderCompile.linkSamples.push(Math.round(dt));
    };
  };
  window.__draw = { count: 0, totalMs: 0, samples: [] };
  window.__tex = { count: 0, totalMs: 0, samples: [] };
  const wrapTex = (proto) => {
    for (const method of ['texImage2D', 'texSubImage2D', 'compressedTexImage2D']) {
      if (!proto[method]) continue;
      const orig = proto[method];
      proto[method] = function (...args) {
        const t0 = performance.now();
        const r = orig.apply(this, args);
        const dt = performance.now() - t0;
        window.__tex.count += 1;
        window.__tex.totalMs += dt;
        if (dt > 30) window.__tex.samples.push(Math.round(dt));
        return r;
      };
    }
  };
  wrapTex(WebGLRenderingContext.prototype);
  if (typeof WebGL2RenderingContext !== 'undefined') wrapTex(WebGL2RenderingContext.prototype);
  const wrapDraw = (proto) => {
    for (const method of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
      if (!proto[method]) continue;
      const orig = proto[method];
      proto[method] = function (...args) {
        const t0 = performance.now();
        const r = orig.apply(this, args);
        const dt = performance.now() - t0;
        window.__draw.count += 1;
        window.__draw.totalMs += dt;
        if (dt > 30) window.__draw.samples.push(Math.round(dt));
        return r;
      };
    }
  };
  wrapDraw(WebGLRenderingContext.prototype);
  if (typeof WebGL2RenderingContext !== 'undefined') wrapDraw(WebGL2RenderingContext.prototype);
  wrapCompile(WebGLRenderingContext.prototype);
  if (typeof WebGL2RenderingContext !== 'undefined') wrapCompile(WebGL2RenderingContext.prototype);
});

await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded', timeout: 120_000 });
await page.waitForFunction(
  () => {
    const loader = document.querySelector('[aria-busy="true"]');
    return !loader || loader.getAttribute('aria-busy') === 'false';
  },
  { timeout: 60_000 },
).catch(() => {});
await page.waitForTimeout(2000);

const data = await page.evaluate(() => ({
  shader: window.__shaderCompile,
  draw: window.__draw,
  tex: window.__tex,
  longTasks: [...(window.__longTasks ?? [])].sort((a, b) => b - a).slice(0, 12),
}));

console.log('\n=== WebGL compileShader during configurator load ===');
console.log(`  linkProgram calls: ${data.shader.linkCount}`);
console.log(`  compileShader CPU time: ${data.shader.compileMs.toFixed(0)}ms`);
console.log(`  linkProgram CPU time: ${data.shader.linkMs.toFixed(0)}ms`);
console.log(`  linkProgram >20ms: ${data.shader.linkSamples.join(', ')}ms`);
console.log(`Draw >30ms: ${data.draw.samples.join(', ')}ms (${data.draw.count} calls)`);
console.log(`texImage >30ms: ${data.tex.samples.join(', ')}ms (${data.tex.count} calls, ${data.tex.totalMs.toFixed(0)}ms sum)`);
console.log(`Top long tasks: ${data.longTasks.join(', ')}ms`);

await browser.close();
