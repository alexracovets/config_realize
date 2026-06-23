import type { Texture } from 'three';

import type { patternMaskPairType } from '../garmentPrint';

interface productAppearanceTexturesType {
  logosTexture: Texture | null;
  maskTextures: patternMaskPairType;
  masksPatternKey: string | null;
}

export type { productAppearanceTexturesType };
