import { mkdirSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

/**
 * Builds small WebP previews for the design picker UI from existing full-size design WebPs.
 *
 * Output: public/models/.../designs/thumbs/*.webp (100px wide by default)
 *
 *   DESIGN_THUMB_WIDTH=100 node scripts/generate-design-thumbnails.mjs
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const modelsRoot = join(root, 'public/models');
const THUMB_WIDTH = Number(process.env.DESIGN_THUMB_WIDTH ?? 100);
const THUMB_QUALITY = Number(process.env.DESIGN_THUMB_QUALITY ?? 80);

const findDesignWebps = (dir) => {
  const found = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'thumbs') continue;
      found.push(...findDesignWebps(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.webp') && basename(dirname(fullPath)) === 'designs') {
      found.push(fullPath);
    }
  }

  return found;
};

const formatKb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

const generateThumb = async (webpPath) => {
  const thumbsDir = join(dirname(webpPath), 'thumbs');
  const outPath = join(thumbsDir, basename(webpPath));

  mkdirSync(thumbsDir, { recursive: true });

  const image = sharp(webpPath);
  const metadata = await image.metadata();
  const height = metadata.width && metadata.height ? Math.max(1, Math.round((THUMB_WIDTH * metadata.height) / metadata.width)) : THUMB_WIDTH;

  await image.resize({ width: THUMB_WIDTH, height, fit: 'fill' }).webp({ quality: THUMB_QUALITY, alphaQuality: 100, effort: 4 }).toFile(outPath);

  return {
    name: basename(webpPath),
    before: statSync(webpPath).size,
    after: statSync(outPath).size,
    width: THUMB_WIDTH,
    height,
  };
};

const run = async () => {
  const webpFiles = findDesignWebps(modelsRoot).sort();

  if (webpFiles.length === 0) {
    console.log('No design WebP files found under public/models/**/designs.');
    return;
  }

  console.log(`Generating ${webpFiles.length} design thumbnail(s) at ${THUMB_WIDTH}px wide (quality ${THUMB_QUALITY})\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const webpPath of webpFiles) {
    const result = await generateThumb(webpPath);
    totalBefore += result.before;
    totalAfter += result.after;

    console.log(
      `  ${result.name.padEnd(36)} ${formatKb(result.before).padStart(10)} → ${formatKb(result.after).padStart(8)}  ${result.width}×${result.height}`,
    );
  }

  console.log(`\nTotal source: ${formatKb(totalBefore)} → thumbs: ${formatKb(totalAfter)}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
