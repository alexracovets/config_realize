import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const REF = 'd:/work/configurator_clothes3/src';

const walk = (dir, acc = []) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(full, acc);
    } else if (/\.(tsx?|jsx?|mts)$/.test(entry.name)) {
      acc.push(full);
    }
  }

  return acc;
};

const hasUseClient = (content) => /^['"]use client['"]/.test(content);

const ensureUseClient = (file) => {
  const content = fs.readFileSync(file, 'utf8');

  if (hasUseClient(content)) {
    return false;
  }

  const ref = path.join(REF, path.relative(SRC, file));
  const refHas = fs.existsSync(ref) && hasUseClient(fs.readFileSync(ref, 'utf8'));
  const isHook = file.includes(`${path.sep}hooks${path.sep}`);
  const isStore = file.includes(`${path.sep}store${path.sep}`);
  const isProvider = file.includes(`${path.sep}providers${path.sep}`);
  const isUi = file.includes(`${path.sep}ui${path.sep}`) && file.endsWith('.tsx');
  const isFontsConfig = file.includes(`${path.sep}fonts${path.sep}fontsConfiguration${path.sep}`);
  const isUtilClient = file.includes(`${path.sep}utils${path.sep}`) && (file.includes('logoFile') || file.includes('priceFormat'));

  if (!(refHas || isHook || isStore || isProvider || isUi || isFontsConfig || isUtilClient)) {
    return false;
  }

  fs.writeFileSync(file, `'use client';\n\n${content.replace(/^\s*\n/, '')}`);

  return true;
};

let count = 0;

for (const file of walk(SRC)) {
  if (ensureUseClient(file)) {
    count += 1;
  }
}

console.log(`Added use client to ${count} files`);
