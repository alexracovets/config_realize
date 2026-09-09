import { describe, expect, it } from 'vitest';

import type { cartItemConfigurationType, garmentBusinessType, modelIdType } from '@types';

import { buildShareConfigExport, parseShareConfigExport, SHARE_CONFIG_EXPORT_VERSION } from '@utils/buildShareConfigExport';

const business = { handle: 'federer-calcio' } as garmentBusinessType;

const configuration = {
  color: { byPart: { front: '#ff0000' }, gradientsByPart: {} },
  design: { activePatternKey: null, patternColors: {}, designLayerColors: {}, activeOpacity: 1, designOpacity: 1 },
  name: { instances: [], selectedInstanceId: null },
  number: { instances: [], selectedInstanceId: null },
  testo: { instances: [], selectedInstanceId: null },
  logo: { instances: [], selectedInstanceId: null },
} as unknown as cartItemConfigurationType;

const buildValidExport = () =>
  buildShareConfigExport({
    collectionHandle: 'calcio',
    slug: 'federer-calcio',
    modelId: 'federer_calcio' as modelIdType,
    business,
    configuration,
  });

describe('buildShareConfigExport', () => {
  it('stamps the share kind and current schema version', () => {
    const shareExport = buildValidExport();

    expect(shareExport.kind).toBe('share');
    expect(shareExport.version).toBe(SHARE_CONFIG_EXPORT_VERSION);
    expect(shareExport.configuration).toEqual(configuration);
  });

  it('survives a JSON round-trip through the parser', () => {
    const parsed = parseShareConfigExport(JSON.parse(JSON.stringify(buildValidExport())));

    expect(parsed).not.toBeNull();
    expect(parsed?.slug).toBe('federer-calcio');
    expect(parsed?.configuration.color.byPart.front).toBe('#ff0000');
  });
});

describe('parseShareConfigExport', () => {
  it('rejects payloads that are not share exports', () => {
    expect(parseShareConfigExport(null)).toBeNull();
    expect(parseShareConfigExport('nope')).toBeNull();
    expect(parseShareConfigExport({ ...buildValidExport(), kind: 'order' })).toBeNull();
  });

  it('rejects unsupported schema versions', () => {
    expect(parseShareConfigExport({ ...buildValidExport(), version: SHARE_CONFIG_EXPORT_VERSION + 1 })).toBeNull();
  });

  it('rejects payloads missing required product fields', () => {
    const withoutSlug: Record<string, unknown> = { ...buildValidExport() };
    delete withoutSlug.slug;
    expect(parseShareConfigExport(withoutSlug)).toBeNull();

    expect(parseShareConfigExport({ ...buildValidExport(), configuration: 'broken' })).toBeNull();
  });
});
