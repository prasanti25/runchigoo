// Reports use completed calendar days in the operating timezone, not the device's.
export function partnerReportRange(days, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type) => parts.find((item) => item.type === type).value;
  const end = new Date(
    `${part("year")}-${part("month")}-${part("day")}T00:00:00Z`,
  );
  end.setUTCDate(end.getUTCDate() - 1);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days + 1);
  return {
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
  };
}

export function statusCount(summary, ...statuses) {
  if (!summary) return null;
  return summary.by_status.reduce(
    (total, row) => total + (statuses.includes(row.status) ? row.count : 0),
    0,
  );
}

export function partnerReportCsv(report) {
  return [
    [
      "Date",
      "Placed orders",
      "Delivered orders",
      "Cancelled orders",
      "Delivered gross order value INR",
    ],
    ...report.daily.map((day) => [
      day.date,
      day.placed_orders,
      day.orders,
      day.cancelled,
      day.gross_order_value,
    ]),
  ]
    .map((row) => row.join(","))
    .join("\r\n");
}
