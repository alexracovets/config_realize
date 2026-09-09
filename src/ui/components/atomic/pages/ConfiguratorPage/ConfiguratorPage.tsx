'use client';

import { ConfiguratorView } from '@organisms';
import { ModalAddProductDesign, ModalInfo, ModalShare, ModalTutorial, ScrollHintTutorial } from '@molecules';

const ConfiguratorPage = () => {
  return (
    <>
      <ConfiguratorView />
      <ModalAddProductDesign />
      <ModalInfo />
      <ModalShare />
      <ModalTutorial />
      <ScrollHintTutorial />
    </>
  );
};

export { ConfiguratorPage };
