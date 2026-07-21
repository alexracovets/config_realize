'use client';

import { SceneFrameSync } from '@configurator/canvas/SceneFrameSync';
// Direct module paths, not the layer barrels — barrel re-exports of these modules create
// import cycles that leave bindings undefined in the production build.
import { GarmentRuntime } from '@configurator/runtime/GarmentRuntime';
import { GarmentModel } from '@configurator/scene/GarmentModel';
import { resolveModelUrl } from '@configurator/utils';
import { Center } from '@react-three/drei';
import { useConfiguratorProduct } from '@store';

const SceneModelContent = () => {
  const product = useConfiguratorProduct((state) => state.product);
  const modelUrl = resolveModelUrl(product);

  return (
    <>
      <SceneFrameSync />
      <Center key={modelUrl}>
        <GarmentModel>
          <GarmentRuntime />
        </GarmentModel>
      </Center>
    </>
  );
};

const SceneModel = () => {
  return <SceneModelContent />;
};

export { SceneModel };
