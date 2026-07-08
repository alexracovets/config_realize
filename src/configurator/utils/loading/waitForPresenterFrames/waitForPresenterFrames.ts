import { yieldToMain } from '@configurator/utils';

/** Pump demand renders so GPU uploads finish before the loader hides. */
const waitForPresenterFrames = async (invalidate: () => void, frameCount = 4): Promise<void> => {
  for (let frame = 0; frame < frameCount; frame += 1) {
    invalidate();
    await yieldToMain();
  }
};

export { waitForPresenterFrames };
