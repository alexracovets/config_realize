import { describe, expect, it } from 'vitest';

import { extractUniqueTestoTexts } from '@store/useCheckout/extractUniqueTestoTexts';

describe('extractUniqueTestoTexts', () => {
  it('skips empty and whitespace-only testo instances', () => {
    const texts = extractUniqueTestoTexts({
      testo: {
        instances: [
          { id: '1', text: 'TEAM', positionKey: 'front', partId: 'part', uv: { x: 0.5, y: 0.5 } },
          { id: '2', text: '   ', positionKey: 'back', partId: 'part', uv: { x: 0.5, y: 0.5 } },
          { id: '3', text: '', positionKey: 'sleeve', partId: 'part', uv: { x: 0.5, y: 0.5 } },
        ],
      },
    } as never);

    expect(texts).toEqual(['TEAM']);
  });

  it('deduplicates non-empty texts after trimming', () => {
    const texts = extractUniqueTestoTexts({
      testo: {
        instances: [
          { id: '1', text: ' TEAM ', positionKey: 'front', partId: 'part', uv: { x: 0.5, y: 0.5 } },
          { id: '2', text: 'TEAM', positionKey: 'back', partId: 'part', uv: { x: 0.5, y: 0.5 } },
        ],
      },
    } as never);

    expect(texts).toEqual(['TEAM']);
  });
});
