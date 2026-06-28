import fs from 'fs';
import path from 'path';

const ROOT = path.resolve('src');

const SKIP_CONTAINER_INDEX = new Set([
  path.join(ROOT),
  path.join(ROOT, 'ui'),
  path.join(ROOT, 'ui', 'components'),
  path.join(ROOT, 'ui', 'components', 'atomic'),
]);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeModuleIndex(targetDir, base) {
  fs.writeFileSync(path.join(targetDir, 'index.ts'), `export * from './${base}';\n`);
}

function moveModuleFile(filePath) {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const base = path.basename(filePath, ext);
  const dirName = path.basename(dir);

  if (base === 'index' || base.endsWith('.test') || base === 'config') return false;
  if (base === dirName) return false;

  const targetDir = path.join(dir, base);
  const targetFile = path.join(targetDir, `${base}${ext}`);

  if (fs.existsSync(targetDir) || !fs.existsSync(filePath)) return false;

  ensureDir(targetDir);
  fs.renameSync(filePath, targetFile);
  writeModuleIndex(targetDir, base);
  return true;
}

function addContainerIndex(dir) {
  if (SKIP_CONTAINER_INDEX.has(dir)) return false;

  const indexPath = path.join(dir, 'index.ts');
  if (fs.existsSync(indexPath)) return false;

  const dirName = path.basename(dir);
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const subdirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  if (subdirs.length === 0) return false;

  const lines = [];

  for (const ext of ['.tsx', '.ts']) {
    const primary = `${dirName}${ext}`;
    if (entries.some((entry) => entry.isFile() && entry.name === primary)) {
      lines.push(`export { ${dirName} } from './${dirName}';`);
      break;
    }
  }

  for (const name of subdirs.sort()) {
    lines.push(`export * from './${name}';`);
  }

  fs.writeFileSync(indexPath, `${lines.join('\n')}\n`);
  return true;
}

function addMissingIndexForPrimaryModule(dir) {
  const dirName = path.basename(dir);
  const indexPath = path.join(dir, 'index.ts');
  if (fs.existsSync(indexPath)) return false;

  for (const ext of ['.tsx', '.ts']) {
    const primary = path.join(dir, `${dirName}${ext}`);
    if (fs.existsSync(primary)) {
      fs.writeFileSync(indexPath, `export { ${dirName} } from './${dirName}';\n`);
      return true;
    }
  }

  return false;
}

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const subdirs = entries.filter((entry) => entry.isDirectory());
  const files = entries.filter(
    (entry) =>
      entry.isFile() &&
      /\.(ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith('.test.ts') &&
      !entry.name.endsWith('.d.ts') &&
      entry.name !== 'config.ts' &&
      !entry.name.endsWith('.worker.ts'),
  );

  const looseFiles = files.filter((entry) => entry.name !== 'index.ts');
  const dirName = path.basename(dir);
  const hasIndex = files.some((entry) => entry.name === 'index.ts');
  const hasSubdirs = subdirs.length > 0;
  const moved = [];

  if (hasSubdirs) {
    for (const file of looseFiles) {
      const base = file.name.replace(/\.(tsx?)$/, '');
      if (base !== dirName && moveModuleFile(path.join(dir, file.name))) {
        moved.push(path.join(dir, file.name));
      }
    }

    if (!hasIndex && addContainerIndex(dir)) {
      moved.push(`${dir}/index.ts (container)`);
    }
  } else if (looseFiles.length > 0) {
    for (const file of looseFiles) {
      const base = file.name.replace(/\.(tsx?)$/, '');
      if (base !== dirName && moveModuleFile(path.join(dir, file.name))) {
        moved.push(path.join(dir, file.name));
      }
    }

    if (!hasIndex && addMissingIndexForPrimaryModule(dir)) {
      moved.push(`${dir}/index.ts (primary)`);
    }
  }

  for (const subdir of subdirs) {
    moved.push(...scanDir(path.join(dir, subdir.name)));
  }

  return moved;
}

const moved = scanDir(ROOT);
console.log(`Moved/created: ${moved.length}`);
for (const item of moved) console.log(item);
