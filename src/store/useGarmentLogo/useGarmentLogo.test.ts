import { describe, expect, it } from 'vitest';

import type { logoInstanceType } from '@types';

import { LOGO_MAX_USER_FILES, LOGO_SHADER_SLOT_COUNT } from '@configurator/constants';
import { resolveCanAddUserLogo, resolveLogoInstancesForRender } from '@store/useGarmentLogo/useGarmentLogo';

const buildInstance = (id: string, src: string): logoInstanceType =>
  ({
    id,
    positionKey: `logo-user-${id}`,
    src,
    fileName: `${id}.png`,
    naturalWidth: 100,
    naturalHeight: 100,
    uploadRotation: 0,
    opacity: 1,
    label: id,
    partId: 'front',
    uv: { x: 0.5, y: 0.5 },
    rotation: 0,
    scale: 1,
    isDefault: false,
    showFrame: true,
    showGizmo: true,
  }) as logoInstanceType;

describe('resolveCanAddUserLogo', () => {
  it('allows user uploads up to one slot below the shader capacity', () => {
    const users = Array.from({ length: LOGO_MAX_USER_FILES - 1 }, (_, index) => buildInstance(String(index), `blob:${index}`));

    expect(resolveCanAddUserLogo(users)).toBe(true);
    expect(resolveCanAddUserLogo([...users, buildInstance('last', 'blob:last')])).toBe(false);
  });

  it('stops at the shader slot count even if user files remain', () => {
    const defaults = Array.from({ length: LOGO_SHADER_SLOT_COUNT }, (_, index) => ({
      ...buildInstance(`default-${index}`, `blob:default-${index}`),
      isDefault: true,
    }));

    expect(resolveCanAddUserLogo(defaults)).toBe(false);
  });
});

describe('resolveLogoInstancesForRender', () => {
  it('drops instances without a source so slot indexes match the stamp atlas', () => {
    const instances = [buildInstance('a', 'blob:a'), buildInstance('blank', '  '), buildInstance('b', 'blob:b')];

    expect(resolveLogoInstancesForRender(instances, null).map((instance) => instance.id)).toEqual(['a', 'b']);
  });

  it('applies the preview patch to the previewed instance only', () => {
    const instances = [buildInstance('a', 'blob:a'), buildInstance('b', 'blob:b')];
    const rendered = resolveLogoInstancesForRender(instances, { instanceId: 'b', patch: { scale: 2 } });

    expect(rendered.map((instance) => instance.scale)).toEqual([1, 2]);
  });

  it('keeps preview slot indexes aligned when an empty instance precedes it', () => {
    const instances = [buildInstance('blank', ''), buildInstance('a', 'blob:a')];
    const rendered = resolveLogoInstancesForRender(instances, { instanceId: 'a', patch: { scale: 3 } });

    expect(rendered).toHaveLength(1);
    expect(rendered[0].scale).toBe(3);
  });
});
