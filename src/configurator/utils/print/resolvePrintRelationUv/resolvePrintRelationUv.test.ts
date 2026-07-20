import { describe, expect, it } from 'vitest';

import { resolvePrintRelationUv } from '@configurator/utils';

describe('resolvePrintRelationUv', () => {
  const atlasSize = { width: 1000, height: 1000 };

  it('places follower above leader for top-center with 90° content rotation', () => {
    const uv = resolvePrintRelationUv({
      leaderUv: { x: 0.5, y: 0.5 },
      leaderHalf: { x: 100, y: 20 },
      leaderScale: 1,
      followerHalf: { x: 40, y: 10 },
      followerScale: 1,
      relation: { x: 'center', y: 'top' },
      contentRotationDeg: 90,
      partRotationDeg: 0,
      atlasSize,
    });

    // content (0, +30) → rotate 90° → (+30, 0) in print local → +UV.x
    expect(uv.x).toBeCloseTo(0.53, 5);
    expect(uv.y).toBeCloseTo(0.5, 5);
  });

  it('places follower below leader for bottom-center with 90° content rotation', () => {
    const uv = resolvePrintRelationUv({
      leaderUv: { x: 0.5, y: 0.5 },
      leaderHalf: { x: 100, y: 20 },
      leaderScale: 1,
      followerHalf: { x: 40, y: 10 },
      followerScale: 1,
      relation: { x: 'center', y: 'bottom' },
      contentRotationDeg: 90,
      partRotationDeg: 0,
      atlasSize,
    });

    expect(uv.x).toBeCloseTo(0.47, 5);
    expect(uv.y).toBeCloseTo(0.5, 5);
  });
});
