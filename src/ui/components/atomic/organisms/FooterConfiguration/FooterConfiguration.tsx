'use client';

import { useCallback } from 'react';

import { Button, Container, Flex, SvgIcon } from '@atoms';

import { ProductCatalogPopover } from '@molecules';
import { useNavigateToCheckout } from '@hooks';
import { useConfigurationCart, useInfoDialog } from '@store';

const FooterConfiguration = () => {
  const items = useConfigurationCart((state) => state.items);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const addItem = useConfigurationCart((state) => state.addItem);
  const duplicateActiveItem = useConfigurationCart((state) => state.duplicateActiveItem);
  const setIsOpen = useInfoDialog((state) => state.setIsOpen);
  const { navigateToCheckout } = useNavigateToCheckout();

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];

  const handleDuplicate = useCallback(() => {
    duplicateActiveItem();
  }, [duplicateActiveItem]);

  const handleInfo = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  return (
    <Container>
      <Flex className="gap-2 items-center justify-center w-full pb-12 pt-2">
        <Button size="sm">
          <SvgIcon name="share" />
          Condividi
        </Button>
        <ProductCatalogPopover activeCollectionHandle={activeItem.collectionHandle} onSelect={addItem} contentSide="top" contentAlign="center">
          <Button size="sm">
            <SvgIcon name="plus" />
            Prodotto
          </Button>
        </ProductCatalogPopover>
        <Button size="sm" onClick={handleDuplicate}>
          <SvgIcon name="duplicate" />
          Duplica
        </Button>
        <Button size="sm" onClick={handleInfo}>
          <SvgIcon name="info" />
          Info
        </Button>
        <Button variant="primary" size="sm" onClick={navigateToCheckout}>
          <SvgIcon name="cart" />
          Completa Config.
        </Button>
      </Flex>
    </Container>
  );
};

export { FooterConfiguration };
