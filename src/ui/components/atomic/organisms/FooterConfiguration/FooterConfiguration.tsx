'use client';

import { useCallback } from 'react';
import { AiOutlineBorderOuter } from 'react-icons/ai';

import { Button, Container, Flex, SvgIcon } from '@atoms';

import { ProductCatalogPopover } from '@molecules';
import { useNavigateToCheckout, useRequestAddProduct } from '@hooks';
import { useConfigurationCart, useConfigurationControl, useInfoDialog } from '@store';
import { cn } from '@utils';

const FooterConfiguration = () => {
  const items = useConfigurationCart((state) => state.items);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const isGizmoVisible = useConfigurationControl((state) => state.isGizmoVisible);
  const toggleGizmoVisible = useConfigurationControl((state) => state.toggleGizmoVisible);
  const { requestAddProduct } = useRequestAddProduct();
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

  const handleToggleGizmo = useCallback(() => {
    toggleGizmoVisible();
  }, [toggleGizmoVisible]);

  return (
    <Container>
      <Flex className="gap-2 items-center justify-center w-full pb-12 pt-2">
        <Button size="sm">
          <SvgIcon name="share" />
          Condividi
        </Button>
        <ProductCatalogPopover activeCollectionHandle={activeItem.collectionHandle} onSelect={requestAddProduct} contentSide="top" contentAlign="center">
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
        <Button
          size="sm"
          onClick={handleToggleGizmo}
          aria-pressed={isGizmoVisible}
          aria-label={isGizmoVisible ? 'Nascondi gizmo' : 'Mostra gizmo'}
          className={cn('px-3', !isGizmoVisible && 'opacity-50')}
        >
          <AiOutlineBorderOuter className="size-6 shrink-0" aria-hidden />
        </Button>
      </Flex>
    </Container>
  );
};

export { FooterConfiguration };
