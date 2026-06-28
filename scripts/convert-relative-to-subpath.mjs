import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, normalize, relative, resolve } from 'node:path';

const SRC = resolve('src');

const SUBPATH_ALIASES = [
  ['configurator/hooks/', '@configurator/hooks/'],
  ['configurator/scene/', '@configurator/scene/'],
  ['configurator/canvas/', '@configurator/canvas/'],
  ['configurator/runtime/', '@configurator/runtime/'],
  ['configurator/gizmo/', '@configurator/gizmo/'],
  ['configurator/mappers/', '@configurator/mappers/'],
  ['configurator/bootstrap/', '@configurator/bootstrap/'],
  ['configurator/utils/', '@configurator/utils/'],
  ['store/', '@store/'],
  ['utils/', '@utils/'],
  ['hooks/', '@hooks/'],
  ['types/', '@types/'],
  ['shopify/', '@shopify/'],
  ['ui/components/atomic/molecules/', '@molecules/'],
  ['ui/components/atomic/organisms/', '@organisms/'],
  ['ui/components/atomic/atoms/', '@atoms/'],
  ['ui/components/atomic/templates/', '@templates/'],
  ['ui/components/atomic/pages/', '@pages/'],
  ['ui/components/shared/', '@shared/'],
  ['ui/components/skeletons/', '@skeletons/'],
];

const toModulePath = (absPath) => {
  const rel = normalize(relative(SRC, absPath)).replace(/\\/g, '/');
  if (rel.endsWith('.ts') || rel.endsWith('.tsx')) {
    const withoutExt = rel.replace(/\.(tsx?)$/, '');
    return withoutExt.endsWith('/index') ? withoutExt.slice(0, -6) : withoutExt;
  }
  return rel;
};

const toAliasSubpath = (absPath) => {
  const modulePath = toModulePath(absPath);
  for (const [prefix, alias] of SUBPATH_ALIASES) {
    if (modulePath === prefix.slice(0, -1) || modulePath.startsWith(prefix)) {
      return `${alias}${modulePath.slice(prefix.length)}`;
    }
  }
  return null;
};

const walk = (dir, files = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (!['node_modules', '.next'].includes(entry)) walk(full, files);
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry)) files.push(full);
  }
  return files;
};

let changedFiles = 0;

for (const filePath of walk(SRC)) {
  if (basename(filePath) === 'index.ts' || basename(filePath) === 'index.tsx') continue;

  let content = readFileSync(filePath, 'utf8');
  let changed = false;

  content = content.replace(/^import\s+(type\s+)?(.+?)\s+from\s+['"](\.[^'"]+)['"];?\s*$/gm, (full, typePrefix, specifiers, relPath) => {
    const absTarget = resolve(dirname(filePath), relPath);
    const tryPaths = [absTarget, `${absTarget}.ts`, `${absTarget}.tsx`, join(absTarget, 'index.ts'), join(absTarget, 'index.tsx')];

    const resolved = tryPaths.find((candidate) => existsSync(candidate));
    if (!resolved) return full;

    const alias = toAliasSubpath(resolved);
    if (!alias) return full;

    changed = true;
    return `import ${typePrefix ?? ''}${specifiers} from '${alias}';`;
  });

  if (!changed) continue;

  writeFileSync(filePath, content);
  changedFiles += 1;
  console.log(normalize(relative(SRC, filePath)).replace(/\\/g, '/'));
}

console.log(`\nUpdated ${changedFiles} files.`);
