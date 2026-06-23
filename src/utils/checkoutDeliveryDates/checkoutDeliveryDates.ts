const IT_WEEKDAYS_SHORT = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'] as const;

const formatCheckoutDeliveryDate = (date: Date) => {
  const weekday = IT_WEEKDAYS_SHORT[date.getDay()];
  return `${weekday}, ${date.getDate()}`;
};

const addCalendarDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const getCheckoutDeliveryTimeline = () => {
  const today = new Date();

  return {
    order: formatCheckoutDeliveryDate(today),
    transport: formatCheckoutDeliveryDate(addCalendarDays(today, 2)),
    delivered: formatCheckoutDeliveryDate(addCalendarDays(today, 6)),
  };
};

export { getCheckoutDeliveryTimeline };
