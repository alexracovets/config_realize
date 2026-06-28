'use client';

import { SceneFrameSync } from '@configurator/canvas/SceneFrameSync';
import { Center } from '@react-three/drei';
import { GarmentModel } from '@configurator/scene';
import { GarmentRuntime } from '@configurator/runtime';

const SceneModelContent = () => (
  <>
    <SceneFrameSync />
    <Center>
      <GarmentModel>
        <GarmentRuntime />
      </GarmentModel>
    </Center>
  </>
);

const SceneModel = () => {
  return <SceneModelContent />;
};

export { SceneModel };
