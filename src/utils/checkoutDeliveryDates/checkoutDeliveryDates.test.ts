import { getCheckoutDeliveryTimeline } from '@utils/checkoutDeliveryDates';
import { describe, expect, it } from 'vitest';

describe('getCheckoutDeliveryTimeline', () => {
  it('keeps the order date as today and offsets transport/delivery by 19/21 working days', () => {
    const timeline = getCheckoutDeliveryTimeline(new Date(2026, 7, 24, 12));

    expect(timeline.order).toBe('lun 24 ago');
    expect(timeline.transport).toBe('ven 18 set');
    expect(timeline.delivered).toBe('mar 22 set');
  });

  it('skips weekends when counting working days', () => {
    const timeline = getCheckoutDeliveryTimeline(new Date(2026, 7, 21, 12));

    expect(timeline.order).toBe('ven 21 ago');
    expect(timeline.transport).toBe('gio 17 set');
    expect(timeline.delivered).toBe('lun 21 set');
  });
});
