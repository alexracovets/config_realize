'use client';

import { ConfiguratorView } from '@organisms';
import { ModalInfo, ModalTutorial } from '@molecules';

const ConfiguratorPage = () => {
  return (
    <>
      <ConfiguratorView />
      <ModalInfo />
      <ModalTutorial />
    </>
  );
};

export { ConfiguratorPage };
