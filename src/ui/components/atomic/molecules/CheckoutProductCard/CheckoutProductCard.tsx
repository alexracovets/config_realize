'use client';

import { ChevronDown } from 'lucide-react';

import type { checkoutProductCardPropsType } from '@types';
import { AtomImage, Box, Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import { CHECKOUT_DISCOUNT_INFO_LABEL, CHECKOUT_SHIPPING_DAYS_LABEL } from '@constants';
import { useNavigateToConfigurator } from '@hooks';
import { CheckoutConfigurationTable } from '@molecules/CheckoutConfigurationTable';
import { resolveCheckoutPrintAvailability, useCheckout, useConfigurationCart } from '@store';
import { cn, getModel, priceFormat, resolveCartItemDisplayPreview } from '@utils';
import { useMemo, useState } from 'react';
const CheckoutProductCard = ({ product }: checkoutProductCardPropsType) => {
  const { navigateToConfigurator } = useNavigateToConfigurator();
  const [isOpen, setIsOpen] = useState(true);
  const quantity = useCheckout((state) => state.getProductQuantity(product.cartItemId));
  const subtotal = useCheckout((state) => state.getProductSubtotal(product.cartItemId));

  const garment = getModel(product.modelId);
  const cartItem = useConfigurationCart((state) => state.items.find((item) => item.id === product.cartItemId));
  const capturedPreview = useConfigurationCart((state) => state.previews[product.cartItemId]);
  const previewSrc = cartItem ? resolveCartItemDisplayPreview(cartItem, capturedPreview) : '';

  const productName = useMemo(() => product.business.name || 'Prodotto', [product.business.name]);
  const printAvailability = useMemo(() => resolveCheckoutPrintAvailability(garment), [garment]);

  if (!garment) return null;

  const stopToggle = (event: React.MouseEvent) => event.stopPropagation();

  return (
    <article
      className="w-full min-w-0 p-5 border border-primary-10 rounded-xl max-sm:p-0 max-sm:rounded-0 max-sm:border-0 max-sm:relative max-sm:cursor-pointer"
      onClick={() => setIsOpen((prev) => !prev)}
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          setIsOpen((prev) => !prev);
        }
      }}
    >
      <Grid className="grid-cols-[auto_1fr_auto] items-start gap-5 max-sm:grid-cols-[auto_1fr] max-sm:gap-3">
        <AtomImage src={previewSrc} alt={productName} className="h-25.25 w-31.5 max-sm:h-16 max-sm:w-20" />
        <Flex className="flex-col items-start justify-start gap-3 max-sm:w-full max-sm:gap-2">
          <Text variant="product_name" className="mb-0">
            {productName}
          </Text>
          <Text variant="product_price" className="hidden max-sm:block">
            {priceFormat(subtotal)}
            <span className="text-[12px] font-normal text-gray"> prezzo totale</span>
          </Text>
          <div className="flex flex-wrap items-center gap-2" onClick={stopToggle}>
            <Button variant="primary" size="xs" className="max-sm:text-[11px] max-sm:px-2 max-sm:py-1">
              Elenco giocatori
            </Button>
            <Button
              size="xs"
              className="font-normal max-sm:text-[11px] max-sm:px-2 max-sm:py-1"
              onClick={() => cartItem && navigateToConfigurator(cartItem.collectionHandle, cartItem.slug)}
              disabled={!cartItem?.collectionHandle}
            >
              Modifica Bozza
            </Button>
          </div>
          <Flex className="gap-3 max-sm:w-full max-sm:justify-between">
            <Flex className="gap-3">
              <Text variant="small_secondary" className="max-sm:text-[14px]">
                Quantità
              </Text>
              <Box className="px-4 py-1.5 rounded-lg border border-primary-10 max-sm:px-3 max-sm:py-1 max-sm:border-[#4B5563]">
                <Text variant="small_secondary" className="text-default max-sm:text-[14px]">
                  {quantity} pz
                </Text>
              </Box>
            </Flex>
            <ChevronDown
              className={cn('hidden max-sm:block size-4.5 shrink-0 text-[#4B5563] transition-transform', isOpen && 'rotate-180')}
              aria-hidden
            />
          </Flex>
        </Flex>
        <Flex className="flex-col items-end gap-3 max-sm:hidden">
          <Flex className="gap-3">
            <Text variant="product_price">{priceFormat(subtotal)}</Text>
            <Text variant="small">prezzo totale</Text>
            <SvgIcon name="three_dots" className="size-7 text-gray" />
          </Flex>
          <Flex className="flex-col gap-2 max-w-[250px]">
            <Text variant="small">{CHECKOUT_DISCOUNT_INFO_LABEL}</Text>
            <Text variant="small">{CHECKOUT_SHIPPING_DAYS_LABEL}</Text>
          </Flex>
        </Flex>
      </Grid>

      <div className={cn('pt-6 max-sm:pt-4', isOpen ? 'max-sm:block' : 'max-sm:hidden')} onClick={stopToggle}>
        <CheckoutConfigurationTable cartItemId={product.cartItemId} rows={product.rows} printAvailability={printAvailability} />
      </div>
    </article>
  );
};

export { CheckoutProductCard };
