import assert from "node:assert/strict";
import test from "node:test";
import { chartBuckets, chartScale } from "../src/lib/overviewChart.js";

const daily = Array.from({ length: 9 }, (_, i) => ({
  date: `2026-09-${String(i + 1).padStart(2, "0")}`,
  placed_orders: i + 1,
  orders: i,
  cancelled: 1,
  gross_order_value: "0.10",
}));
test("empty data stays empty", () =>
  assert.deepEqual(chartBuckets([], true), []));
test("daily buckets preserve every supplied date and value", () => {
  const result = chartBuckets(daily);
  assert.equal(result.length, 9);
  result.forEach((row, i) =>
    assert.deepEqual(row, {
      ...daily[i],
      end: daily[i].date,
      gross_order_value: 0.1,
    }),
  );
});
test("weekly buckets retain partial final groups and exact currency totals", () => {
  const result = chartBuckets(daily, true);
  assert.equal(result.length, 2);
  assert.deepEqual(result[0], {
    date: "2026-09-01",
    end: "2026-09-07",
    placed_orders: 28,
    orders: 21,
    cancelled: 7,
    gross_order_value: 0.7,
  });
  assert.deepEqual(result[1], {
    date: "2026-09-08",
    end: "2026-09-09",
    placed_orders: 17,
    orders: 15,
    cancelled: 2,
    gross_order_value: 0.2,
  });
});
test("aggregation never mutates API data", () => {
  const original = structuredClone(daily);
  chartBuckets(daily, true);
  assert.deepEqual(daily, original);
});
test("zero-data scales remain finite", () => {
  assert.equal(chartScale([]), 4);
  assert.equal(chartScale([0, 0], true), 100);
});
test("order ticks are whole counts and never clip the largest value", () => {
  for (let max = 1; max <= 10000; max++) {
    const scale = chartScale([0, max]);
    assert.ok(scale >= max);
    assert.equal(scale % 4, 0);
  }
});
test("currency scales include paise and large order totals", () => {
  for (const max of [0.01, 0.13, 1.99, 6.6, 19.2, 5552.2, 9999999.99])
    assert.ok(chartScale([0, max], true) >= max);
});
