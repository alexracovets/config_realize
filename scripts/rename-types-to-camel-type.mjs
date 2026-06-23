import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SCAN_DIRS = ['src', 'playwright', 'app'];

const toCamelTypeName = (name) => {
  if (name.endsWith('Type')) return name.charAt(0).toLowerCase() + name.slice(1);
  return `${name.charAt(0).toLowerCase()}${name.slice(1)}Type`;
};

const collectExportedNames = () => {
  const names = new Set();
  const typesRoot = path.join(ROOT, 'src/types');

  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
        const text = fs.readFileSync(full, 'utf8');
        for (const match of text.matchAll(/^(?:export\s+)?(?:type|interface)\s+([A-Za-z][A-Za-z0-9]*)/gm)) {
          names.add(match[1]);
        }
        for (const match of text.matchAll(/export type \{([^}]+)\}/g)) {
          match[1].split(',').forEach((part) => {
            const name = part
              .trim()
              .split(/\s+as\s+/)[0]
              .trim();
            if (name) names.add(name);
          });
        }
      }
    }
  };

  walk(typesRoot);
  return [...names].sort((a, b) => b.length - a.length);
};

const renameMap = Object.fromEntries(collectExportedNames().map((name) => [name, toCamelTypeName(name)]));

const walkFiles = (dir, files = []) => {
  if (!fs.existsSync(dir)) return files;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.next') continue;
      walkFiles(full, files);
    } else if (/\.(ts|tsx|mts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
};

const transformTypeDefinitions = (text) => {
  let result = text;

  for (const [oldName, newName] of Object.entries(renameMap)) {
    const objectTypePattern = new RegExp(`^type ${oldName} = \\{`, 'gm');
    result = result.replace(objectTypePattern, `interface ${newName} {`);

    result = result.replace(new RegExp(`^interface ${oldName}\\b`, 'gm'), `interface ${newName}`);
    result = result.replace(new RegExp(`^type ${oldName}\\b`, 'gm'), `type ${newName}`);
  }

  return result;
};

const replaceIdentifiers = (text) => {
  let result = text;
  for (const [oldName, newName] of Object.entries(renameMap)) {
    const re = new RegExp(`\\b${oldName}\\b`, 'g');
    result = result.replace(re, newName);
  }
  return result;
};

const files = SCAN_DIRS.flatMap((dir) => walkFiles(path.join(ROOT, dir)));

for (const file of files) {
  const original = fs.readFileSync(file, 'utf8');
  const isTypeDef = file.includes(`${path.sep}src${path.sep}types${path.sep}`);
  const next = isTypeDef ? transformTypeDefinitions(replaceIdentifiers(original)) : replaceIdentifiers(original);
  if (next !== original) fs.writeFileSync(file, next);
}

console.log(`Renamed ${Object.keys(renameMap).length} types across ${files.length} files`);
console.log(
  'Sample:',
  Object.entries(renameMap)
    .slice(0, 8)
    .map(([a, b]) => `${a} -> ${b}`)
    .join(', '),
);
