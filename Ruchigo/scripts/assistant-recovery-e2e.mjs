import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Exact failed recording scenario, real local API/Gemini/catalog. No menu,
// address, preference, order or payment is created or changed.
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [], passed = [];
async function scenario(width) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 } });
  await context.addInitScript(() => localStorage.setItem("ruchigo-delivery-location", JSON.stringify({ city: "Delhi" })));
  const page = await context.newPage();
  page.on("pageerror", error => errors.push(error.message));
  await page.goto("http://127.0.0.1:5173/for-you?tab=chat", { waitUntil: "networkidle" });
  const assistant = page.getByRole("region", { name: "RuchiGo assistant" });
  async function send(text, action) {
    const pending = page.waitForResponse(response => response.url().endsWith("/intelligence/assistant/") && response.request().method() === "POST", { timeout: 30000 });
    if (action) await action.click();
    else {
      await page.getByRole("textbox", { name: "Message RuchiGo" }).fill(text);
      await page.getByRole("button", { name: "Send message", exact: true }).click();
    }
    const response = await pending;
    assert.equal(response.status(), 200);
    const data = await response.json();
    await expect(assistant.locator(".assistant-thinking")).toHaveCount(0, { timeout: 30000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "No overflow");
    return data;
  }
  const first = await send("I want a pizza");
  assert.equal(first.no_match_reason, "city");
  assert.deepEqual(first.items, []);
  await expect(assistant.locator(".assistant-bubble.assistant").last()).toContainText("Noida");
  if (width > 500) {
    const followup = await send("pizza?");
    assert.equal(followup.no_match_reason, "city");
  }
  const chosen = await send(null, page.getByRole("button", { name: "Browse Noida menu", exact: true }));
  assert.ok(chosen.items.length >= 2);
  assert.ok(chosen.items.every(item => /pizza|margherita/i.test(item.name) && item.restaurant_detail.city === "Noida"));
  await expect(assistant.locator(".assistant-scope")).toContainText("Searching menus in Noida");
  const location = await page.evaluate(() => JSON.parse(localStorage.getItem("ruchigo-delivery-location")));
  assert.equal(location.city, "Delhi", "Browsing does not overwrite delivery location");
  await expect(assistant.locator(".food-card").first()).toBeVisible();
  await page.screenshot({ path: `/private/tmp/ruchigo-assistant-recovery-${width}.png`, fullPage: true });
  await page.getByRole("button", { name: "Back to Delhi", exact: true }).click();
  await expect(assistant.locator(".assistant-scope")).toContainText("Searching menus in Delhi");
  if (width > 500) {
    const absent = await send("butter chicken");
    assert.equal(absent.no_match_reason, "current_menu");
    assert.deepEqual(absent.items, []);
    const alternative = await send(null, page.getByRole("button", { name: "Find Chicken Biryani", exact: true }));
    assert.ok(alternative.items.some(item => item.name === "Chicken Biryani"));
    await page.screenshot({ path: "/private/tmp/ruchigo-assistant-alternative.png", fullPage: true });
  }
  passed.push(`${width}px: Delhi pizza explains Noida scope; explicit browse action returns menu cards; delivery location unchanged; no overflow`);
  await context.close();
}
try {
  await scenario(1440);
  await scenario(390);
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed, browserErrors: errors.length }, null, 2));
} finally { await browser.close(); }
