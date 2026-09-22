import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage();
try {
  await page.goto("http://127.0.0.1:5173/terms", { waitUntil: "networkidle" });
  let attempts = 0;
  const endpoint = "**/api/v1/retry-probe/";
  await page.route(endpoint, (route) => {
    attempts += 1;
    return attempts === 1
      ? route.fulfill({
          status: 429,
          headers: { "Retry-After": "0" },
          json: { detail: "Short cooldown" },
        })
      : route.fulfill({ json: { recovered: true } });
  });
  const recovered = await page.evaluate(async () =>
    (await import("/src/lib/api.js")).apiRequest("/retry-probe/"),
  );
  assert.equal(recovered.recovered, true);
  assert.equal(attempts, 2);
  await page.unroute(endpoint);
  attempts = 0;
  await page.route(endpoint, (route) => {
    attempts += 1;
    return route.fulfill({
      status: 429,
      headers: { "Retry-After": "0" },
      json: { detail: "Short cooldown" },
    });
  });
  const failedWrite = await page.evaluate(async () => {
    try {
      await (
        await import("/src/lib/api.js")
      ).apiRequest("/retry-probe/", { method: "POST", body: { test: true } });
    } catch (error) {
      return error.status;
    }
  });
  assert.equal(failedWrite, 429);
  assert.equal(attempts, 1, "Writes must never be replayed automatically");
  await page.unroute(endpoint);
  attempts = 0;
  await page.route(endpoint, (route) => {
    attempts += 1;
    return route.fulfill({
      status: 429,
      headers: { "Retry-After": "1" },
      json: { detail: "Short cooldown" },
    });
  });
  const aborted = await page.evaluate(async () => {
    const { apiRequest } = await import("/src/lib/api.js");
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 150);
    try {
      await apiRequest("/retry-probe/", { signal: controller.signal });
    } catch (error) {
      return error.name;
    } finally {
      clearTimeout(timer);
    }
  });
  assert.equal(aborted, "AbortError");
  assert.equal(attempts, 1, "Aborted navigation must not trigger a retry");
  console.log(
    "PASS: short read cooldown recovers; writes never replay; abort cancels retry.",
  );
} finally {
  await browser.close();
}
