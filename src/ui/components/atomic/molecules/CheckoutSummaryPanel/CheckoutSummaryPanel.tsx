'use client';

import { Fragment, useMemo } from 'react';

import { AtomBadge, AtomCard, AtomCardContent, AtomCardHeader, AtomCardTitle, AtomSeparator, Button } from '@atoms';

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
import { useCheckoutSummary } from '@hooks';
import { CHECKOUT_SUMMARY_ICON_MAP, getCheckoutDeliveryTimeline, priceFormat } from '@utils';

const CheckoutSummaryPanel = () => {
  const { lineItems, shippingCost, discountPercent, discountAmount, grandTotal } = useCheckoutSummary();
  const deliveryTimeline = useMemo(() => getCheckoutDeliveryTimeline(), []);

  return (
    <AtomCard className="sticky top-6 w-full max-w-[360px] justify-self-end border-0 bg-[#E8E8E8] py-6 ring-0 [--card-spacing:--spacing(6)]">
      <AtomCardHeader className="pb-0">
        <AtomCardTitle className="text-[24px] font-semibold leading-none text-base-black">{CHECKOUT_SUMMARY_TITLE}</AtomCardTitle>
      </AtomCardHeader>

      <AtomCardContent className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          {lineItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <span className="text-[14px] font-medium text-default">{item.name}</span>
                <AtomBadge variant="quantity">{item.quantity} pz</AtomBadge>
              </div>
              <span className="shrink-0 text-[14px] font-medium text-default">{priceFormat(item.amount)}</span>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3">
            <span className="text-[14px] text-default">{CHECKOUT_SUMMARY_SHIPPING_LABEL}</span>
            <span className="shrink-0 text-[14px] font-medium text-default">{priceFormat(shippingCost)}</span>
          </div>
        </div>

        <AtomSeparator className="bg-gray-20" />

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[16px] font-semibold text-default">{CHECKOUT_SUMMARY_TOTAL_LABEL}</span>
            <span className="text-[12px] text-gray">{CHECKOUT_SUMMARY_VAT_LABEL}</span>
          </div>
          <span className="text-[24px] font-semibold leading-none text-default">{priceFormat(grandTotal)}</span>
        </div>

        <div className="rounded-[8px] bg-linear-to-r from-[#ECD187] via-[#DC2C6F] to-[#030102] px-4 py-3 text-center text-white">
          <p className="text-[14px] font-semibold leading-snug">% Sconto quantità del {discountPercent}%</p>
          <p className="mt-1 text-[12px] leading-snug">Con questo ordine risparmierai: {priceFormat(discountAmount)}</p>
        </div>

        <Button variant="default" size="sm" className="h-12 w-full rounded-[8px] bg-base-black text-[16px] font-semibold text-white hover:bg-base-black/90">
          {CHECKOUT_SUMMARY_PROCEED_LABEL}
        </Button>

        <div className="flex flex-col gap-4">
          <p className="text-[14px] font-semibold text-default">{CHECKOUT_SUMMARY_TIMELINE_TITLE}</p>
          <div className="flex items-start">
            {CHECKOUT_SUMMARY_TIMELINE_STEPS.map((step, index) => {
              const Icon = CHECKOUT_SUMMARY_ICON_MAP[step.icon];
              const date = deliveryTimeline[step.dateKey];

              return (
                <Fragment key={step.label}>
                  <div className="flex min-w-0 flex-1 flex-col items-center gap-2 text-center">
                    <span className="flex size-10 items-center justify-center rounded-full bg-base-black text-white">
                      {Icon && <Icon className="size-4" aria-hidden />}
                    </span>
                    <span className="text-[12px] font-medium text-default">{step.label}</span>
                    <span className="text-[12px] text-gray">{date}</span>
                  </div>
                  {index < CHECKOUT_SUMMARY_TIMELINE_STEPS.length - 1 && <AtomSeparator className="mt-5 w-full max-w-10 shrink bg-gray-30" />}
                </Fragment>
              );
            })}
          </div>
        </div>

        <AtomSeparator className="bg-gray-20" />

        <ul className="flex flex-col gap-3">
          {CHECKOUT_SUMMARY_TRUST_ITEMS.map(({ icon, label }) => {
            const Icon = CHECKOUT_SUMMARY_ICON_MAP[icon];

            return (
              <li key={label} className="flex items-center gap-3 text-[13px] text-default">
                {Icon && <Icon className="size-4 shrink-0 stroke-[1.5]" aria-hidden />}
                <span>{label}</span>
              </li>
            );
          })}
        </ul>
      </AtomCardContent>
    </AtomCard>
  );
};

export { CheckoutSummaryPanel };
