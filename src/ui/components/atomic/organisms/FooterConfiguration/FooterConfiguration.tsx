'use client';

import { useCallback } from 'react';
import { AiOutlineBorderOuter } from 'react-icons/ai';

import { Button, Container, Flex, SvgIcon } from '@atoms';

import { ProductCatalogPopover } from '@molecules';
import { useNavigateToCheckout, useRequestAddProduct, useShareConfiguration } from '@hooks';
import { useConfigurationCart, useConfigurationControl, useInfoDialog } from '@store';
import { cn } from '@utils';

const NAME_STEP = 4;
const NUMBER_STEP = 5;
const TESTO_STEP = 6;
const LOGO_STEP = 7;

const isGizmoToggleStep = (step: number) => step === NAME_STEP || step === NUMBER_STEP || step === TESTO_STEP || step === LOGO_STEP;

const FooterConfiguration = () => {
  const items = useConfigurationCart((state) => state.items);
  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const isGizmoVisible = useConfigurationControl((state) => state.isGizmoVisible);
  const toggleGizmoVisible = useConfigurationControl((state) => state.toggleGizmoVisible);
  const activeStep = useConfigurationControl((state) => state.activeStep);
  const showGizmoToggle = isGizmoToggleStep(activeStep);
  const { requestAddProduct } = useRequestAddProduct();
  const duplicateActiveItem = useConfigurationCart((state) => state.duplicateActiveItem);
  const setIsOpen = useInfoDialog((state) => state.setIsOpen);
  const { navigateToCheckout } = useNavigateToCheckout();
  const { shareConfiguration } = useShareConfiguration();

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];

  const handleShare = useCallback(() => {
    void shareConfiguration();
  }, [shareConfiguration]);

  const handleDuplicate = useCallback(() => {
    duplicateActiveItem();
  }, [duplicateActiveItem]);

  const handleInfo = useCallback(() => {
    setIsOpen(true);
  }, [setIsOpen]);

  const handleToggleGizmo = useCallback(() => {
    toggleGizmoVisible();
  }, [toggleGizmoVisible]);

  const smallButtonClass =
    'max-sm:h-8 max-sm:w-full max-sm:gap-0.5 max-sm:rounded-lg max-sm:bg-[#D4D4D8]/80 max-sm:px-1.5 max-sm:text-[12px] max-sm:leading-4 max-sm:font-semibold max-sm:[&_svg]:size-3 max-[375px]:text-[9px]! max-[375px]:h-6!';

  return (
    <Container>
      <Flex variant="footer_desktop_row">
        <Button size="sm" onClick={handleShare}>
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
        {showGizmoToggle ? (
          <Button
            size="sm"
            onClick={handleToggleGizmo}
            aria-pressed={isGizmoVisible}
            aria-label={isGizmoVisible ? 'Nascondi gizmo' : 'Mostra gizmo'}
            className={cn('px-3 max-xl:hidden', !isGizmoVisible && 'opacity-50')}
          >
            <AiOutlineBorderOuter className="size-6 shrink-0" aria-hidden />
          </Button>
        ) : null}
        <Button variant="primary" size="sm" onClick={navigateToCheckout}>
          <SvgIcon name="cart" />
          Completa Config.
        </Button>
      </Flex>

      <Flex variant="footer_mobile_column">
        <Flex variant="footer_mobile_grid">
          <Button size="sm" onClick={handleShare} className={smallButtonClass}>
            <SvgIcon name="share" />
            Condividi
          </Button>
          <ProductCatalogPopover activeCollectionHandle={activeItem.collectionHandle} onSelect={requestAddProduct} contentSide="top" contentAlign="center">
            <Button size="sm" className={smallButtonClass}>
              <SvgIcon name="plus" />
              Prodotto
            </Button>
          </ProductCatalogPopover>
          <Button size="sm" onClick={handleDuplicate} className={smallButtonClass}>
            <SvgIcon name="duplicate" />
            Duplica
          </Button>
          <Button size="sm" onClick={handleInfo} className={smallButtonClass}>
            <SvgIcon name="info" />
            Info Ordine
          </Button>
        </Flex>
        <Button
          variant="primary"
          size="sm"
          onClick={navigateToCheckout}
          className="max-sm:w-full max-sm:h-8 max-sm:text-[14px] max-sm:leading-4.75 max-sm:font-bold max-sm:[&_svg]:size-3.5"
        >
          <SvgIcon name="cart" />
          Completa Config.
        </Button>
      </Flex>
    </Container>
  );
};

export { FooterConfiguration };
