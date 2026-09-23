export function chartBuckets(daily, weekly = false) {
  const size = weekly ? 7 : 1;
  const buckets = [];
  for (let offset = 0; offset < daily.length; offset += size) {
    const days = daily.slice(offset, offset + size);
    buckets.push({
      date: days[0].date,
      end: days.at(-1).date,
      placed_orders: days.reduce((sum, day) => sum + day.placed_orders, 0),
      orders: days.reduce((sum, day) => sum + day.orders, 0),
      cancelled: days.reduce((sum, day) => sum + day.cancelled, 0),
      gross_order_value:
        days.reduce(
          (sum, day) => sum + Math.round(Number(day.gross_order_value) * 100),
          0,
        ) / 100,
    });
  }
  return buckets;
}

export function chartScale(values, currency = false) {
  const maximum = Math.max(0, ...values);
  if (!maximum) return currency ? 100 : 4;
  const step = 10 ** Math.floor(Math.log10(maximum / 4));
  const rough = maximum / 4 / step;
  const nice = (rough <= 1 ? 1 : rough <= 2 ? 2 : rough <= 5 ? 5 : 10) * step;
  // Four equally spaced ticks must be whole order counts, even on quiet days.
  const tick = currency ? nice : Math.max(1, Math.ceil(nice));
  return tick * 4;
}
