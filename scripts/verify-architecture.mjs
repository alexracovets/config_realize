import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { exit } from 'node:process';
import { scanModuleStructure } from './lib/scan-module-structure.mjs';

const forbiddenPaths = [
  'src/gizmo',
  'src/shaders',
  'src/features',
  'src/configurator/hooks/useGarmentAppearance',
  'src/configurator/scene/ensureGarmentGltfParsed',
  'src/configurator/scene/useProgressiveSceneReveal',
  'src/configurator/utils/configuratorPreviewCapture',
  'src/configurator/utils/loadCachedImage',
  'src/configurator/utils/loadImage',
  'src/configurator/utils/garmentPrint',
  'src/configurator/utils/createGarmentMaterial',
  'src/configurator/utils/composeLogoAtlas',
  'src/configurator/utils/orbitCamera',
  'src/configurator/utils/orbitFlag',
  'src/configurator/hooks/useGarmentNameTextures',
  'src/hooks/useGarmentLogoTextures',
  'src/hooks/useGarmentNameTextures',
  'src/hooks/useGizmoSelection',
  'src/hooks/usePrintGizmoDrag',
  'src/hooks/useConfiguratorProductHydration',
  'src/utils/resolveProductStepsConfiguration',
  'src/utils/resolveDesignCardPreviewSrc',
  'src/utils/resolveDesignThumbSrc',
  'src/utils/garmentPrint',
  'src/utils/composeLogoAtlas',
  'src/utils/createGarmentMaterial',
  'src/providers/garmentMaterialRegistry',
  'src/providers/pbrMapsProvider',
  'src/types/providers',
  'src/ui/components/atomic/organisms/Configurator/GarmentModel',
  'src/ui/components/atomic/organisms/Configurator/PrintGizmoLayer',
  'src/ui/components/atomic/organisms/ConfiguratorSlugHydration',
];

const CONFIGURATOR_3D_CONSTANTS = [
  'FULL_UV_BOUNDS',
  'PRINT_ATLAS_WIDTH',
  'PRINT_ATLAS_HEIGHT',
  'NAME_SLOT_COUNT',
  'LOGO_SLOT_COUNT',
  'FONT_FAMILY_BY_NAME',
  'PATTERN_LAYER_COUNT',
];

const walkSourceFiles = (dir, files = []) => {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    if (!statSync(fullPath).isDirectory()) {
      if (/\.(ts|tsx|mts)$/.test(entry)) files.push(fullPath);
      continue;
    }
    if (entry === 'node_modules' || entry === '.next') continue;
    walkSourceFiles(fullPath, files);
  }
  return files;
};

const normalizePath = (filePath) => filePath.replace(/\\/g, '/');

const importRules = [
  {
    id: 'store-configurator-subpaths',
    test: (filePath) => normalizePath(filePath).includes('src/store/'),
    patterns: [/from ['"]@configurator\/(utils|scene|runtime|canvas|hooks|gizmo|shaders|providers)(?:\/|['"])/],
    message: '@store must use @configurator bootstrap facade, @configurator/mappers, or @configurator/constants — not layer subpaths.',
  },
  {
    id: 'atoms-store-configurator',
    test: (filePath) => normalizePath(filePath).includes('src/ui/components/atomic/atoms/'),
    patterns: [/from ['"]@store['"]/, /from ['"]@configurator(?:\/|['"])/],
    message: 'Atoms must stay presentational — no @store or @configurator imports.',
  },
  {
    id: 'step-resolver-molecules',
    test: (filePath) => normalizePath(filePath).includes('src/hooks/resolveProductStepsConfiguration/'),
    patterns: [/from ['"]@molecules['"]/],
    message: 'Step availability resolver must not import @molecules (merge in useProductStepsConfiguration instead).',
  },
  {
    id: 'configurator-no-utils',
    test: (filePath) => normalizePath(filePath).includes('src/configurator/'),
    patterns: [/from ['"]@utils(?:\/|['"])/],
    message: '@configurator must not import @utils.',
  },
  {
    id: 'mappers-no-configurator-utils',
    test: (filePath) => normalizePath(filePath).includes('src/configurator/mappers/'),
    patterns: [/from ['"]@configurator\/utils(?:\/|['"])/],
    message: '@configurator/mappers must not import @configurator/utils — use mappers/printLayout for UV math.',
  },
  {
    id: 'molecules-configurator-types-only',
    test: (filePath) => normalizePath(filePath).includes('src/ui/components/atomic/molecules/'),
    patterns: [/from ['"]@configurator(?!\/types)(?:\/|['"])/],
    message: 'Molecules may only import @configurator/types, not the configurator runtime.',
  },
  {
    id: 'configurator-use-utils-alias',
    test: (filePath) => normalizePath(filePath).includes('src/configurator/') && !normalizePath(filePath).includes('src/configurator/utils/'),
    patterns: [/from ['"](?:\.\.\/)+utils\//],
    message: 'Inside @configurator import utils via @configurator/utils — not relative ../utils/... paths.',
  },
  {
    id: 'configurator-no-utils-subpaths',
    test: (filePath) => normalizePath(filePath).includes('src/configurator/'),
    patterns: [/from ['"]@configurator\/utils\/(loading|print|material|render)(?:\/|['"])/],
    message: 'Use @configurator/utils barrel — not @configurator/utils/loading|print|material|render subpaths.',
  },
  {
    id: 'hooks-no-scene',
    test: (filePath) => normalizePath(filePath).includes('src/configurator/hooks/'),
    patterns: [/from ['"]@configurator\/scene(?:\/|['"])/],
    message: 'hooks/ must not import @configurator/scene — use providers bridge instead.',
  },
  {
    id: 'no-parent-relative-imports',
    test: (filePath) => {
      const normalized = normalizePath(filePath);
      if (!normalized.endsWith('.ts') && !normalized.endsWith('.tsx')) return false;
      if (normalized.endsWith('/index.ts') || normalized.endsWith('/index.tsx')) return false;
      return normalized.includes('src/');
    },
    patterns: [/^\s*import\s+.*from\s+['"]\.\.\//m, /^\s*import\s+.*from\s+['"]\.\//m],
    message: 'Use @ path aliases for imports — not relative ./ or ../ (index.ts barrel re-exports are exempt).',
  },
];

const pathViolations = forbiddenPaths.filter((path) => existsSync(path));

const importViolations = [];
const constantViolations = [];

for (const filePath of walkSourceFiles('src')) {
  const normalized = normalizePath(filePath);
  const content = readFileSync(filePath, 'utf8');

  for (const rule of importRules) {
    if (!rule.test(filePath)) continue;
    for (const pattern of rule.patterns) {
      if (pattern.test(content)) {
        importViolations.push({ filePath: normalized, rule: rule.id, message: rule.message });
        break;
      }
    }
  }

  if (normalized.includes('src/configurator/')) continue;
  if (!content.includes('@constants')) continue;

  const usesMovedConstant = CONFIGURATOR_3D_CONSTANTS.some((symbol) => content.includes(symbol));
  if (usesMovedConstant) {
    constantViolations.push({
      filePath: normalized,
      message: '3D pipeline constants belong in @configurator/constants, not @constants.',
    });
  }
}

const moduleStructureViolations = scanModuleStructure('src');

const hasViolations = pathViolations.length > 0 || importViolations.length > 0 || constantViolations.length > 0 || moduleStructureViolations.length > 0;

if (hasViolations) {
  console.error('Architecture guard failed.\n');

  if (pathViolations.length > 0) {
    console.error('Forbidden legacy paths:');
    pathViolations.forEach((path) => console.error(`  - ${path}`));
    console.error('');
  }

  if (moduleStructureViolations.length > 0) {
    console.error('Module folder structure violations:');
    moduleStructureViolations.forEach(({ type, path: filePath }) => console.error(`  - [${type}] ${filePath.replace(/\\/g, '/')}`));
    console.error('  Expected: ModuleName/ModuleName.ts(x) + index.ts (see ARCHITECTURE.md § Module folder pattern).\n');
  }

  if (importViolations.length > 0) {
    console.error('Import boundary violations:');
    importViolations.forEach(({ filePath, message }) => console.error(`  - ${filePath}\n    ${message}`));
    console.error('');
  }

  if (constantViolations.length > 0) {
    console.error('3D constants imported outside configurator:');
    constantViolations.forEach(({ filePath, message }) => console.error(`  - ${filePath}\n    ${message}`));
  }

  exit(1);
}

console.log('Architecture guard passed.');
