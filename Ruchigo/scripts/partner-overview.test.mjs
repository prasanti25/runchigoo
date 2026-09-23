import assert from "node:assert/strict";
import { test } from "node:test";
import {
  partnerReportCsv,
  partnerReportRange,
  statusCount,
} from "../src/lib/partnerOverview.js";

test("report windows end on yesterday in IST, including UTC date boundaries", () => {
  assert.deepEqual(partnerReportRange(7, new Date("2026-09-22T20:00:00Z")), {
    start: "2026-09-16",
    end: "2026-09-22",
  });
  assert.deepEqual(partnerReportRange(7, new Date("2026-09-22T17:00:00Z")), {
    start: "2026-09-15",
    end: "2026-09-21",
  });
});
test("90-day report stays within API limits across year boundaries", () => {
  const range = partnerReportRange(90, new Date("2026-01-02T00:00:00Z"));
  assert.equal(range.end, "2026-01-01");
  assert.equal((new Date(range.end) - new Date(range.start)) / 86400000, 89);
});
test("unavailable counts are not invented zeros; missing known statuses are zero", () => {
  assert.equal(statusCount(null, "pending"), null);
  const summary = {
    by_status: [
      { status: "assigned", count: 3 },
      { status: "out_for_delivery", count: 2 },
      { status: "delivered", count: 4 },
    ],
  };
  assert.equal(statusCount(summary, "assigned", "out_for_delivery"), 5);
  assert.equal(statusCount(summary, "pending"), 0);
});
test("daily CSV preserves exact backend values and distinguishes gross value", () => {
  const csv = partnerReportCsv({
    daily: [
      {
        date: "2026-09-22",
        placed_orders: 3,
        orders: 2,
        cancelled: 1,
        gross_order_value: "551.25",
      },
    ],
  });
  assert.ok(
    csv.startsWith(
      "Date,Placed orders,Delivered orders,Cancelled orders,Delivered gross order value INR\r\n",
    ),
  );
  assert.ok(csv.endsWith("2026-09-22,3,2,1,551.25"));
});
