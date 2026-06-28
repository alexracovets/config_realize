import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, normalize, relative, resolve } from 'node:path';

const SRC = resolve('src');
const ROOT = resolve('.');

const ALIAS_BY_PREFIX = [
  ['configurator/utils', '@configurator/utils'],
  ['configurator/scene', '@configurator/scene'],
  ['configurator/hooks', '@configurator/hooks'],
  ['configurator/canvas', '@configurator/canvas'],
  ['configurator/runtime', '@configurator/runtime'],
  ['configurator/gizmo', '@configurator/gizmo'],
  ['configurator/mappers', '@configurator/mappers'],
  ['configurator/shaders', '@configurator/shaders'],
  ['configurator/types', '@configurator/types'],
  ['configurator/constants', '@configurator/constants'],
  ['configurator/providers', '@configurator/providers'],
  ['configurator/bootstrap', '@configurator/bootstrap'],
  ['configurator', '@configurator'],
  ['store', '@store'],
  ['utils', '@utils'],
  ['hooks', '@hooks'],
  ['types', '@types'],
  ['constants', '@constants'],
  ['data', '@data'],
  ['providers', '@providers'],
  ['shopify', '@shopify'],
  ['ui/components/atomic/atoms', '@atoms'],
  ['ui/components/atomic/molecules', '@molecules'],
  ['ui/components/atomic/organisms', '@organisms'],
  ['ui/components/atomic/templates', '@templates'],
  ['ui/components/atomic/pages', '@pages'],
  ['ui/components/shared', '@shared'],
  ['ui/components/skeletons', '@skeletons'],
];

const aliasForFile = (filePath) => {
  const relDir = normalize(relative(SRC, dirname(filePath))).replace(/\\/g, '/');
  for (const [prefix, alias] of ALIAS_BY_PREFIX) {
    if (relDir === prefix || relDir.startsWith(`${prefix}/`)) return alias;
  }
  return null;
};

const toPosix = (p) => normalize(p).replace(/\\/g, '/');

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

const parseNamedImports = (content) => {
  const imports = [];
  const re = /^import\s+(type\s+)?(.+?)\s+from\s+['"]([^'"]+)['"];?\s*$/gm;
  for (const match of content.matchAll(re)) {
    const isType = Boolean(match[1]);
    const source = match[3];
    const specBlock = match[2].trim();
    if (!specBlock.startsWith('{')) continue;
    const symbols = specBlock
      .slice(1, -1)
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    for (const symbol of symbols) imports.push({ isType, symbol, source, full: match[0] });
  }
  return imports;
};

const groupBySource = (entries) => {
  const map = new Map();
  for (const entry of entries) {
    const key = `${entry.isType ? 'type:' : 'value:'}${entry.source}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(entry.symbol);
  }
  return map;
};

const formatImport = (isType, symbols, source) => `import ${isType ? 'type ' : ''}{ ${symbols.join(', ')} } from '${source}';`;

let changedFiles = 0;

for (const filePath of walk(SRC)) {
  const fileAlias = aliasForFile(filePath);
  if (!fileAlias) continue;

  let headContent;
  try {
    headContent = execSync(`git show HEAD:${toPosix(relative(ROOT, filePath))}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
  } catch {
    continue;
  }

  const headImports = parseNamedImports(headContent).filter((item) => item.source.startsWith('.'));
  if (headImports.length === 0) continue;

  const symbolToRelative = new Map(headImports.map((item) => [item.symbol, { source: item.source, isType: item.isType }]));

  let content = readFileSync(filePath, 'utf8');
  const currentImports = parseNamedImports(content).filter((item) => item.source === fileAlias);
  if (currentImports.length === 0) continue;

  const replacements = new Map();
  for (const item of currentImports) {
    replacements.set(item.full, item);
  }

  const restored = [];
  for (const item of currentImports) {
    const mapped = symbolToRelative.get(item.symbol);
    if (!mapped) continue;
    restored.push({ isType: mapped.isType, symbol: item.symbol, source: mapped.source });
  }

  if (restored.length === 0) continue;

  const grouped = groupBySource(restored);
  const newImportLines = [...grouped.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, symbols]) => {
      const isType = key.startsWith('type:');
      const source = key.slice(isType ? 5 : 6);
      return formatImport(isType, symbols.sort(), source);
    });

  const oldLines = new Set([...replacements.keys()]);
  let next = content;
  for (const oldLine of oldLines) {
    next = next.replace(`${oldLine}\n`, '');
    next = next.replace(oldLine, '');
  }

  const useClient = next.match(/^['"]use client['"];?\s*\n/)?.[0] ?? '';
  const body = next.slice(useClient.length).replace(/^\s*\n+/, '');
  content = useClient + newImportLines.join('\n') + '\n' + body;

  writeFileSync(filePath, content);
  changedFiles += 1;
  console.log(toPosix(relative(ROOT, filePath)));
}

console.log(`\nSplit intra-module imports in ${changedFiles} files.`);
