'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';

import {
  AtomBadge,
  AtomCard,
  AtomCardContent,
  AtomCardHeader,
  AtomCardTitle,
  AtomSeparator,
  AtomTooltip,
  Button,
  Flex,
  ScrollArea,
  SvgIcon,
  Text,
} from '@atoms';

import {
  buildMinimumQuantityLabel,
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
import { cn, getCheckoutDeliveryTimeline, priceFormat } from '@utils';

const HANDLE_HEIGHT_PX = 20;
const FOOTER_HEIGHT_PX = 125;
const PEEK_HEIGHT_PX = HANDLE_HEIGHT_PX + FOOTER_HEIGHT_PX;
const FULL_HEIGHT_RATIO = 0.92;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getMaxSheetHeight = () => Math.round(typeof window === 'undefined' ? 700 : window.innerHeight * FULL_HEIGHT_RATIO);

const getScrollViewport = (root: HTMLElement | null) => root?.querySelector<HTMLElement>('[data-overlayscrollbars-viewport]') ?? null;

const canElementScroll = (el: HTMLElement | null) => Boolean(el && el.scrollHeight > el.clientHeight + 1);

type CheckoutSummarySharedProps = {
  lineItems: ReturnType<typeof useCheckoutSummary>['lineItems'];
  shippingCost: number;
  discountPercent: number;
  discountAmount: number;
  grandTotal: number;
  deliveryTimeline: ReturnType<typeof getCheckoutDeliveryTimeline>;
  isSubmitting: boolean;
  canProceed: boolean;
  minimumQuantity: number;
  error: string | null;
  onSubmit: () => void;
};

const CheckoutProceedTooltip = ({
  canProceed,
  minimumQuantity,
  className,
  children,
}: {
  canProceed: boolean;
  minimumQuantity: number;
  className?: string;
  children: ReactNode;
}) => (
  <AtomTooltip content={!canProceed ? buildMinimumQuantityLabel(minimumQuantity) : undefined} className={className}>
    {children}
  </AtomTooltip>
);

const CheckoutDiscountBanner = ({ discountPercent, discountAmount, className }: { discountPercent: number; discountAmount: number; className?: string }) => (
  <div
    className={cn(
      'flex w-full flex-col items-center justify-center gap-0.5 rounded-lg bg-linear-to-r from-[#E9CC76] via-[#DC2C6F] to-black px-4 py-2',
      className,
    )}
  >
    <Text variant="checkout_summary_discount_title">% Sconto quantità del {discountPercent}%</Text>
    <Text variant="checkout_summary_discount_subtitle">
      Con questo ordine risparmierai: <span className="font-normal">{priceFormat(discountAmount)}</span>
    </Text>
  </div>
);

const CheckoutSummaryLineItems = ({
  lineItems,
  shippingCost,
  grandTotal,
  compact,
}: Pick<CheckoutSummarySharedProps, 'lineItems' | 'shippingCost' | 'grandTotal'> & { compact?: boolean }) => (
  <Flex variant={compact ? 'checkout_summary_list_compact' : 'checkout_summary_list_default'}>
    {lineItems.map((item) => (
      <Flex key={item.id} variant="checkout_summary_between_row">
        <Flex variant="checkout_summary_item_inline">
          <Text variant={compact ? 'checkout_summary_item_name_compact' : 'checkout_summary_item_name_default'}>{item.name}</Text>
          <AtomBadge
            variant="quantity"
            className={cn(compact && 'h-5.5 rounded-[7.5px] border-[#4B5563] bg-transparent px-2.5 text-[12px] font-medium text-[#4B5563]')}
          >
            {item.quantity} pz
          </AtomBadge>
        </Flex>
        <Text variant={compact ? 'checkout_summary_price_compact' : 'checkout_summary_price_default'}>{priceFormat(item.amount)}</Text>
      </Flex>
    ))}
    <Flex variant={compact ? 'checkout_summary_list_compact' : 'checkout_summary_list_default'}>
      <Flex variant="checkout_summary_between_wrap_row">
        <Text variant={compact ? 'checkout_summary_shipping_label_compact' : 'checkout_summary_shipping_label_default'}>{CHECKOUT_SUMMARY_SHIPPING_LABEL}</Text>
        <Text variant={compact ? 'checkout_summary_price_compact' : 'checkout_summary_price_default'}>{priceFormat(shippingCost)}</Text>
      </Flex>
      <AtomSeparator className="bg-[#9CA3AF]" />
      <Flex variant="checkout_summary_between_row">
        <Flex variant="checkout_summary_total_label_column">
          <Text variant={compact ? 'checkout_summary_total_label_compact' : 'checkout_summary_total_label_default'}>{CHECKOUT_SUMMARY_TOTAL_LABEL}</Text>
          <Text variant="checkout_summary_vat_note">{CHECKOUT_SUMMARY_VAT_LABEL}</Text>
        </Flex>
        <Text variant={compact ? 'checkout_summary_price_compact' : 'checkout_summary_price_default'}>{priceFormat(grandTotal)}</Text>
      </Flex>
    </Flex>
  </Flex>
);

const CheckoutSummaryMeta = ({ deliveryTimeline, compact }: Pick<CheckoutSummarySharedProps, 'deliveryTimeline'> & { compact?: boolean }) => (
  <Flex variant={compact ? 'checkout_summary_meta_compact' : 'checkout_summary_meta_default'}>
    <Flex variant="checkout_summary_section_column">
      <Text variant="checkout_summary_timeline_title">{CHECKOUT_SUMMARY_TIMELINE_TITLE}</Text>
      <Flex variant="checkout_summary_timeline_row">
        {CHECKOUT_SUMMARY_TIMELINE_STEPS.map((step, index) => {
          const date = deliveryTimeline[step.dateKey];
          const iconNames = ['checkout_0', 'checkout_1', 'checkout_2'] as const;
          const iconName = iconNames[index];
          return (
            <Fragment key={index}>
              <Flex variant="checkout_summary_timeline_step_column">
                <Flex variant="checkout_summary_timeline_icon">
                  <SvgIcon name={iconName} className="size-3.5 shrink-0" />
                </Flex>
                <Text variant="checkout_summary_timeline_step_label">{step.label}</Text>
                <Text variant="checkout_summary_timeline_step_date">{date}</Text>
              </Flex>
              {index < CHECKOUT_SUMMARY_TIMELINE_STEPS.length - 1 && <AtomSeparator className="mt-3 w-full max-w-16 shrink bg-[#9CA3AF]" />}
            </Fragment>
          );
        })}
      </Flex>
    </Flex>
    <ul className={cn('flex w-full flex-col', compact ? 'gap-2.5' : 'gap-3')}>
      {CHECKOUT_SUMMARY_TRUST_ITEMS.map(({ icon, label }) => (
        <li key={label} className="flex w-full items-center gap-2 text-[#0A0A0A]">
          <SvgIcon name={icon} className="size-4 shrink-0" />
          <Text variant="checkout_summary_trust_label">{label}</Text>
        </li>
      ))}
    </ul>
  </Flex>
);

const CheckoutSummaryBody = ({
  lineItems,
  shippingCost,
  discountPercent,
  discountAmount,
  grandTotal,
  deliveryTimeline,
  isSubmitting,
  canProceed,
  minimumQuantity,
  error,
  onSubmit,
}: CheckoutSummarySharedProps) => (
  <Flex variant="checkout_summary_body_column">
    <CheckoutSummaryLineItems lineItems={lineItems} shippingCost={shippingCost} grandTotal={grandTotal} />
    <Flex variant="checkout_summary_actions_column">
      <CheckoutDiscountBanner discountPercent={discountPercent} discountAmount={discountAmount} className="gap-2 px-6 py-2" />
      <CheckoutProceedTooltip canProceed={canProceed} minimumQuantity={minimumQuantity} className="w-full cursor-not-allowed">
        <Button size="checkout" variant="checkout" disabled={isSubmitting || !canProceed} onClick={onSubmit}>
          {isSubmitting ? 'Attendere…' : CHECKOUT_SUMMARY_PROCEED_LABEL}
        </Button>
      </CheckoutProceedTooltip>
      {error && <p className="text-[12px] text-red-600">{error}</p>}
    </Flex>
    <CheckoutSummaryMeta deliveryTimeline={deliveryTimeline} />
  </Flex>
);

const CheckoutSummaryMobileActions = ({
  discountPercent,
  discountAmount,
  grandTotal,
  isSubmitting,
  canProceed,
  minimumQuantity,
  error,
  onSubmit,
}: Pick<
  CheckoutSummarySharedProps,
  'discountPercent' | 'discountAmount' | 'grandTotal' | 'isSubmitting' | 'canProceed' | 'minimumQuantity' | 'error' | 'onSubmit'
>) => (
  <Flex variant="checkout_summary_mobile_actions">
    <Flex variant="checkout_summary_mobile_head">
      <Flex variant="checkout_summary_mobile_total">
        <Flex variant="checkout_summary_mobile_total_labels">
          <Text variant="checkout_summary_mobile_total_label">{CHECKOUT_SUMMARY_TOTAL_LABEL.replace(/:$/, '')}</Text>
          <Text variant="checkout_summary_mobile_vat_label">{CHECKOUT_SUMMARY_VAT_LABEL}</Text>
        </Flex>
        <Text variant="checkout_summary_mobile_total_amount">{priceFormat(grandTotal)}</Text>
      </Flex>
      <CheckoutProceedTooltip canProceed={canProceed} minimumQuantity={minimumQuantity} className="shrink-0 cursor-not-allowed">
        <Button
          size="checkout"
          variant="checkout"
          className="h-9 w-37.25 shrink-0 rounded-lg p-0 text-[14px] font-semibold leading-4 hover:bg-[#0A0A0A] hover:text-white"
          disabled={isSubmitting || !canProceed}
          onClick={onSubmit}
        >
          {isSubmitting ? 'Attendere…' : CHECKOUT_SUMMARY_PROCEED_LABEL}
        </Button>
      </CheckoutProceedTooltip>
    </Flex>
    <CheckoutDiscountBanner discountPercent={discountPercent} discountAmount={discountAmount} className="min-h-11.75 w-full" />
    {error && <p className="text-[12px] text-red-600">{error}</p>}
  </Flex>
);

const CheckoutSummaryPanel = () => {
  const { lineItems, shippingCost, discountPercent, discountAmount, grandTotal, canProceed, minimumQuantity } = useCheckoutSummary();
  const { submitCheckout, isSubmitting, error } = useSubmitCheckout();
  const deliveryTimeline = useMemo(() => getCheckoutDeliveryTimeline(), []);
  const [height, setHeight] = useState(PEEK_HEIGHT_PX);
  const [expandedHeight, setExpandedHeight] = useState(getMaxSheetHeight);
  const [isDragging, setIsDragging] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    startY: number;
    startHeight: number;
    mode: 'pending' | 'sheet' | 'scroll';
    preferScroll: boolean;
  } | null>(null);
  const heightRef = useRef(height);

  useEffect(() => {
    heightRef.current = height;
  }, [height]);

  const measureExpandedHeight = () => {
    const maxHeight = getMaxSheetHeight();
    const contentHeight = contentRef.current?.scrollHeight ?? 0;
    const fittedHeight = HANDLE_HEIGHT_PX + contentHeight + FOOTER_HEIGHT_PX;
    const nextHeight = clamp(fittedHeight, PEEK_HEIGHT_PX, maxHeight);
    setExpandedHeight((prev) => (prev === nextHeight ? prev : nextHeight));
    return nextHeight;
  };

  useEffect(() => {
    const nextExpandedHeight = measureExpandedHeight();
    if (heightRef.current > PEEK_HEIGHT_PX + 1) {
      setHeight(nextExpandedHeight);
      heightRef.current = nextExpandedHeight;
    }

    const contentEl = contentRef.current;
    if (!contentEl || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver(() => {
      const measured = measureExpandedHeight();
      if (heightRef.current > PEEK_HEIGHT_PX + 1) {
        setHeight(measured);
        heightRef.current = measured;
      }
    });
    observer.observe(contentEl);
    return () => observer.disconnect();
  }, [lineItems, deliveryTimeline]);

  const sharedProps: CheckoutSummarySharedProps = {
    lineItems,
    shippingCost,
    discountPercent,
    discountAmount,
    grandTotal,
    deliveryTimeline,
    isSubmitting,
    canProceed,
    minimumQuantity,
    error,
    onSubmit: submitCheckout,
  };

  const progress = clamp((height - PEEK_HEIGHT_PX) / Math.max(expandedHeight - PEEK_HEIGHT_PX, 1), 0, 1);
  const isExpanded = progress > 0.02;

  const isInteractiveTarget = (target: EventTarget | null) =>
    target instanceof Element && Boolean(target.closest('button, a, input, textarea, select, [role="button"]'));

  const applySheetHeight = (nextHeight: number) => {
    const maxHeight = measureExpandedHeight();
    const clamped = clamp(nextHeight, PEEK_HEIGHT_PX, maxHeight);
    heightRef.current = clamped;
    setHeight(clamped);
  };

  const openSheet = () => {
    applySheetHeight(measureExpandedHeight());
  };

  const closeSheet = () => {
    applySheetHeight(PEEK_HEIGHT_PX);
  };

  const beginSheetDrag = () => {
    if (!dragRef.current || dragRef.current.mode === 'sheet') return;
    dragRef.current.mode = 'sheet';
    setIsDragging(true);
  };

  const resolveDragMode = () => {
    const drag = dragRef.current;
    if (!drag || drag.mode !== 'pending') return;

    if (drag.preferScroll) {
      drag.mode = 'scroll';
      return;
    }

    beginSheetDrag();
  };

  const handleDragPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (isInteractiveTarget(event.target)) return;

    const target = event.target instanceof Element ? event.target : null;
    const fromHandle = Boolean(target?.closest('[data-checkout-drawer-handle]'));
    const fromScroll = Boolean(target?.closest('[data-checkout-drawer-scroll]'));
    const scrollViewport = getScrollViewport(scrollRef.current);
    const preferScroll = !fromHandle && fromScroll && canElementScroll(scrollViewport);

    dragRef.current = {
      startY: event.clientY,
      startHeight: heightRef.current,
      mode: 'pending',
      preferScroll,
    };
  };

  const handleDragPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaY = drag.startY - event.clientY;
    if (drag.mode === 'pending' && Math.abs(deltaY) >= 6) {
      resolveDragMode();
    }

    if (drag.mode !== 'sheet') return;

    event.preventDefault();
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
    applySheetHeight(drag.startHeight + deltaY);
  };

  const handleDragPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const movedDistance = Math.abs(event.clientY - drag.startY);
    const wasTap = drag.mode === 'pending' && movedDistance < 6;
    const isClosed = heightRef.current <= PEEK_HEIGHT_PX + 1;

    if (drag.mode === 'sheet') {
      const currentExpandedHeight = measureExpandedHeight();
      const mid = (PEEK_HEIGHT_PX + currentExpandedHeight) / 2;
      applySheetHeight(heightRef.current >= mid ? currentExpandedHeight : PEEK_HEIGHT_PX);
      setIsDragging(false);
    } else if (wasTap && isClosed && !isInteractiveTarget(event.target)) {
      openSheet();
    }

    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return;

    const onTouchMove = (event: TouchEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const touchY = event.touches[0]?.clientY;
      if (touchY == null) return;

      const deltaY = drag.startY - touchY;

      if (drag.mode === 'pending') {
        if (Math.abs(deltaY) < 6) return;
        if (drag.preferScroll) {
          drag.mode = 'scroll';
          return;
        }
        drag.mode = 'sheet';
        setIsDragging(true);
      }

      if (drag.mode !== 'sheet') return;
      event.preventDefault();
      const maxHeight = measureExpandedHeight();
      const clamped = clamp(drag.startHeight + deltaY, PEEK_HEIGHT_PX, maxHeight);
      heightRef.current = clamped;
      setHeight(clamped);
    };

    sheet.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => sheet.removeEventListener('touchmove', onTouchMove);
  }, []);

  useEffect(() => {
    if (!isExpanded) return;

    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';

    const isInsideDrawerScroll = (target: EventTarget | null) => target instanceof Element && Boolean(target.closest('[data-checkout-drawer-scroll]'));

    const preventBackgroundScroll = (event: TouchEvent) => {
      if (isInsideDrawerScroll(event.target)) return;
      event.preventDefault();
    };

    const preventBackgroundWheel = (event: WheelEvent) => {
      if (isInsideDrawerScroll(event.target)) return;
      event.preventDefault();
    };

    document.addEventListener('touchmove', preventBackgroundScroll, { passive: false });
    document.addEventListener('wheel', preventBackgroundWheel, { passive: false });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      document.removeEventListener('touchmove', preventBackgroundScroll);
      document.removeEventListener('wheel', preventBackgroundWheel);
    };
  }, [isExpanded]);

  return (
    <>
      <AtomCard className="sticky top-0 right-0 mt-9 h-[calc(100%-(--spacing(9)))] w-full min-w-0 justify-self-end gap-8 bg-[#E5E5E5] p-12 max-xl:p-4 ring-0 max-xl:gap-4 max-sm:hidden">
        <AtomCardHeader>
          <AtomCardTitle className="text-[32px] font-semibold leading-none tracking-[-1px] text-base-black max-sm:text-[22px]">
            {CHECKOUT_SUMMARY_TITLE}
          </AtomCardTitle>
        </AtomCardHeader>
        <AtomCardContent>
          <CheckoutSummaryBody {...sharedProps} />
        </AtomCardContent>
      </AtomCard>

      <div
        aria-hidden={!isExpanded}
        role="presentation"
        className="fixed inset-0 z-40 hidden bg-black max-sm:block"
        style={{
          opacity: progress * 0.4,
          pointerEvents: isExpanded ? 'auto' : 'none',
        }}
        onClick={closeSheet}
      />

      <Flex variant="checkout_summary_drawer_container">
        <div
          ref={sheetRef}
          className="relative overflow-hidden rounded-t-xl bg-[#E5E5E5] shadow-[0_4px_4px_rgba(0,0,0,0.25)]"
          style={{
            height,
            transition: isDragging ? 'none' : 'height 280ms ease-out',
          }}
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={handleDragPointerUp}
          onPointerCancel={handleDragPointerUp}
        >
          <Flex variant="checkout_summary_drawer_header" style={{ bottom: FOOTER_HEIGHT_PX }}>
            <Flex data-checkout-drawer-handle variant="checkout_summary_drawer_handle" style={{ height: HANDLE_HEIGHT_PX }} aria-hidden>
              <span className="h-1 w-8 rounded-full bg-[#CDCDCD]" />
            </Flex>

            <div
              ref={scrollRef}
              data-checkout-drawer-scroll
              className="min-h-0 flex-1 overscroll-contain px-4"
              style={{
                opacity: progress,
                pointerEvents: isExpanded ? 'auto' : 'none',
                transition: isDragging ? 'none' : 'opacity 200ms ease-out',
              }}
              aria-hidden={!isExpanded}
            >
              <ScrollArea className="h-full min-h-0 w-full overscroll-contain" fadeEdges>
                <div ref={contentRef}>
                  <Text variant="checkout_summary_drawer_title">{CHECKOUT_SUMMARY_TITLE}</Text>
                  <Flex variant="checkout_summary_drawer_sections">
                    <CheckoutSummaryLineItems lineItems={lineItems} shippingCost={shippingCost} grandTotal={grandTotal} compact />
                    <CheckoutSummaryMeta deliveryTimeline={deliveryTimeline} compact />
                  </Flex>
                  <Flex variant="checkout_summary_drawer_separator">
                    <AtomSeparator className="bg-[#9CA3AF]" />
                  </Flex>
                </div>
              </ScrollArea>
            </div>
          </Flex>

          <Flex variant="checkout_summary_drawer_footer" style={{ height: FOOTER_HEIGHT_PX }}>
            <CheckoutSummaryMobileActions
              discountPercent={discountPercent}
              discountAmount={discountAmount}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              canProceed={canProceed}
              minimumQuantity={minimumQuantity}
              error={error}
              onSubmit={submitCheckout}
            />
          </Flex>
        </div>
      </Flex>
    </>
  );
};

export { CheckoutSummaryPanel };
