import { mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const modelsRoot = join(root, 'public/models');

const TARGET_WIDTH = Number(process.env.DESIGN_WIDTH ?? 2048);
const WEBP_QUALITY = Number(process.env.DESIGN_QUALITY ?? 90);

const findDesignSvgs = (dir) => {
  const found = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      found.push(...findDesignSvgs(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.toLowerCase().endsWith('.svg') && basename(dirname(fullPath)) === 'designs') {
      found.push(fullPath);
    }
  }

  return found;
};

const normalizeSvg = (svgText, targetWidth) => {
  const viewBox = svgText.match(/viewBox\s*=\s*"([^"]+)"/i);
  let width = targetWidth;
  let height = targetWidth;

  if (viewBox) {
    const [, , vbWidth, vbHeight] = viewBox[1]
      .trim()
      .split(/[\s,]+/)
      .map(Number);
    if (vbWidth > 0 && vbHeight > 0) {
      height = Math.round((targetWidth * vbHeight) / vbWidth);
    }
  }

  const svg = svgText.replace(/<svg\b([^>]*)>/i, (_full, attrs) => {
    const cleaned = attrs.replace(/\s(width|height)\s*=\s*"[^"]*"/gi, '');
    return `<svg${cleaned} width="${width}" height="${height}">`;
  });

  return { svg, width, height };
};

const formatKb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;

const externalizeEmbeddedImages = (svgText) => {
  const tmpDir = mkdtempSync(join(tmpdir(), 'design-svg-'));
  let index = 0;
  let replaced = 0;

  const rewritten = svgText.replace(/(xlink:href|href)="data:image\/(png|jpeg);base64,([^"]+)"/g, (_full, attr, ext, base64) => {
    const name = `image_${index++}.${ext === 'jpeg' ? 'jpg' : ext}`;
    writeFileSync(join(tmpDir, name), Buffer.from(base64, 'base64'));
    replaced += 1;
    return `${attr}="${name}"`;
  });

  const svgFile = join(tmpDir, 'wrapper.svg');
  writeFileSync(svgFile, rewritten);

  return { svgFile, cleanup: () => rmSync(tmpDir, { recursive: true, force: true }), replaced };
};

const convert = async (svgPath) => {
  const svgText = readFileSync(svgPath, 'utf8');
  const { svg, width, height } = normalizeSvg(svgText, TARGET_WIDTH);
  const outPath = svgPath.replace(/\.svg$/i, '.webp');

  try {
    await sharp(Buffer.from(svg)).resize({ width, height, fit: 'fill' }).webp({ quality: WEBP_QUALITY, alphaQuality: 100, effort: 6 }).toFile(outPath);
  } catch (error) {
    const { svgFile, cleanup, replaced } = externalizeEmbeddedImages(svg);
    if (replaced === 0) throw error;

    try {
      await sharp(svgFile).resize({ width, height, fit: 'fill' }).webp({ quality: WEBP_QUALITY, alphaQuality: 100, effort: 6 }).toFile(outPath);
    } finally {
      cleanup();
    }
  }

  return {
    name: basename(svgPath),
    before: statSync(svgPath).size,
    after: statSync(outPath).size,
    width,
    height,
  };
};

const run = async () => {
  const svgFiles = findDesignSvgs(modelsRoot).sort();

  if (svgFiles.length === 0) {
    console.log('No design SVGs found under public/models/**/designs.');
    return;
  }

  console.log(`Converting ${svgFiles.length} design SVG(s) → WebP at ${TARGET_WIDTH}px wide (quality ${WEBP_QUALITY})\n`);

  let totalBefore = 0;
  let totalAfter = 0;

  for (const svgPath of svgFiles) {
    const result = await convert(svgPath);
    totalBefore += result.before;
    totalAfter += result.after;

    const reduction = (100 * (1 - result.after / result.before)).toFixed(1);
    console.log(
      `  ${result.name.padEnd(36)} ${formatKb(result.before).padStart(9)} → ${formatKb(result.after).padStart(8)}  (-${reduction}%)  ${result.width}×${result.height}`,
    );
  }

  const totalReduction = (100 * (1 - totalAfter / totalBefore)).toFixed(1);
  console.log(`\nTotal: ${formatKb(totalBefore)} → ${formatKb(totalAfter)}  (-${totalReduction}%)`);
  console.log('Originals (.svg) kept as export masters.');
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
