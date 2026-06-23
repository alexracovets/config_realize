import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

const copies = [
  ['node_modules/@imagemagick/magick-wasm/dist/magick.wasm', 'public/ghostscript/magick.wasm'],
  ['node_modules/pdfjs-dist/build/pdf.worker.min.mjs', 'public/ghostscript/pdf.worker.min.mjs'],
  ['node_modules/@okathira/ghostpdl-wasm/dist/gs.js', 'public/ghostscript/gs.js'],
  ['node_modules/@okathira/ghostpdl-wasm/dist/gs.wasm', 'public/ghostscript/gs.wasm'],
];

mkdirSync(join(root, 'public/ghostscript'), { recursive: true });
mkdirSync(join(root, 'public/logo'), { recursive: true });

for (const [from, to] of copies) {
  copyFileSync(join(root, from), join(root, to));
}

const logoCopies = [
  ['public/png/logo_r.png', 'public/logo/logo_short.png'],
  ['public/png/logo.png', 'public/logo/logo_vertical.png'],
];

for (const [from, to] of logoCopies) {
  copyFileSync(join(root, from), join(root, to));
}

console.log('Logo assets copied to public/');
