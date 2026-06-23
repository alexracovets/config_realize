'use client';

import { ConfiguratorView } from '@organisms';
import { ModalInfo, ModalTutorial } from '@molecules';
import { ClientOnly } from '@shared';
import { useConfiguratorInitialSceneLoad } from '@hooks';

const ConfiguratorPage = () => {
  useConfiguratorInitialSceneLoad();

  return (
    <ClientOnly>
      <ConfiguratorView />
      <ModalInfo />
      <ModalTutorial />
    </ClientOnly>
  );
};

export { ConfiguratorPage };
