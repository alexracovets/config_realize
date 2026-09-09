import { describe, expect, it } from 'vitest';

import { resolveLogoStampPackOrder, resolveLogoStampSlots } from '@configurator/utils';

describe('resolveLogoStampSlots', () => {
  it('keeps atlas cells stable when draw order changes', () => {
    const packed = [{ id: 'logo-a' }, { id: 'logo-b' }, { id: 'logo-c' }];
    const broughtToFront = [packed[1]!, packed[2]!, packed[0]!];

    expect(resolveLogoStampPackOrder(broughtToFront).map((instance) => instance.id)).toEqual(['logo-a', 'logo-b', 'logo-c']);
    expect(resolveLogoStampSlots(packed)).toEqual([0, 1, 2]);
    expect(resolveLogoStampSlots(broughtToFront)).toEqual([1, 2, 0]);
  });
});
