import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, EXTTextureWebP, KHRMeshQuantization } from '@gltf-transform/extensions';

/**
 * Compares garment part uvBounds in product JSON with TEXCOORD_0/1 on each mesh node.
 *
 * The configurator samples designs with vPrintUv = TEXCOORD_0 (Three.js `uv`).
 * uvBounds in JSON must match TEXCOORD_0 bounds on model_front / model_back / sleeves.
 *
 * Usage:
 *   node scripts/validate-model-uv.mjs federer_calcio
 *   node scripts/validate-model-uv.mjs --all
 */

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const modelsRoot = join(root, 'public/models');
const dataRoot = join(root, 'src/data');
const TOLERANCE = 0.01;

const CALCIO_MODELS = ['federer_calcio', 'baggio_calcio', 'bernardi_calcio', 'cruijff_calcio'];

const args = process.argv.slice(2).filter((arg) => !arg.startsWith('-'));
const all = process.argv.includes('--all');
const modelIds = all ? CALCIO_MODELS : args.length > 0 ? args : CALCIO_MODELS;

const io = new NodeIO().registerExtensions([EXTTextureWebP, EXTMeshoptCompression, KHRMeshQuantization]);

const boundsFromArray = (array) => {
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;

  for (let index = 0; index < array.length; index += 2) {
    minU = Math.min(minU, array[index]);
    maxU = Math.max(maxU, array[index]);
    minV = Math.min(minV, array[index + 1]);
    maxV = Math.max(maxV, array[index + 1]);
  }

  return { minU, maxU, minV, maxV };
};

const delta = (measured, expected) =>
  Math.max(
    Math.abs(measured.minU - expected.minX),
    Math.abs(measured.maxU - expected.maxX),
    Math.abs(measured.minV - expected.minY),
    Math.abs(measured.maxV - expected.maxY),
  );

const readMeshUvBounds = (document, meshIndex, semantic) => {
  const mesh = document.getRoot().listMeshes()[meshIndex];
  if (!mesh) return null;

  const accessor = mesh.listPrimitives()[0]?.getAttribute(semantic);
  const array = accessor?.getArray();
  if (!array?.length) return null;

  return boundsFromArray(array);
};

const validateModel = async (modelId) => {
  const modelDir = join(modelsRoot, modelId);
  const glbPath = join(modelDir, 'model.glb');
  const jsonPath = join(dataRoot, modelId, `${modelId}.json`);

  statSync(glbPath);
  const product = JSON.parse(readFileSync(jsonPath, 'utf8'));
  const document = await io.read(glbPath);

  const nodeMeshIndex = (nodeName) => {
    const node = document
      .getRoot()
      .listNodes()
      .find((entry) => entry.getName() === nodeName);
    if (!node) return null;
    return document.getRoot().listMeshes().indexOf(node.getMesh());
  };

  console.log(`\n=== ${modelId} ===`);

  let failures = 0;

  for (const part of product.parts) {
    if (!part.uvBounds || !part.meshNames?.length) continue;

    const nodeName = part.meshNames[0];
    const meshIndex = nodeMeshIndex(nodeName);
    if (meshIndex < 0) {
      failures += 1;
      console.log(`  FAIL ${part.name}: node "${nodeName}" not found in GLB`);
      continue;
    }

    const tex0 = readMeshUvBounds(document, meshIndex, 'TEXCOORD_0');
    const tex1 = readMeshUvBounds(document, meshIndex, 'TEXCOORD_1');
    const hasTex1 = tex1 !== null;

    if (!tex0) {
      failures += 1;
      console.log(`  FAIL ${part.name} (${nodeName}): TEXCOORD_0 missing`);
      continue;
    }

    const tex0Delta = delta(tex0, part.uvBounds);
    const tex1Delta = hasTex1 ? delta(tex1, part.uvBounds) : null;

    const ok = tex0Delta <= TOLERANCE;
    if (!ok) failures += 1;

    console.log(
      `  ${ok ? 'OK  ' : 'FAIL'} ${part.name} (${nodeName})` +
        `  TEXCOORD_1=${hasTex1 ? 'yes' : 'NO'}` +
        `  TEX0 Δ=${tex0Delta.toFixed(4)}` +
        (tex1Delta !== null ? `  TEX1 Δ=${tex1Delta.toFixed(4)}` : ''),
    );

    if (!ok) {
      console.log(`         JSON  minX=${part.uvBounds.minX} maxX=${part.uvBounds.maxX} minY=${part.uvBounds.minY} maxY=${part.uvBounds.maxY}`);
      console.log(`         TEX0  minU=${tex0.minU.toFixed(4)} maxU=${tex0.maxU.toFixed(4)} minV=${tex0.minV.toFixed(4)} maxV=${tex0.maxV.toFixed(4)}`);
    }
  }

  if (failures > 0) {
    console.log(`\n  ${failures} part(s) out of sync. Designs will look wrong until GLB TEXCOORD_0 matches JSON uvBounds.`);
    console.log('  Re-export model.gltf + model.bin from Blender, then: pnpm optimize:model ' + modelId);
    console.log('  Do NOT use `@gltf-transform/cli optimize` defaults — they drop TEXCOORD_1 and can break UVs.');
  }

  return failures;
};

let totalFailures = 0;

for (const modelId of modelIds.map((input) => (input.includes('_calcio') ? input : resolve(modelsRoot, input)).split(/[/\\]/).pop())) {
  try {
    totalFailures += await validateModel(modelId);
  } catch (error) {
    console.error(`\n=== ${basename(modelId)} ===`);
    console.error(`  ERROR: ${error.message}`);
    totalFailures += 1;
  }
}

if (totalFailures > 0) {
  process.exitCode = 1;
}
