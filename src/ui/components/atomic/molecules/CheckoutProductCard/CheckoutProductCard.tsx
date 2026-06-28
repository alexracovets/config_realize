'use client';

import type { checkoutProductCardPropsType } from '@types';
import { AtomImage, Box, Button, Flex, Grid, SvgIcon, Text } from '@atoms';
import { CHECKOUT_SHIPPING_DAYS_LABEL } from '@constants';
import { useNavigateToConfigurator } from '@hooks';
import { CheckoutConfigurationTable } from '@molecules/CheckoutConfigurationTable';
import { resolveCheckoutPrintAvailability, resolveTestoLimits, useCheckout, useConfigurationCart } from '@store';
import { getModel, priceFormat, resolveCartItemDisplayPreview } from '@utils';
import { useMemo } from 'react';
const CheckoutProductCard = ({ product }: checkoutProductCardPropsType) => {
  const { navigateToConfigurator } = useNavigateToConfigurator();
  const quantity = useCheckout((state) => state.getProductQuantity(product.cartItemId));
  const subtotal = useCheckout((state) => state.getProductSubtotal(product.cartItemId));

  const garment = getModel(product.modelId);
  const cartItem = useConfigurationCart((state) => state.items.find((item) => item.id === product.cartItemId));
  const capturedPreview = useConfigurationCart((state) => state.previews[product.cartItemId]);
  const previewSrc = cartItem ? resolveCartItemDisplayPreview(cartItem, capturedPreview) : '';

  const productName = useMemo(() => product.business.name || 'Prodotto', [product.business.name]);
  const testoMaxLength = useMemo(() => {
    if (!garment?.testoDefaults) return undefined;
    return resolveTestoLimits(garment).maxLength;
  }, [garment]);
  const printAvailability = useMemo(() => resolveCheckoutPrintAvailability(garment), [garment]);

  if (!garment) return null;

  return (
    <article className="w-full min-w-0 p-5 border border-primary-10 rounded-[12px]">
      <Grid className="grid-cols-[auto_1fr_auto] items-start gap-5">
        <AtomImage src={previewSrc} alt={productName} className="h-[101px] w-[126px]" />
        <Flex className="flex-col items-start justify-start gap-3">
          <Text variant="product_name" className="mb-0">
            {productName}
          </Text>
          <Flex className="flex-wrap gap-2">
            <Button variant="primary" size="xs">
              Elenco giocatori
            </Button>
            <Button size="xs" className="font-normal" onClick={() => cartItem && navigateToConfigurator(cartItem.slug)} disabled={!cartItem}>
              Modifica Bozza
            </Button>
          </Flex>
          <Flex className="gap-3">
            <Text variant="small_secondary">Quantità</Text>
            <Box className="px-4 py-1.5 rounded-[8px] border border-primary-10">
              <Text variant="small_secondary" className="text-default">
                {quantity} pz
              </Text>
            </Box>
          </Flex>
        </Flex>
        <Flex className="flex-col items-end gap-3">
          <Flex className="gap-3">
            <Text variant="product_price">{priceFormat(subtotal)}</Text>
            <Text variant="small">prezzo totale</Text>
            <SvgIcon name="three_dots" className="size-7 text-gray" />
          </Flex>
          <Flex className="flex-col gap-2 max-w-[250px]">
            <Text variant="small">% Scontistica applicata direttamente alla somma finale nel carrello</Text>
            <Text variant="small">{CHECKOUT_SHIPPING_DAYS_LABEL}</Text>
          </Flex>
        </Flex>
      </Grid>

      <div className="pt-6">
        <CheckoutConfigurationTable cartItemId={product.cartItemId} rows={product.rows} testoMaxLength={testoMaxLength} printAvailability={printAvailability} />
      </div>
    </article>
  );
};

export { CheckoutProductCard };
