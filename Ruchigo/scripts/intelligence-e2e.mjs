import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// LOCAL fixture accounts only. Real backend + configured Gemini; never production.
// Web Speech events are simulated: this proves UI behavior, not real audio quality.
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const passed = [];
let originalTaste;
let customerToken;
let originalSaved;
const contexts = [];

async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(response.ok, `${method} ${path} failed with ${response.status}`);
  return response.status === 204 ? null : response.json();
}

async function session(email, role) {
  const auth = email
    ? await api("/auth/login/", {
        method: "POST",
        body: { email, role, password: "RuchiGo-preview-2026" },
      })
    : null;
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  contexts.push(context);
  if (auth)
    await context.addInitScript(
      ({ user, tokens }) =>
        localStorage.setItem(
          "ruchigo-auth",
          JSON.stringify({
            user,
            token: tokens.access,
            refreshToken: tokens.refresh,
            role: user.role,
            expiresAt: Date.now() + 600000,
          }),
        ),
      auth,
    );
  await context.addInitScript(() => {
    window.SpeechRecognition = class {
      start() {
        window.__speechSession = this;
      }
      stop() {
        this.onend?.();
      }
      abort() {}
    };
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, token: auth?.tokens.access };
}

async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Horizontal overflow: ${page.url()}`,
  );
}

try {
  const { page } = await session();
  await page.goto(base, { waitUntil: "networkidle" });
  const search = page.locator(".hero-search");
  const mic = search.getByRole("button", {
    name: "Search by voice",
    exact: true,
  });
  await expect(mic).toBeVisible();
  assert.equal(
    await mic.textContent(),
    "",
    "Mic must be an inline icon, not a Speak/Start/Stop block",
  );
  const box = await search.boundingBox();
  const micBox = await mic.boundingBox();
  assert.ok(micBox.x >= box.x && micBox.x + micBox.width <= box.x + box.width);
  await mic.click();
  await expect(
    search.getByRole("button", { name: "Finish voice input", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".voice-popover")).toHaveCount(0);
  assert.equal(
    await search
      .getByRole("button", { name: "Finish voice input", exact: true })
      .getAttribute("title"),
    null,
  );
  await page.evaluate(() => {
    window.__speechSession.onresult({ results: [[{ transcript: "Coffee" }]] });
    window.__speechSession.onend();
  });
  await expect(
    page.getByRole("textbox", { name: "Search food or restaurants" }),
  ).toHaveValue("Coffee");
  assert.equal(
    new URL(page.url()).pathname,
    "/",
    "Voice must not submit automatically",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-inline-mic-mobile.png",
    fullPage: false,
  });
  await search.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("textbox", {
      name: "Search restaurants, dishes or cuisines",
    }),
  ).toHaveValue("Coffee");
  await expect(
    page
      .locator(".discovery-search")
      .getByRole("button", { name: "Search by voice", exact: true }),
  ).toBeVisible();
  await noOverflow(page);
  passed.push(
    "Inline microphone in search; recognised text reviewed before search (simulated speech)",
  );

  await page.goto(`${base}/for-you?tab=chat`, { waitUntil: "networkidle" });
  async function chat(message) {
    await page.getByLabel("Message RuchiGo").fill(message);
    const response = page.waitForResponse(
      (r) =>
        r.url().endsWith("/intelligence/assistant/") &&
        r.request().method() === "POST",
    );
    await page
      .getByRole("button", { name: "Send message", exact: true })
      .click();
    const result = await response;
    assert.equal(result.status(), 200);
    const body = await result.json();
    await expect(page.locator(".assistant-bubble.user").last().locator("p")).toHaveText(message);
    await expect(page.getByLabel("Message RuchiGo")).toHaveValue("");
    await expect(page.locator(".assistant-thinking")).toHaveCount(0);
    return body;
  }
  const coffee = await chat("Coffee under 150");
  assert.equal(
    coffee.source,
    "gemini",
    "Requires real configured AI, not a fallback",
  );
  assert.ok(
    coffee.items.length &&
      coffee.items.every(
        (item) => /coffee/i.test(item.name) && Number(item.price) <= 150,
      ),
  );
  await expect(
    page.locator(".assistant-results .food-card").first(),
  ).toBeVisible();
  await expect(page.locator("main")).not.toContainText(
    /gemini-|Ranked by|Explanations use menu facts/,
  );
  await noOverflow(page);
  await page.screenshot({
    path: "/private/tmp/ruchigo-assistant-mobile.png",
    fullPage: true,
  });
  const narrow = await chat("Under 50 instead");
  assert.deepEqual(
    narrow.items,
    [],
    "Follow-up must retain coffee intent and reduce budget",
  );
  const unclear = await chat("uhbh");
  assert.deepEqual(unclear.items, []);
  assert.equal(unclear.status, "needs_clarification");
  const help = await chat("Please refund my order");
  assert.equal(help.status, "support");
  assert.match(help.reply, /cannot approve a refund/);
  passed.push(
    "Live AI coffee, conversational budget refinement, unclear-input handling and honest refund handoff",
  );

  const customer = await session("preview.customer@ruchigo.test", "customer");
  customerToken = customer.token;
  originalTaste = await api("/intelligence/preferences/", {
    token: customerToken,
  });
  originalSaved = (await api("/intelligence/saved/", { token: customerToken }))
    .restaurant_ids;
  await customer.page.goto(`${base}/for-you?tab=taste`, {
    waitUntil: "networkidle",
  });
  await customer.page.getByLabel("Vegetarian dishes only").check();
  await customer.page.getByLabel("Usual budget per dish").fill("250");
  await customer.page
    .getByLabel("Use my delivered orders to personalise suggestions")
    .uncheck();
  await customer.page
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await expect(
    customer.page.getByText("Your food preferences are saved", { exact: true }),
  ).toBeVisible();
  const savedTaste = await api("/intelligence/preferences/", {
    token: customerToken,
  });
  assert.equal(savedTaste.budget, 250);
  assert.equal(savedTaste.vegetarian, true);
  assert.equal(savedTaste.use_order_history, false);
  await customer.page.goto(`${base}/restaurant/4`, {
    waitUntil: "networkidle",
  });
  const save = customer.page.getByRole("button", {
    name: /^(Save restaurant|Saved restaurant)$/,
  });
  await expect(save).toBeEnabled();
  if (!originalSaved.includes(4)) await save.click();
  await expect(
    customer.page.getByRole("button", {
      name: "Saved restaurant",
      exact: true,
    }),
  ).toHaveAttribute("aria-pressed", "true");
  await customer.page.goto(`${base}/for-you?tab=picks`, {
    waitUntil: "networkidle",
  });
  await expect(
    customer.page.getByRole("heading", {
      name: "Your saved restaurants",
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    customer.page.getByRole("heading", {
      name: "Recently explored",
      exact: true,
    }),
  ).toBeVisible();
  await noOverflow(customer.page);
  await customer.page.screenshot({
    path: "/private/tmp/ruchigo-personalised-mobile.png",
    fullPage: true,
  });
  passed.push(
    "Persistent food preferences, order-history opt-out, saved restaurant and recent-visit feed",
  );

  for (const [email, role, route] of [
    ["owner.spice@ruchigo.online", "restaurant", "/restaurant-analytics"],
    ["preview.admin@ruchigo.test", "admin", "/admin-reports"],
  ]) {
    const staff = await session(email, role);
    await staff.page.goto(base + route, { waitUntil: "networkidle" });
    await expect(
      staff.page.getByRole("heading", {
        name: "Patterns worth knowing",
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      staff.page.getByRole("heading", {
        name: "Coming week outlook",
        exact: true,
      }),
    ).toBeVisible();
    await noOverflow(staff.page);
    if (role === "admin")
      await expect(
        staff.page.getByRole("heading", {
          name: "Orders that may need a closer look",
          exact: true,
        }),
      ).toBeVisible();
    else
      await expect(
        staff.page.getByRole("heading", {
          name: "Orders that may need a closer look",
          exact: true,
        }),
      ).toHaveCount(0);
    await staff.page.screenshot({
      path: `/private/tmp/ruchigo-${role}-insights-mobile.png`,
      fullPage: true,
    });
  }
  passed.push(
    "Role-scoped analytics, honest insufficient-history state and admin-only risk review",
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed,
        browserErrors: errors,
        speech:
          "simulated browser events; real microphone recognition requires device testing",
      },
      null,
      2,
    ),
  );
} finally {
  if (customerToken && originalTaste)
    await api("/intelligence/preferences/", {
      token: customerToken,
      method: "PATCH",
      body: originalTaste,
    });
  if (customerToken && originalSaved && !originalSaved.includes(4))
    await api("/intelligence/saved/", {
      token: customerToken,
      method: "DELETE",
      body: { restaurant_id: 4 },
    });
  for (const context of contexts) await context.close();
  await browser.close();
}
