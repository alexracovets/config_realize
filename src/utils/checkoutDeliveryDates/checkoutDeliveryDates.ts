const IT_WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'] as const;
const IT_MONTHS_SHORT = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'] as const;

const CHECKOUT_TRANSPORT_WORKING_DAYS = 19;
const CHECKOUT_DELIVERY_WORKING_DAYS = 21;

const formatCheckoutDeliveryDate = (date: Date) => {
  const weekday = IT_WEEKDAYS_SHORT[date.getDay()];
  const month = IT_MONTHS_SHORT[date.getMonth()];
  return `${weekday} ${date.getDate()} ${month}`;
};

const isWorkingDay = (date: Date) => {
  const weekday = date.getDay();
  return weekday !== 0 && weekday !== 6;
};

const addWorkingDays = (date: Date, days: number) => {
  const result = new Date(date);
  let added = 0;

  while (added < days) {
    result.setDate(result.getDate() + 1);
    if (isWorkingDay(result)) added += 1;
  }

  return result;
};

const getCheckoutDeliveryTimeline = (from: Date = new Date()) => {
  const today = new Date(from);

  return {
    order: formatCheckoutDeliveryDate(today),
    transport: formatCheckoutDeliveryDate(addWorkingDays(today, CHECKOUT_TRANSPORT_WORKING_DAYS)),
    delivered: formatCheckoutDeliveryDate(addWorkingDays(today, CHECKOUT_DELIVERY_WORKING_DAYS)),
  };
};

export { getCheckoutDeliveryTimeline };
