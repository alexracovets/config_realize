import type { WebGLRenderer } from 'three';

import type { composePrintAtlasFboInputType } from '@types';

import { PrintAtlasFbo } from './printAtlasFbo';

const composePrintAtlasFbo = async (renderer: WebGLRenderer, fbo: PrintAtlasFbo, input: composePrintAtlasFboInputType) => {
  return fbo.compose(input);
};

export { composePrintAtlasFbo };
