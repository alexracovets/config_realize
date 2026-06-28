import type { patternMaskPairType } from '@configurator/types';
import type { Texture } from 'three';
interface productAppearanceTexturesType {
  logosTexture: Texture | null;
  maskTextures: patternMaskPairType;
  masksPatternKey: string | null;
}

export type { productAppearanceTexturesType };
