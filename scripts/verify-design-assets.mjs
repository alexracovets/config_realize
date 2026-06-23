import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const crewneckPath = join(root, 'src/data/crewneck/crewneck.json');
const crewneck = JSON.parse(readFileSync(crewneckPath, 'utf8'));

const missing = [];

const resolveThumbFileName = (pathName) => (pathName.toLowerCase().endsWith('.svg') ? pathName.replace(/\.svg$/i, '.webp') : pathName);

for (const product of crewneck.products) {
  const designsDir = join(root, 'public', product.path.replace(/^\//, ''), 'designs');

  for (const pattern of product.patterns ?? []) {
    for (const part of pattern.parts ?? []) {
      const filePath = join(designsDir, part.path_name);
      const thumbPath = join(designsDir, 'thumbs', resolveThumbFileName(part.path_name));
      if (!existsSync(filePath)) {
        missing.push(filePath);
      }
      if (!existsSync(thumbPath)) {
        missing.push(thumbPath);
      }
    }
  }

  for (const pattern of product.default_pattern ?? []) {
    for (const part of pattern.parts ?? []) {
      const filePath = join(designsDir, part.path_name);
      const thumbPath = join(designsDir, 'thumbs', resolveThumbFileName(part.path_name));
      if (!existsSync(filePath)) {
        missing.push(filePath);
      }
      if (!existsSync(thumbPath)) {
        missing.push(thumbPath);
      }
    }
  }
}

if (missing.length > 0) {
  console.error('Missing design assets:');
  missing.forEach((filePath) => console.error(`  - ${filePath}`));
  process.exit(1);
}

console.log('All design assets verified.');
