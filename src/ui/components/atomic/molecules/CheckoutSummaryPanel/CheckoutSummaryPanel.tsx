'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import {
  AtomBadge,
  AtomCard,
  AtomCardContent,
  AtomCardHeader,
  AtomCardTitle,
  AtomSeparator,
  Button,
  Flex,
  ScrollArea,
  SvgIcon,
  Text,
} from '@atoms';

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
import { cn, getCheckoutDeliveryTimeline, priceFormat } from '@utils';

const HANDLE_HEIGHT_PX = 20;
const FOOTER_HEIGHT_PX = 125;
const PEEK_HEIGHT_PX = HANDLE_HEIGHT_PX + FOOTER_HEIGHT_PX;
const FULL_HEIGHT_RATIO = 0.92;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getMaxSheetHeight = () => Math.round(typeof window === 'undefined' ? 700 : window.innerHeight * FULL_HEIGHT_RATIO);

const getScrollViewport = (root: HTMLElement | null) =>
  root?.querySelector<HTMLElement>('[data-overlayscrollbars-viewport]') ?? null;

const canElementScroll = (el: HTMLElement | null) => Boolean(el && el.scrollHeight > el.clientHeight + 1);

type CheckoutSummarySharedProps = {
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

const CheckoutDiscountBanner = ({
  discountPercent,
  discountAmount,
  className,
}: {
  discountPercent: number;
  discountAmount: number;
  className?: string;
}) => (
  <div
    className={cn(
      'flex w-full flex-col items-center justify-center gap-0.5 rounded-lg bg-linear-to-r from-[#E9CC76] via-[#DC2C6F] to-black px-4 py-2',
      className,
    )}
  >
    <Text className="text-[14px] font-bold leading-4 text-white">% Sconto quantità del {discountPercent}%</Text>
    <Text className="text-center text-[12px] font-medium leading-3.5 text-white">
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
  <Flex className={cn('w-full flex-col', compact ? 'gap-3' : 'gap-5')}>
    {lineItems.map((item) => (
      <Flex key={item.id} className="w-full items-center justify-between gap-2">
        <Flex className="min-w-0 flex-wrap items-center gap-2">
          <Text className={cn('font-semibold text-[#0A0A0A]', compact ? 'text-[16px] leading-4' : 'text-[20px] leading-4')}>{item.name}</Text>
          <AtomBadge
            variant="quantity"
            className={cn(compact && 'h-5.5 rounded-[7.5px] border-[#4B5563] bg-transparent px-2.5 text-[12px] font-medium text-[#4B5563]')}
          >
            {item.quantity} pz
          </AtomBadge>
        </Flex>
        <Text
          className={cn(
            'shrink-0 font-semibold tracking-[-1px] text-[#0A0A0A]',
            compact ? 'text-[18px] leading-none' : 'text-[24px] leading-4',
          )}
        >
          {priceFormat(item.amount)}
        </Text>
      </Flex>
    ))}
    <Flex className={cn('w-full flex-col', compact ? 'gap-3' : 'gap-5')}>
      <Flex className="w-full flex-wrap items-center justify-between gap-2">
        <Text className={cn('font-medium text-[#0A0A0A]', compact ? 'text-[14px] leading-4' : 'text-[16px] leading-4')}>
          {CHECKOUT_SUMMARY_SHIPPING_LABEL}
        </Text>
        <Text
          className={cn(
            'shrink-0 font-semibold tracking-[-1px] text-[#0A0A0A]',
            compact ? 'text-[18px] leading-none' : 'text-[24px] leading-4',
          )}
        >
          {priceFormat(shippingCost)}
        </Text>
      </Flex>
      <AtomSeparator className="bg-[#9CA3AF]" />
      <Flex className="w-full items-center justify-between gap-2">
        <Flex className="flex-col items-start justify-start gap-1">
          <Text className={cn('font-semibold text-[#0A0A0A]', compact ? 'text-[16px] leading-4' : 'text-[20px] leading-4')}>
            {CHECKOUT_SUMMARY_TOTAL_LABEL}
          </Text>
          <Text className="text-[12px] font-medium leading-3.5 text-[#71717A]">{CHECKOUT_SUMMARY_VAT_LABEL}</Text>
        </Flex>
        <Text
          className={cn(
            'shrink-0 font-semibold tracking-[-1px] text-[#0A0A0A]',
            compact ? 'text-[18px] leading-none' : 'text-[24px] leading-4',
          )}
        >
          {priceFormat(grandTotal)}
        </Text>
      </Flex>
    </Flex>
  </Flex>
);

const CheckoutSummaryMeta = ({
  deliveryTimeline,
  compact,
}: Pick<CheckoutSummarySharedProps, 'deliveryTimeline'> & { compact?: boolean }) => (
  <Flex className={cn('w-full flex-col', compact ? 'gap-4' : 'gap-8')}>
    <Flex className="w-full flex-col items-start gap-3">
      <Text className="text-[14px] font-medium leading-4 text-[#0A0A0A]">{CHECKOUT_SUMMARY_TIMELINE_TITLE}</Text>
      <Flex className="w-full items-start">
        {CHECKOUT_SUMMARY_TIMELINE_STEPS.map((step, index) => {
          const date = deliveryTimeline[step.dateKey];
          const iconNames = ['checkout_0', 'checkout_1', 'checkout_2'] as const;
          const iconName = iconNames[index];
          return (
            <Fragment key={index}>
              <Flex className="min-w-0 flex-1 flex-col items-center gap-1.5 text-center">
                <Flex className="flex size-6.25 items-center justify-center rounded-full bg-black text-white">
                  <SvgIcon name={iconName} className="size-3.5 shrink-0" />
                </Flex>
                <Text className="text-center text-[12px] leading-3 text-black">{step.label}</Text>
                <Text className="text-center text-[11px] leading-3.5 text-[#71717A]">{date}</Text>
              </Flex>
              {index < CHECKOUT_SUMMARY_TIMELINE_STEPS.length - 1 && (
                <AtomSeparator className="mt-3 w-full max-w-16 shrink bg-[#9CA3AF]" />
              )}
            </Fragment>
          );
        })}
      </Flex>
    </Flex>
    <ul className={cn('flex w-full flex-col', compact ? 'gap-2.5' : 'gap-3')}>
      {CHECKOUT_SUMMARY_TRUST_ITEMS.map(({ icon, label }) => (
        <li key={label} className="flex w-full items-center gap-2 text-[#0A0A0A]">
          <SvgIcon name={icon} className="size-4 shrink-0" />
          <Text className="text-[14px] font-medium leading-4">{label}</Text>
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
  error,
  onSubmit,
}: CheckoutSummarySharedProps) => (
  <Flex className="w-full flex-col gap-8">
    <CheckoutSummaryLineItems lineItems={lineItems} shippingCost={shippingCost} grandTotal={grandTotal} />
    <Flex className="w-full flex-col gap-3">
      <CheckoutDiscountBanner discountPercent={discountPercent} discountAmount={discountAmount} className="gap-2 px-6 py-2" />
      <Button size="checkout" variant="checkout" disabled={isSubmitting} onClick={onSubmit}>
        {isSubmitting ? 'Attendere…' : CHECKOUT_SUMMARY_PROCEED_LABEL}
        {error && <p className="text-[12px] text-red-600">{error}</p>}
      </Button>
    </Flex>
    <CheckoutSummaryMeta deliveryTimeline={deliveryTimeline} />
  </Flex>
);

const CheckoutSummaryMobileActions = ({
  discountPercent,
  discountAmount,
  grandTotal,
  isSubmitting,
  error,
  onSubmit,
}: Pick<CheckoutSummarySharedProps, 'discountPercent' | 'discountAmount' | 'grandTotal' | 'isSubmitting' | 'error' | 'onSubmit'>) => (
  <div className="flex w-full shrink-0 flex-col gap-[11px]">
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 flex-col items-start gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0">
          <Text className="text-[12px] font-medium leading-3 text-[#71717A]">{CHECKOUT_SUMMARY_TOTAL_LABEL.replace(/:$/, '')}</Text>
          <Text className="text-[11px] font-medium leading-3 text-[#71717A]">{CHECKOUT_SUMMARY_VAT_LABEL}</Text>
        </div>
        <Text className="text-[22px] font-semibold leading-none tracking-[-1px] text-[#0A0A0A]">{priceFormat(grandTotal)}</Text>
      </div>
      <Button
        size="checkout"
        variant="checkout"
        className="h-9 w-[149px] shrink-0 rounded-lg p-0 text-[14px] font-semibold leading-4 hover:bg-[#0A0A0A] hover:text-white"
        disabled={isSubmitting}
        onClick={onSubmit}
      >
        {isSubmitting ? 'Attendere…' : CHECKOUT_SUMMARY_PROCEED_LABEL}
      </Button>
    </div>
    <CheckoutDiscountBanner discountPercent={discountPercent} discountAmount={discountAmount} className="min-h-[47px] w-full" />
    {error && <p className="text-[12px] text-red-600">{error}</p>}
  </div>
);

const CheckoutSummaryPanel = () => {
  const { lineItems, shippingCost, discountPercent, discountAmount, grandTotal } = useCheckoutSummary();
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

    // Scrollable content owns the gesture — never steal it to close the sheet.
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

    const isInsideDrawerScroll = (target: EventTarget | null) =>
      target instanceof Element && Boolean(target.closest('[data-checkout-drawer-scroll]'));

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
      <AtomCard className="sticky top-0 right-0 mt-9 h-[calc(100%-(--spacing(9)))] w-full justify-self-end gap-8 bg-[#E5E5E5] p-12 ring-0 max-sm:hidden">
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

      <div className="fixed inset-x-0 bottom-0 z-50 hidden max-sm:block">
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
          <div className="absolute inset-x-0 top-0 flex flex-col overflow-hidden" style={{ bottom: FOOTER_HEIGHT_PX }}>
            <div
              data-checkout-drawer-handle
              className="flex shrink-0 touch-none items-center justify-center"
              style={{ height: HANDLE_HEIGHT_PX }}
              aria-hidden
            >
              <span className="h-1 w-8 rounded-full bg-[#CDCDCD]" />
            </div>

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
                  <Text className="mb-4 text-[24px] font-semibold leading-none tracking-[-1px] text-[#0A0A0A]">
                    {CHECKOUT_SUMMARY_TITLE}
                  </Text>
                  <div className="flex flex-col gap-4">
                    <CheckoutSummaryLineItems lineItems={lineItems} shippingCost={shippingCost} grandTotal={grandTotal} compact />
                    <CheckoutSummaryMeta deliveryTimeline={deliveryTimeline} compact />
                  </div>
                  <div className="py-3">
                    <AtomSeparator className="bg-[#9CA3AF]" />
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 box-border flex flex-col justify-end px-4 pb-6 pt-1" style={{ height: FOOTER_HEIGHT_PX }}>
            <CheckoutSummaryMobileActions
              discountPercent={discountPercent}
              discountAmount={discountAmount}
              grandTotal={grandTotal}
              isSubmitting={isSubmitting}
              error={error}
              onSubmit={submitCheckout}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export { CheckoutSummaryPanel };
