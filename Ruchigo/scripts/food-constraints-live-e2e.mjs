import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Anonymous food suggestions only: no accounts, orders, preferences or payments
// are created/changed. Production opt-in exercises the real provider and catalog.
const base = process.env.RUCHIGO_SMOKE_URL || "http://127.0.0.1:5173";
assert.ok(
  ["http://127.0.0.1:5173", "https://runchigoo.vercel.app"].includes(base),
);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
const evidence = [];
page.on("pageerror", (error) => errors.push(error.message));
try {
  await page.goto(`${base}/for-you?tab=chat`, { waitUntil: "networkidle" });
  const assistant = page.getByRole("region", { name: "RuchiGo assistant" });
  async function ask(message) {
    const response = page.waitForResponse(
      (r) =>
        r.url().endsWith("/intelligence/assistant/") &&
        r.request().method() === "POST",
      { timeout: 55000 },
    );
    await page.getByRole("textbox", { name: "Message RuchiGo" }).fill(message);
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    const result = await response;
    assert.equal(result.status(), 200);
    const data = await result.json();
    await expect(assistant.locator(".assistant-thinking")).toHaveCount(0);
    evidence.push({
      source: data.source,
      status: data.status,
      items: data.items.map((item) => ({
        name: item.name,
        vegetarian: item.is_vegetarian,
      })),
    });
    return data;
  }
  const first = await ask("i would like to have a non veg pizza");
  assert.equal(
    first.source,
    "gemini",
    "This test requires a real Gemini response, not a fallback",
  );
  assert.ok(first.items.length > 0);
  assert.ok(
    first.items.every(
      (item) => !item.is_vegetarian && /pizza/i.test(item.name),
    ),
  );
  const followup = await ask("You showing me veg also i said just non veg");
  assert.ok(followup.items.length > 0);
  assert.ok(
    followup.items.every(
      (item) => !item.is_vegetarian && /pizza/i.test(item.name),
    ),
  );
  await expect(assistant.locator(".assistant-results .food-card")).toHaveCount(
    followup.items.length,
  );
  await expect(assistant.locator(".assistant-results")).not.toContainText(
    "Cold Coffee",
  );
  const prefix = base.startsWith("https") ? "live" : "local";
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `Chat overflow at ${width}`,
    );
    await page.screenshot({
      path: `/private/tmp/ruchigo-${prefix}-nonveg-chat-${width}.png`,
      fullPage: true,
    });
  }
  const budget = await ask("under 200 instead");
  assert.deepEqual(budget.items, []);
  assert.equal(budget.no_match_reason, "budget");
  assert.equal(budget.applied_filters.non_vegetarian, true);
  assert.match(budget.query, /pizza/);
  await expect(assistant.locator(".assistant-results")).toHaveCount(0);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      provider: "real Gemini; no mocked responses",
      scenarios: evidence,
      browserErrors: errors,
      businessWrites: 0,
    }),
  );
} finally {
  await browser.close();
}
