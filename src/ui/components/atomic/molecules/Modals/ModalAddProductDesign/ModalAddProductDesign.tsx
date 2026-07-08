'use client';

import { useMemo } from 'react';

import { AtomDialog, AtomDialogContent, AtomDialogTitle, AtomImage, Button, Flex, SvgIcon } from '@atoms';
import { ADD_PRODUCT_DESIGN_MODAL_CONFIRM_LABEL, ADD_PRODUCT_DESIGN_MODAL_DECLINE_LABEL, buildAddProductDesignModalTitle } from '@constants';
import { useAddProductDesignDialog, useConfigurationCart } from '@store';
import { getModel, resolveAddProductDesignModalLabel, resolveCartItemDisplayPreview, resolveProductPreviewSrc } from '@utils';

const ModalAddProductDesign = () => {
  const isOpen = useAddProductDesignDialog((state) => state.isOpen);
  const pendingProduct = useAddProductDesignDialog((state) => state.pendingProduct);
  const close = useAddProductDesignDialog((state) => state.close);
  const confirm = useAddProductDesignDialog((state) => state.confirm);

  const activeItemId = useConfigurationCart((state) => state.activeItemId);
  const items = useConfigurationCart((state) => state.items);
  const previews = useConfigurationCart((state) => state.previews);

  const activeItem = items.find((item) => item.id === activeItemId) ?? items[0];
  const pendingGarment = pendingProduct ? getModel(pendingProduct.modelId) : null;

  const sourcePreview = useMemo(() => {
    if (!activeItem) return '';
    return resolveCartItemDisplayPreview(activeItem, previews[activeItem.id]);
  }, [activeItem, previews]);

  const targetPreview = useMemo(() => {
    if (pendingProduct?.catalogPreviewSrc) return pendingProduct.catalogPreviewSrc;
    if (!pendingGarment) return '';
    return resolveProductPreviewSrc(pendingGarment);
  }, [pendingGarment, pendingProduct]);

  const title = useMemo(() => {
    return buildAddProductDesignModalTitle(resolveAddProductDesignModalLabel(pendingProduct, pendingGarment));
  }, [pendingGarment, pendingProduct]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) close();
  };

  return (
    <AtomDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AtomDialogContent aria-describedby={undefined} aria-label={title} className="h-auto max-h-none w-full max-w-[380px] gap-5">
        <AtomDialogTitle className="text-center">{title}</AtomDialogTitle>
        <Flex className="items-center justify-center gap-1 mx-auto">
          <AtomImage src={sourcePreview} alt="prev" className="h-[120px] w-[110px]" />
          <SvgIcon name="arrow_right" className="size-7 shrink-0 text-gray-10" aria-hidden />
          <AtomImage src={targetPreview} alt="new" className="h-[120px] w-[110px]" />
        </Flex>

        <Flex className="flex-col gap-3 w-full">
          <Button
            type="button"
            variant="default"
            size="sm"
            className="bg-default text-white text-[14px] font-normal w-full hover:bg-default/80"
            onClick={() => confirm(true)}
          >
            {ADD_PRODUCT_DESIGN_MODAL_CONFIRM_LABEL}
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            className="bg-white text-gray-50 text-[14px] font-normal w-full border-input-border"
            onClick={() => confirm(false)}
          >
            {ADD_PRODUCT_DESIGN_MODAL_DECLINE_LABEL}
          </Button>
        </Flex>
      </AtomDialogContent>
    </AtomDialog>
  );
};

export { ModalAddProductDesign };
