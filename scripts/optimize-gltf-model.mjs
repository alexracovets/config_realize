import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodeIO, PropertyType } from '@gltf-transform/core';
import { dedup, prune, textureCompress } from '@gltf-transform/functions';
import sharp from 'sharp';

/**
 * Optimizes a garment glTF model into a single GLB without changing UV coordinates.
 *
 * Safe transforms (UV-preserving):
 *   - dedup   — merge duplicate meshes/materials/textures (accessors/UVs excluded)
 *   - prune   — remove unused nodes (keepAttributes: true keeps TEXCOORD_0 + TEXCOORD_1)
 *   - textureCompress — recompress embedded textures (does not touch mesh UVs)
 *
 * Intentionally skipped (can alter UV seams or geometry):
 *   - weld, simplify, join, flatten, quantize, meshopt
 *
 * Usage:
 *   node scripts/optimize-gltf-model.mjs federer_calcio
 *   node scripts/optimize-gltf-model.mjs baggio_calcio bernardi_calcio cruijff_calcio
 *   node scripts/optimize-gltf-model.mjs --all
 *   node scripts/optimize-gltf-model.mjs federer_calcio --dry-run
 *
 * Env:
 *   TEXTURE_JPEG_QUALITY=85
 *   TEXTURE_PNG_QUALITY=90
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const modelsRoot = join(root, 'public/models');

const JPEG_QUALITY = Number(process.env.TEXTURE_JPEG_QUALITY ?? 85);
const UV_TOLERANCE = 1e-5;

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const flags = new Set(process.argv.slice(2).filter((arg) => arg.startsWith('-')));
const dryRun = flags.has('--dry-run');

const CALCIO_MODELS = ['federer_calcio', 'baggio_calcio', 'bernardi_calcio', 'cruijff_calcio'];

const resolveModelDirs = (inputs) => {
  if (inputs.length === 0) {
    return CALCIO_MODELS.map((id) => join(modelsRoot, id));
  }

  return inputs.map((input) => resolveModelDir(input));
};

const resolveModelDir = (input) => {
  if (!input) {
    throw new Error('Pass a model id (e.g. federer_calcio) or a path to the model folder.');
  }

  const direct = resolve(input);
  if (direct.includes('public/models') || input.includes('/') || input.includes('\\')) {
    return direct;
  }

  return join(modelsRoot, input);
};

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const folderSize = (dir, names) =>
  names.reduce((total, name) => {
    try {
      return total + statSync(join(dir, name)).size;
    } catch {
      return total;
    }
  }, 0);

const collectUvBounds = (document) => {
  const bounds = {};

  for (const mesh of document.getRoot().listMeshes()) {
    const meshLabel = mesh.getName() || 'mesh';

    for (const primitive of mesh.listPrimitives()) {
      for (const semantic of ['TEXCOORD_0', 'TEXCOORD_1']) {
        const accessor = primitive.getAttribute(semantic);
        if (!accessor) continue;

        const array = accessor.getArray();
        if (!array?.length) continue;

        let minU = Infinity;
        let maxU = -Infinity;
        let minV = Infinity;
        let maxV = -Infinity;

        for (let i = 0; i < array.length; i += 2) {
          const u = array[i];
          const v = array[i + 1];
          minU = Math.min(minU, u);
          maxU = Math.max(maxU, u);
          minV = Math.min(minV, v);
          maxV = Math.max(maxV, v);
        }

        const key = `${meshLabel}:${semantic}`;
        bounds[key] = {
          minU,
          maxU,
          minV,
          maxV,
          count: array.length / 2,
        };
      }
    }
  }

  return bounds;
};

const compareUvBounds = (before, after) => {
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const mismatches = [];

  for (const key of [...keys].sort()) {
    const a = before[key];
    const b = after[key];

    if (!a || !b) {
      mismatches.push(`${key}: missing in ${!a ? 'before' : 'after'}`);
      continue;
    }

    if (a.count !== b.count) {
      mismatches.push(`${key}: vertex count ${a.count} → ${b.count}`);
      continue;
    }

    for (const field of ['minU', 'maxU', 'minV', 'maxV']) {
      if (Math.abs(a[field] - b[field]) > UV_TOLERANCE) {
        mismatches.push(`${key}: ${field} ${a[field].toFixed(6)} → ${b[field].toFixed(6)}`);
      }
    }
  }

  return mismatches;
};

const printUvSummary = (bounds, title) => {
  console.log(`\n${title}`);
  for (const [key, value] of Object.entries(bounds).sort()) {
    console.log(
      `  ${key}: U [${value.minU.toFixed(4)}, ${value.maxU.toFixed(4)}], V [${value.minV.toFixed(4)}, ${value.maxV.toFixed(4)}], verts=${value.count}`,
    );
  }
};

const optimizeModel = async (modelDir) => {
  const inputGltf = join(modelDir, 'model.gltf');
  const outputGlb = join(modelDir, 'model.glb');

  const io = new NodeIO();
  const document = await io.read(inputGltf);
  const uvBefore = collectUvBounds(document);

  await document.transform(
    dedup({
      propertyTypes: [PropertyType.MESH, PropertyType.MATERIAL, PropertyType.TEXTURE],
    }),
    prune({ keepAttributes: true }),
    textureCompress({
      encoder: sharp,
      quality: JPEG_QUALITY,
      effort: 6,
      chromaSubsampling: '4:4:4',
    }),
  );

  const uvAfter = collectUvBounds(document);
  const uvMismatches = compareUvBounds(uvBefore, uvAfter);

  printUvSummary(uvBefore, 'UV bounds (before)');
  printUvSummary(uvAfter, 'UV bounds (after)');

  if (uvMismatches.length > 0) {
    console.error('\nUV verification failed:');
    for (const line of uvMismatches) console.error(`  - ${line}`);
    process.exit(1);
  }

  console.log('\nUV verification: OK (bounds unchanged)');

  if (dryRun) {
    console.log('\nDry run — model.glb was not written.');
    return;
  }

  await io.write(outputGlb, document);

  const beforeBytes = folderSize(modelDir, ['model.gltf', 'model.bin']);
  const afterBytes = statSync(outputGlb).size;

  console.log(`\nWrote ${outputGlb}`);
  console.log(`  model.gltf + model.bin ≈ ${formatBytes(beforeBytes)}`);
  console.log(`  model.glb            = ${formatBytes(afterBytes)}`);

  const jsonPath = join(root, 'src/data', basename(modelDir), `${basename(modelDir)}.json`);
  try {
    const json = JSON.parse(readFileSync(jsonPath, 'utf8'));
    delete json.modelFile;

    const ordered = {};
    if (json.id !== undefined) ordered.id = json.id;
    if (json.path !== undefined) ordered.path = json.path;
    ordered.modelFile = 'model.glb';

    for (const [key, value] of Object.entries(json)) {
      if (key === 'id' || key === 'path') continue;
      ordered[key] = value;
    }

    writeFileSync(jsonPath, `${JSON.stringify(ordered, null, 2)}\n`, 'utf8');
    console.log(`\nUpdated ${jsonPath} → "modelFile": "model.glb"`);
  } catch {
    console.log(`\nNote: add "modelFile": "model.glb" to the product JSON manually if needed.`);
  }

  console.log('\nPBR bake maps are read from embedded GLB materials when pbrTextures is omitted in product JSON.');
};

const run = async () => {
  const modelDirs = resolveModelDirs(args);

  for (const modelDir of modelDirs) {
    try {
      statSync(join(modelDir, 'model.gltf'));
    } catch {
      console.error(`model.gltf not found in ${modelDir}`);
      process.exitCode = 1;
      continue;
    }

    mkdirSync(modelDir, { recursive: true });
    console.log(`\n=== ${basename(modelDir)} ===`);
    await optimizeModel(modelDir);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
