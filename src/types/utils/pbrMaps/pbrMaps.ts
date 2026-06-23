import type { Texture } from 'three';

import type { garmentPbrTexturesConfigType } from '../../entities/garment/garment';

type pbrTexturePathsType = Record<keyof garmentPbrTexturesConfigType, string>;
type pbrMapsType = Record<keyof garmentPbrTexturesConfigType, Texture>;

export type { pbrMapsType, pbrTexturePathsType };
