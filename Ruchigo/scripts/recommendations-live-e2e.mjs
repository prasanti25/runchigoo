import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Real local API + configured providers. No mocked AI response or saved orders.
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
const errors = [];
const reports = [];
page.on("pageerror", (error) => errors.push(error.message));
async function pick(name) {
  const started = Date.now();
  const response = page.waitForResponse(
    (result) =>
      result.url().endsWith("/discovery/recommendations/") &&
      result.request().method() === "POST",
  );
  await page.getByRole("button", { name, exact: true }).click();
  const result = await response;
  assert.equal(result.status(), 200);
  const body = await result.json();
  assert.equal(body.source, "gemini", `Live AI required, got ${body.status}`);
  await expect(
    page.getByText("PICKS FOR YOUR CRAVING", { exact: true }),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    /gemini-|Ranked by|Explanations use menu facts/,
  );
  assert.ok(body.items.length > 0);
  assert.equal(
    new Set(body.items.map((item) => item.id)).size,
    body.items.length,
  );
  assert.ok(
    body.items.every((item) => item.is_available && item.match_reasons.length),
  );
  reports.push({
    scenario: name,
    source: body.source,
    model: body.model,
    status: body.status,
    elapsed_ms: Date.now() - started,
    dishes: body.items.map((item) => ({
      name: item.name,
      price: item.price,
      reasons: item.match_reasons,
    })),
  });
  return body;
}
try {
  await page.goto(`${base}/for-you?tab=quick`, { waitUntil: "networkidle" });
  const veg = await pick("Veg under ₹250");
  assert.ok(
    veg.items.every((item) => item.is_vegetarian && Number(item.price) <= 250),
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-live-ai-budget.png",
    fullPage: true,
  });
  await page.getByLabel("What sounds good?").fill("New preference");
  await expect(page.getByText(/Preferences changed/)).toBeVisible();
  await expect(page.locator(".recommendations-section .food-card")).toHaveCount(
    0,
  );
  const pizza = await pick("Pizza night");
  assert.ok(
    pizza.items.every(
      (item) =>
        /pizza|margherita/i.test(item.name) && Number(item.price) <= 500,
    ),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const coffee = await pick("Coffee break");
  assert.ok(
    coffee.items.every(
      (item) =>
        /coffee/i.test(item.name) &&
        Number(item.price) <= 150 &&
        item.preparation_minutes <= 20,
    ),
  );
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-live-ai-coffee-mobile.png",
    fullPage: true,
  });
  const emptyResponse = page.waitForResponse((result) =>
    result.url().endsWith("/discovery/recommendations/"),
  );
  await page.getByLabel("What sounds good?").fill("Pizza under 50");
  await page.getByRole("button", { name: "Find my food", exact: true }).click();
  assert.deepEqual((await (await emptyResponse).json()).items, []);
  await expect(
    page.getByRole("heading", { name: "Let’s try another craving" }),
  ).toBeVisible();
  await page.locator(".location-trigger").click();
  const locationResponse = page.waitForResponse((result) =>
    result.url().endsWith("/location/approximate/"),
  );
  await page
    .getByRole("button", { name: "Use approximate network location" })
    .click();
  const location = await locationResponse;
  assert.equal(location.status(), 200);
  const approximate = await location.json();
  assert.equal(approximate.source, "ipinfo");
  assert.equal(approximate.accuracy, "approximate");
  assert.ok(
    !("ip" in approximate) &&
      !("token" in approximate) &&
      !("latitude" in approximate),
  );
  await expect(page.getByText("SUGGESTED CITY", { exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toContainText(
    /IPINFO|Local preview|development server/i,
  );
  await expect(page.getByRole("dialog")).toContainText(
    "This is an approximate location. Please confirm your city.",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-ipinfo-city-mobile.png",
    fullPage: true,
  });
  if (approximate.service_city) {
    await page
      .getByRole("button", {
        name: `Use ${approximate.service_city}`,
        exact: true,
      })
      .click();
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("ruchigo-delivery-location")),
    );
    assert.equal(saved.city, approximate.service_city);
    assert.ok(
      !saved.latitude && !saved.longitude,
      "IP city must not become fake GPS coordinates",
    );
  }
  reports.push({
    scenario: "IPinfo location",
    city: approximate.city,
    accuracy: approximate.accuracy,
    local_preview: approximate.local_preview,
  });
  await page.getByLabel("Meal budget").selectOption("");
  await page.getByLabel("Preparation time").selectOption("");
  for (const query of ["uhbh", "zzzxq", "what is the stock price"]) {
    const response = page.waitForResponse((result) =>
      result.url().endsWith("/discovery/recommendations/"),
    );
    await page.getByLabel("What sounds good?").fill(query);
    await page
      .getByRole("button", { name: "Find my food", exact: true })
      .click();
    const body = await (await response).json();
    assert.equal(body.status, "needs_clarification", query);
    assert.deepEqual(
      body.items,
      [],
      "Unclear text must never create fake matches",
    );
    await expect(
      page.getByRole("heading", { name: "What would you like to eat?" }),
    ).toBeVisible();
    await expect(
      page.locator(".recommendations-section .food-card"),
    ).toHaveCount(0);
    reports.push({
      scenario: `Unclear input: ${query}`,
      status: body.status,
      count: body.items.length,
    });
    if (query === "uhbh")
      await page.screenshot({
        path: "/private/tmp/ruchigo-unclear-craving-fixed.png",
        fullPage: true,
      });
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ passed: reports, browserErrors: errors }, null, 2),
  );
} finally {
  await browser.close();
}
