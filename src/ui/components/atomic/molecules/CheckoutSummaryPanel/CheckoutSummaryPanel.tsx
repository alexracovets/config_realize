'use client';

import { Fragment, useMemo, useState } from 'react';

import { AtomBadge, AtomCard, AtomCardContent, AtomCardHeader, AtomCardTitle, AtomSeparator, Button, Flex, SvgIcon, Text } from '@atoms';
import { Drawer, DrawerContent, DrawerTitle } from '@shared';

import {
  CHECKOUT_SUMMARY_PROCEED_LABEL,
  CHECKOUT_SUMMARY_SHIPPING_LABEL,
  CHECKOUT_SUMMARY_TIMELINE_STEPS,
  CHECKOUT_SUMMARY_TIMELINE_TITLE,
  CHECKOUT_SUMMARY_TITLE,
  CHECKOUT_SUMMARY_TOTAL_LABEL,
  CHECKOUT_SUMMARY_TRUST_ITEMS,
  CHECKOUT_SUMMARY_VAT_LABEL,
} from '@constants';
import { useCheckoutSummary, useSubmitCheckout } from '@hooks';
import { getCheckoutDeliveryTimeline, priceFormat } from '@utils';

type CheckoutSummaryBodyProps = {
  lineItems: ReturnType<typeof useCheckoutSummary>['lineItems'];
  shippingCost: number;
  discountPercent: number;
  discountAmount: number;
  grandTotal: number;
  deliveryTimeline: ReturnType<typeof getCheckoutDeliveryTimeline>;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
};

const CheckoutSummaryBody = ({
  lineItems,
  shippingCost,
  discountPercent,
  discountAmount,
  grandTotal,
  deliveryTimeline,
  isSubmitting,
  error,
  onSubmit,
}: CheckoutSummaryBodyProps) => (
  <Flex className="flex-col gap-8 w-full max-sm:gap-4">
    <Flex className="flex-col gap-5 w-full max-sm:gap-3">
      {lineItems.map((item) => (
        <Flex key={item.id} className="w-full items-center justify-between gap-2">
          <Flex className="min-w-0 flex-wrap items-center gap-2">
            <Text className="text-[20px] font-semibold leading-4 max-sm:text-[16px]">{item.name}</Text>
            <AtomBadge variant="quantity">{item.quantity} pz</AtomBadge>
          </Flex>
          <Text className="shrink-0 text-[24px] tracking-[-1px] font-semibold leading-4 max-sm:text-[18px]">{priceFormat(item.amount)}</Text>
        </Flex>
      ))}
      <Flex className="flex-col gap-5 w-full max-sm:gap-3">
        <Flex className="w-full flex-wrap items-center justify-between gap-2 ">
          <Text className="text-[16px] font-medium leading-4">{CHECKOUT_SUMMARY_SHIPPING_LABEL}</Text>
          <Text className="shrink-0 text-[24px] tracking-[-1px] font-semibold leading-4 max-sm:text-[18px]">{priceFormat(shippingCost)}</Text>
        </Flex>
        <AtomSeparator className="bg-gray-20" />
        <Flex className="items-center justify-between gap-2 w-full">
          <Flex className="flex-col gap-3 items-start justify-start">
            <Text className="text-[20px] font-semibold leading-4 max-sm:text-[16px]">{CHECKOUT_SUMMARY_TOTAL_LABEL}</Text>
            <Text className="text-[#71717A] text-[14px] font-medium leading-4">{CHECKOUT_SUMMARY_VAT_LABEL}</Text>
          </Flex>
          <Text className="shrink-0 text-[24px] tracking-[-1px] font-semibold leading-4 max-sm:text-[18px]">{priceFormat(grandTotal)}</Text>
        </Flex>
      </Flex>
    </Flex>
    <Flex className="flex-col gap-3 w-full">
      <Flex className="rounded-lg bg-linear-to-r from-[#ECD187] via-[#DC2C6F] to-[#030102] flex-col gap-2 py-2 px-6 w-full">
        <Text className="text-[16px] text-white leading-4.75 font-bold">% Sconto quantita del {discountPercent}%</Text>
        <Text className="text-[14px] text-white leading-4 font-medium text-center">
          Con questo ordine risparmierai: <span className="font-normal">{priceFormat(discountAmount)}</span>
        </Text>
      </Flex>
      <Button size="checkout" variant="checkout" disabled={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? 'Attendere…' : CHECKOUT_SUMMARY_PROCEED_LABEL}
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </Button>
    </Flex>
    <Flex className="flex-col gap-8 w-full max-sm:gap-4">
      <Flex className="flex-col gap-4 w-full items-start">
        <Text className="text-[16px] font-medium text-[#0A0A0A]">{CHECKOUT_SUMMARY_TIMELINE_TITLE}</Text>
        <Flex className="w-full items-start">
          {CHECKOUT_SUMMARY_TIMELINE_STEPS.map((step, index) => {
            const date = deliveryTimeline[step.dateKey];
            const iconNames = ['checkout_0', 'checkout_1', 'checkout_2'] as const;
            const iconName = iconNames[index];
            return (
              <Fragment key={index}>
                <Flex className="flex-col gap-2 w-full min-w-0 flex-1 items-center text-center">
                  <Flex className="flex items-center justify-center size-10 rounded-full bg-base-black text-white">
                    <SvgIcon name={iconName} className="size-5 shrink-0" />
                  </Flex>
                  <Text className="text-black text-[12px] text-center leading-3">{step.label}</Text>
                  <Text className="text-[#71717A] text-[11px] text-center leading-3.75">{date}</Text>
                </Flex>
                {index < CHECKOUT_SUMMARY_TIMELINE_STEPS.length - 1 && <AtomSeparator className="mt-5 w-full max-w-10 shrink bg-gray-30" />}
              </Fragment>
            );
          })}
        </Flex>
      </Flex>
      <ul className="flex flex-col gap-3 w-full">
        {CHECKOUT_SUMMARY_TRUST_ITEMS.map(({ icon, label }) => {
          return (
            <li key={label} className="flex items-center gap-2 w-full text-[#0A0A0A]">
              <SvgIcon name={icon} className="size-4 shrink-0" />
              <Text className="text-[16px] text-[500] leading-4">{label}</Text>
            </li>
          );
        })}
      </ul>
    </Flex>
  </Flex>
);

const CheckoutSummaryPanel = () => {
  const { lineItems, shippingCost, discountPercent, discountAmount, grandTotal } = useCheckoutSummary();
  const { submitCheckout, isSubmitting, error } = useSubmitCheckout();
  const deliveryTimeline = useMemo(() => getCheckoutDeliveryTimeline(), []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <AtomCard className="sticky top-0 right-0 mt-9 h-[calc(100%-(--spacing(9)))] w-full justify-self-end bg-[#E5E5E5] ring-0 p-12 gap-8 max-sm:hidden">
        <AtomCardHeader>
          <AtomCardTitle className="text-[32px] font-semibold leading-none tracking-[-1px] text-base-black max-sm:text-[22px]">
            {CHECKOUT_SUMMARY_TITLE}
          </AtomCardTitle>
        </AtomCardHeader>
        <AtomCardContent>
          <CheckoutSummaryBody
            lineItems={lineItems}
            shippingCost={shippingCost}
            discountPercent={discountPercent}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            deliveryTimeline={deliveryTimeline}
            isSubmitting={isSubmitting}
            error={error}
            onSubmit={submitCheckout}
          />
        </AtomCardContent>
      </AtomCard>

      <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <Flex className="hidden max-sm:flex fixed bottom-0 left-0 z-40 w-full flex-col gap-2 border-t border-gray-20 bg-white p-3">
          <button
            type="button"
            className="mx-auto -mt-1 mb-1 h-1.5 w-10 shrink-0 rounded-full bg-gray-20"
            aria-label={CHECKOUT_SUMMARY_TITLE}
            onClick={() => setIsDrawerOpen(true)}
          />
          <Flex className="rounded-lg bg-linear-to-r from-[#ECD187] via-[#DC2C6F] to-[#030102] flex-col gap-1 py-1.5 px-4 w-full">
            <Text className="text-[13px] text-white leading-4 font-bold">% Sconto quantita del {discountPercent}%</Text>
            <Text className="text-[11px] text-white leading-3.5 font-medium text-center">
              Con questo ordine risparmierai: <span className="font-normal">{priceFormat(discountAmount)}</span>
            </Text>
          </Flex>
          <Flex className="items-center justify-between gap-3 w-full">
            <Flex className="flex-col items-start gap-0.5">
              <Text className="text-[11px] text-gray leading-3">{CHECKOUT_SUMMARY_VAT_LABEL}</Text>
              <Text className="text-[18px] font-semibold leading-4.75">{priceFormat(grandTotal)}</Text>
            </Flex>
            <Button size="checkout" variant="checkout" className="flex-1" disabled={isSubmitting} onClick={submitCheckout}>
              {isSubmitting ? 'Attendere…' : CHECKOUT_SUMMARY_PROCEED_LABEL}
            </Button>
          </Flex>
          {error && <p className="text-[12px] text-red-600">{error}</p>}
        </Flex>

        <DrawerContent className="max-h-[85vh] overflow-y-auto p-4 pb-8">
          <DrawerTitle className="mb-4 text-[24px] font-semibold leading-none tracking-[-1px] text-base-black">
            {CHECKOUT_SUMMARY_TITLE}
          </DrawerTitle>
          <CheckoutSummaryBody
            lineItems={lineItems}
            shippingCost={shippingCost}
            discountPercent={discountPercent}
            discountAmount={discountAmount}
            grandTotal={grandTotal}
            deliveryTimeline={deliveryTimeline}
            isSubmitting={isSubmitting}
            error={error}
            onSubmit={submitCheckout}
          />
        </DrawerContent>
      </Drawer>
    </>
  );
};

export { CheckoutSummaryPanel };
