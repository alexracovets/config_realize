import { yieldToMain } from '@configurator/utils';

const waitForPresenterFrames = async (invalidate: () => void, frameCount = 4): Promise<void> => {
  for (let frame = 0; frame < frameCount; frame += 1) {
    invalidate();
    await yieldToMain();
  }
};

export { waitForPresenterFrames };
