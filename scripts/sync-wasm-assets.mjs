import { copyFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Optional — run after upgrading @imagemagick/magick-wasm, pdfjs-dist, or @okathira/ghostpdl-wasm.
 * WASM/JS binaries are committed under public/ghostscript/ for static serving in the browser.
 *
 *   pnpm sync:wasm-assets
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const copies = [
  ['node_modules/@imagemagick/magick-wasm/dist/magick.wasm', 'public/ghostscript/magick.wasm'],
  ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/ghostscript/pdf.worker.min.mjs'],
  ['node_modules/@okathira/ghostpdl-wasm/dist/gs.js', 'public/ghostscript/gs.js'],
  ['node_modules/@okathira/ghostpdl-wasm/dist/gs.wasm', 'public/ghostscript/gs.wasm'],
];

const missing = [];

for (const [from, to] of copies) {
  const source = join(root, from);
  const target = join(root, to);

  if (!existsSync(source)) {
    missing.push(from);
    continue;
  }

  copyFileSync(source, target);
  console.log(`  ${to}`);
}

if (missing.length > 0) {
  console.error('\nMissing sources (run pnpm install first):');
  missing.forEach((path) => console.error(`  - ${path}`));
  process.exit(1);
}

console.log('\nWASM assets synced to public/ghostscript/');
