'use client';

import { ConfiguratorView } from '@organisms';
import { ModalAddProductDesign, ModalInfo, ModalTutorial } from '@molecules';

const ConfiguratorPage = () => {
  return (
    <>
      <ConfiguratorView />
      <ModalAddProductDesign />
      <ModalInfo />
      <ModalTutorial />
    </>
  );
};

export { ConfiguratorPage };
