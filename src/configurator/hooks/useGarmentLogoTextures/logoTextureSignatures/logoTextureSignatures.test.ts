import { describe, expect, it } from 'vitest';

import { buildLogoStampSignature, buildLogoStyleSignature } from '@configurator/hooks/useGarmentLogoTextures/logoTextureSignatures';

const createInstance = (id: string, scale = 1) =>
  ({
    id,
    src: `blob:${id}`,
    opacity: 1,
    naturalWidth: 100,
    naturalHeight: 80,
    scale,
    uv: { x: 0.4, y: 0.5 },
    rotation: 0,
    uploadRotation: 90,
    partId: 'front',
    showFrame: true,
    showGizmo: true,
  }) as Parameters<typeof buildLogoStampSignature>[0][number];

describe('logoTextureSignatures', () => {
  it('keeps the stamp signature stable across draw-order and scale changes', () => {
    const first = [createInstance('a', 1), createInstance('b', 1)];
    const reordered = [createInstance('b', 2), createInstance('a', 3)];

    expect(buildLogoStampSignature(reordered)).toBe(buildLogoStampSignature(first));
  });

  it('changes the style signature when draw order changes', () => {
    const first = [createInstance('a'), createInstance('b')];
    const reordered = [createInstance('b'), createInstance('a')];

    expect(buildLogoStyleSignature(reordered)).not.toBe(buildLogoStyleSignature(first));
  });
});
