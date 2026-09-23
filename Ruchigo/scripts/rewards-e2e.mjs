import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Dedicated database and backend. Browser API requests are forwarded to this
// real backend; no mock responses and no shared preview policy changes.
const output = mkdtempSync(join(tmpdir(), "ruchigo-rewards-"));
const env = {
  ...process.env,
  DATABASE_URL: "",
  POSTGRES_URL: "",
  DJANGO_DEBUG: "True",
  DJANGO_DB_ENGINE: "sqlite",
  DJANGO_SQLITE_PATH: join(output, "test.sqlite3"),
};
const base = "http://127.0.0.1:5173",
  backend = "http://127.0.0.1:8013";
const password = `Local-${randomUUID()}`;
execFileSync(
  ".venv/bin/python",
  ["backend/manage.py", "migrate", "--noinput"],
  { env, stdio: "ignore" },
);
function db(code, payload = {}) {
  const result = execFileSync(
    ".venv/bin/python",
    [
      "backend/manage.py",
      "shell",
      "-c",
      `import json,sys; payload=json.loads(sys.stdin.read()); ${code}`,
    ],
    { env, input: JSON.stringify(payload), encoding: "utf8" },
  );
  return JSON.parse(result.trim().split("\n").at(-1));
}
const fixture = db(
  `from api.models import *
admin=User.objects.create_user('rewards-admin@example.test',password=payload['password'],role='admin')
customer=User.objects.create_user('rewards-customer@example.test',password=payload['password'],first_name='Rewards tester')
owner=User.objects.create_user('rewards-owner@example.test',password=payload['password'],role='restaurant')
rider=User.objects.create_user('rewards-rider@example.test',password=payload['password'],role='delivery')
kitchen=Restaurant.objects.create(owner=owner,name='Rewards test kitchen',city='Local QA',is_approved=True,latitude=28.6,longitude=77.2)
item=MenuItem.objects.create(restaurant=kitchen,name='Rewards test meal',price=400,stock_quantity=10,is_vegetarian=True)
address=Address.objects.create(user=customer,line1='Test doorstep 24',city='Local QA',state='Delhi',postal_code='110001',is_default=True,latitude=28.6,longitude=77.2)
print(json.dumps({'item':item.pk,'address':address.pk}))`,
  { password },
);
const server = spawn(
  ".venv/bin/python",
  ["backend/manage.py", "runserver", "127.0.0.1:8013", "--noreload"],
  { env, stdio: "ignore" },
);
let browser;
const errors = [];
async function api(path, token, body) {
  const response = await fetch(`${backend}/api/v1${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(response.ok, `${path}: ${response.status}`);
  return response.json();
}
async function login(role, name = role) {
  return api("/auth/login/", null, {
    email: `rewards-${name}@example.test`,
    password,
    role,
  });
}
async function pageFor(auth) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  await context.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({
      url: backend + url.pathname + url.search,
    });
    await route.fulfill({ response });
  });
  await context.addInitScript((auth) => {
    localStorage.setItem(
      "ruchigo-auth",
      JSON.stringify({
        user: auth.user,
        role: auth.user.role,
        token: auth.tokens.access,
        refreshToken: auth.tokens.refresh,
        expiresAt: Date.now() + 600000,
      }),
    );
    localStorage.setItem(
      "ruchigo-delivery-location",
      JSON.stringify({
        city: "Local QA",
        label: "Test doorstep 24",
        confirmed: true,
      }),
    );
  }, auth);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return page;
}
try {
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    try {
      await api("/checkout-options/");
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  assert.ok(ready, "Isolated test backend starts");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const admin = await login("admin");
  const adminPage = await pageFor(admin);
  await adminPage.goto(`${base}/admin-order-policy`);
  await adminPage
    .getByRole("button", { name: "Review rewards policy" })
    .click();
  await adminPage.getByLabel("Enable approved rewards on new orders").check();
  const settings = {
    "Points per ₹100 of food paid": "10",
    "Value per point (₹)": "0.5",
    "Maximum food covered by rewards (%)": "50",
    "Promotional cashback (%)": "10",
    "Maximum cashback per order (₹)": "50",
    "Referral credit per person (₹)": "30",
    "Minimum qualifying food paid (₹)": "100",
  };
  for (const [label, value] of Object.entries(settings))
    await adminPage.getByLabel(label, { exact: true }).fill(value);
  await adminPage.getByRole("button", { name: "Add level" }).click();
  await adminPage.getByLabel("Level name").fill("Regular");
  await adminPage.getByLabel("Qualifying points", { exact: true }).fill("20");
  await adminPage
    .getByLabel("Commercial approval reference / reason")
    .fill("Isolated QA database approval only; not a live commercial rule");
  await adminPage
    .getByRole("button", { name: "Save approved rewards policy" })
    .click();
  await expect(
    adminPage.getByText("Enabled · Policy revision 2", { exact: true }),
  ).toBeVisible();
  const customer = await login("customer"),
    token = customer.tokens.access;
  const owner = await login("restaurant", "owner"),
    rider = await login("delivery", "rider");
  await api("/cart/items/", token, { menu_item: fixture.item, quantity: 1 });
  const quote = await api("/cart/quote/", token, {
    address_id: fixture.address,
  });
  const seed = await api("/cart/checkout/", token, {
    address_id: fixture.address,
    quote_token: quote.quote_token,
    checkout_key: randomUUID(),
  });
  for (const status of ["confirmed", "preparing", "ready"])
    await api(`/orders/${seed.id}/status/`, owner.tokens.access, { status });
  await api(`/orders/${seed.id}/accept/`, rider.tokens.access, {});
  await api(`/orders/${seed.id}/pickup/`, rider.tokens.access, {});
  await api(`/orders/${seed.id}/status/`, rider.tokens.access, {
    status: "delivered",
    delivery_code: seed.delivery_code,
  });
  const balance = await api("/rewards/", token);
  assert.equal(balance.points, 40);
  assert.equal(Number(balance.credits), 40);
  const page = await pageFor(customer);
  await page.goto(`${base}/rewards`);
  await expect(
    page.getByRole("heading", { name: "Your meals. Your rewards." }),
  ).toBeVisible();
  await expect(page.locator(".rewards-points > strong")).toHaveText("40");
  await expect(page.locator(".reward-entry")).toHaveCount(1);
  await page.screenshot({
    path: join(output, "rewards-desktop.png"),
    fullPage: true,
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Rewards fits ${width}px`,
    );
    await page.screenshot({
      path: join(output, `rewards-${width}.png`),
      fullPage: true,
    });
  }
  await api("/cart/items/", token, { menu_item: fixture.item, quantity: 1 });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto(`${base}/checkout`);
  await page.getByRole("button", { name: "Use points", exact: true }).click();
  await page.getByRole("button", { name: "Use credits", exact: true }).click();
  await expect(
    page.locator(".bill-line").filter({ hasText: "Rewards used" }),
  ).toContainText("60");
  await expect(page.locator(".bill-total")).toContainText("380");
  await page.screenshot({
    path: join(output, "checkout-desktop.png"),
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Checkout fits 320px",
  );
  await page.screenshot({
    path: join(output, "checkout-320.png"),
    fullPage: true,
  });
  const createdPromise = page.waitForResponse(
    (response) =>
      response.url().includes("/cart/checkout/") &&
      response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  const placed = await (await createdPromise).json();
  assert.equal(Number(placed.reward_discount), 60);
  assert.equal(Number(placed.total), 380);
  await api(`/orders/${placed.id}/cancel/`, token, { reason: "changed_mind" });
  await page.goto(`${base}/rewards`);
  await expect(page.locator(".rewards-points > strong")).toHaveText("40");
  await expect(page.locator(".rewards-credit > strong")).toHaveText("₹40");
  await expect(
    page.getByRole("link", { name: "Rewards returned" }),
  ).toBeVisible();
  const zone = await api("/delivery-zones/", admin.tokens.access, {
    name: "QA central",
    city: "Local QA",
    latitude: 28.6,
    longitude: 77.2,
    radius_km: 5,
    max_delivery_km: 5,
    base_fee: 25,
    per_km_fee: 0,
    included_km: 0,
    minimum_order: 0,
    free_delivery_above: 500,
    is_active: true,
  });
  const zonePolicy = await api("/delivery-policy/", admin.tokens.access);
  await api("/delivery-policy/configure/", admin.tokens.access, {
    enabled: true,
    revision: zonePolicy.revision,
  });
  await adminPage.goto(`${base}/admin-delivery-zones`);
  await adminPage.getByRole("button", { name: "Add pricing rule" }).click();
  await adminPage
    .getByLabel("Customer-facing fee name")
    .fill("QA busy-hour delivery");
  await adminPage
    .getByLabel("Delivery zone", { exact: true })
    .selectOption(String(zone.id));
  await adminPage.getByLabel("Fee type").selectOption("surge");
  await adminPage.getByLabel("Additional delivery fee (₹)").fill("17");
  const local = (stamp) => {
    const date = new Date(stamp);
    return new Date(date - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  await adminPage
    .getByLabel("Window starts (your local time)")
    .fill(local(Date.now() - 300000));
  await adminPage
    .getByLabel("Window ends (your local time)")
    .fill(local(Date.now() + 3600000));
  await adminPage.getByLabel("Enable during the approved window").check();
  await adminPage
    .getByLabel("Pricing approval reference / reason")
    .fill("Isolated QA pricing window only");
  await adminPage
    .getByRole("button", { name: "Save approved pricing rule" })
    .click();
  await expect(
    adminPage.getByRole("heading", { name: "QA busy-hour delivery" }),
  ).toBeVisible();
  await adminPage.screenshot({
    path: join(output, "delivery-pricing-desktop.png"),
    fullPage: true,
  });
  await api("/cart/items/", token, { menu_item: fixture.item, quantity: 1 });
  const surcharge = await api("/cart/quote/", token, {
    address_id: fixture.address,
  });
  assert.equal(Number(surcharge.delivery_fee), 42);
  assert.equal(Number(surcharge.price_adjustment.fee), 17);
  await page.goto(`${base}/checkout`);
  await expect(
    page.getByText(
      "Delivery includes ₹17 temporary demand fee. QA busy-hour delivery.",
    ),
  ).toBeVisible();
  await adminPage.getByRole("button", { name: "Manage a city" }).click();
  await adminPage.getByLabel("City name", { exact: true }).fill("Local QA");
  await adminPage.getByLabel("Allow new orders in this city").uncheck();
  await adminPage
    .getByLabel("Operational reason")
    .fill("Isolated city pause test only");
  await adminPage
    .getByRole("button", { name: "Confirm city availability" })
    .click();
  await expect(
    adminPage.getByText("New orders paused", { exact: true }),
  ).toBeVisible();
  const paused = await fetch(`${backend}/api/v1/cart/quote/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ address_id: fixture.address }),
  });
  assert.equal(paused.status, 400);
  assert.equal((await api("/menu-items/", token)).count, 0);
  await adminPage
    .getByRole("button", { name: "Reopen city", exact: true })
    .click();
  await adminPage
    .getByLabel("Operational reason")
    .fill("Isolated city safely reopened");
  await adminPage
    .getByRole("button", { name: "Confirm city availability" })
    .click();
  await expect(
    adminPage.getByText("Open for eligible new orders", { exact: true }),
  ).toBeVisible();
  assert.equal(
    Number(
      (await api("/cart/quote/", token, { address_id: fixture.address }))
        .delivery_fee,
    ),
    42,
  );
  await adminPage.setViewportSize({ width: 390, height: 844 });
  assert.ok(
    await adminPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    "Pricing admin fits 390px",
  );
  await adminPage.screenshot({
    path: join(output, "delivery-pricing-390.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed: [
          "admin real policy configuration",
          "delivered/COD collection earns once",
          "database-backed rewards history",
          "desktop/390/320 layouts",
          "combined signed checkout redemption",
          "customer cancellation restoration",
          "admin-configured surcharge displayed in real checkout",
          "city pause/reopen gates catalog and checkout",
        ],
        browserErrors: errors,
        output,
      },
      null,
      2,
    ),
  );
} catch (error) {
  if (browser) {
    let index = 0;
    for (const context of browser.contexts())
      for (const page of context.pages()) {
        await page
          .screenshot({
            path: join(output, `failure-${index++}.png`),
            fullPage: true,
          })
          .catch(() => {});
      }
  }
  console.error(JSON.stringify({ output, browserErrors: errors }));
  throw error;
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
