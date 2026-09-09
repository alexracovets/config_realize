import { describe, expect, it } from 'vitest';

import type { cartItemConfigurationType, garmentConfigType } from '@types';
import { buildOrderCuttingExportSteps } from '@utils/buildOrderCuttingExportSteps';

const model = {
  path: '/models/test_shirt/',
  modelFile: 'model.glb',
  printAtlas: { width: 2048, height: 800 },
  parts: [
    {
      id: 'front',
      name: 'front',
      label: 'Davanti',
      meshNames: ['front_mesh'],
      uvBounds: { minX: 0, minY: 0, maxX: 1, maxY: 1 },
    },
  ],
  patterns: [
    {
      name: 'Design 1',
      parts: [{ path_name: 'design_1.webp' }],
    },
  ],
  default_pattern: [{ parts: [{ path_name: 'logos.webp' }] }],
} as garmentConfigType;

const configuration = {
  color: {
    byPart: { front: '#03094D' },
    gradientsByPart: {},
  },
  design: {
    activePatternKey: 'pattern-0',
    patternColors: {},
    designLayerColors: { 0: '#D0021B' },
    activeOpacity: 1,
    designOpacity: 1,
  },
  name: {
    instances: [
      {
        id: 'name-1',
        positionKey: 'name-0',
        label: 'Nome dorsale',
        partId: 'front',
        text: 'ROSSI',
        font: 'Russo One',
        textColor: '#FFFFFF',
        strokeColor: '#000000',
        strokeWidth: 0,
        uv: { x: 0.5, y: 0.4 },
        rotation: 0,
        fontSize: 120,
        showFrame: false,
        showGizmo: false,
      },
    ],
    selectedInstanceId: 'name-1',
  },
  number: { instances: [], selectedInstanceId: null },
  testo: { instances: [], selectedInstanceId: null },
  logo: { instances: [], selectedInstanceId: null },
} as unknown as cartItemConfigurationType;

describe('buildOrderCuttingExportSteps', () => {
  it('prepends a Complex UV step before Colore', () => {
    const steps = buildOrderCuttingExportSteps(configuration, model);
    const complexStep = steps[0];
    const colorStep = steps.find((step) => step.key === 'colore');

    expect(complexStep?.key).toBe('complex');
    expect(complexStep?.step).toBe(0);
    expect(complexStep?.title).toBe('Complex');
    expect(complexStep?.isConfigured).toBe(true);
    expect(complexStep?.downloadFiles).toEqual([
      expect.objectContaining({
        key: 'complex-atlas',
        label: 'UV Complex',
        fileName: 'complex_uv_atlas.png',
        composeKind: 'complex-atlas',
        defaultLogosSrc: '/models/test_shirt/designs/logos.webp',
      }),
    ]);
    expect(complexStep?.downloadFiles[0]?.layers).toEqual([expect.objectContaining({ maskSrc: '/models/test_shirt/designs/design_1.webp', color: '#D0021B' })]);
    expect(complexStep?.downloadFiles[0]?.textLayers?.some((layer) => layer.text === 'ROSSI')).toBe(true);
    expect(colorStep?.step).toBe(1);
    expect(steps.findIndex((step) => step.key === 'colore')).toBeGreaterThan(0);
  });
});
