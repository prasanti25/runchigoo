import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Local-only, isolated customer/cart/address. Never place an order or change
// a real address, delivery policy or restaurant. Backend tests cover checkout.
const base = "http://127.0.0.1:5173";
const marker = `checkout-city-${randomUUID()}`;
const password = `Local-${randomUUID()}`;
const env = {
  ...process.env,
  DATABASE_URL: "",
  POSTGRES_URL: "",
  DJANGO_DEBUG: "True",
  DJANGO_DB_ENGINE: "sqlite",
  DJANGO_SQLITE_PATH: "/private/tmp/ruchigo-product-preview.sqlite3",
};
function db(code, values) {
  const result = execFileSync(
    ".venv/bin/python",
    [
      "backend/manage.py",
      "shell",
      "-c",
      `import json,sys; payload=json.loads(sys.stdin.read()); ${code}`,
    ],
    { env, input: JSON.stringify(values), encoding: "utf8" },
  );
  return JSON.parse(result.trim().split("\n").at(-1));
}
const fixture = db(
  `from django.db import transaction; from api.models import User,Restaurant,Address,MenuItem,DeliveryPolicy
with transaction.atomic():
 assert not DeliveryPolicy.objects.filter(enabled=True).exists(), 'This screenshot regression uses standard city pricing; do not change shared policy'
 customer=User.objects.create_user(payload['marker']+'@example.test',password=payload['password'],role='customer')
 owner=User.objects.create_user(payload['marker']+'-owner@example.test',role='restaurant')
 restaurant=Restaurant.objects.create(owner=owner,name='Temporary checkout city kitchen',city='Delhi',is_approved=True)
 item=MenuItem.objects.create(restaurant=restaurant,name='Checkout test meal',price='449.00')
 address=Address.objects.create(user=customer,label='Home',line1='Checkout test home',line2='Floor 2, test lane',city='South Delhi',state='Delhi',postal_code='110074',is_default=True)
 print(json.dumps({'customer':customer.pk,'owner':owner.pk,'restaurant':restaurant.pk,'item':item.pk,'address':address.pk}))`,
  { marker, password },
);
let browser;
const errors = [],
  quoteStatuses = [];
async function api(path, { token, method = "GET", body } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(20000),
  });
  assert.ok(response.ok, `${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}
try {
  const auth = await api("/auth/login/", {
    method: "POST",
    body: { email: `${marker}@example.test`, password, role: "customer" },
  });
  const token = auth.tokens.access;
  await api("/cart/items/", {
    token,
    method: "POST",
    body: { menu_item: fixture.item, quantity: 1 },
  });
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 900 },
  });
  await context.addInitScript(({ user, tokens }) => {
    localStorage.setItem(
      "ruchigo-auth",
      JSON.stringify({
        user,
        role: user.role,
        token: tokens.access,
        refreshToken: tokens.refresh,
        expiresAt: Date.now() + 600000,
      }),
    );
  }, auth);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().endsWith("/cart/quote/"))
      quoteStatuses.push(response.status());
  });
  await page.goto(`${base}/checkout`, { waitUntil: "networkidle" });
  const bill = page.locator(".sticky-summary");
  await expect(bill).toContainText("Delivery available");
  await expect(bill.locator(".bill-total")).toContainText("₹489");
  await expect(
    page.getByRole("button", { name: "Place order", exact: true }),
  ).toBeEnabled();
  await expect(page.locator(".location-trigger")).toContainText(
    "Checkout test home",
  );
  assert.equal(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("ruchigo-delivery-location"))
          .address_id,
    ),
    fixture.address,
  );
  for (const width of [390, 320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `No overflow at ${width}`,
    );
    await bill.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/private/tmp/ruchigo-checkout-city-${width}.png`,
      fullPage: true,
    });
  }
  await api(`/addresses/${fixture.address}/`, {
    token,
    method: "PATCH",
    body: { city: "Noida" },
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect(bill.getByRole("alert")).toContainText(
    "This kitchen delivers in Delhi",
  );
  await expect(bill.getByRole("alert")).not.toContainText("address id");
  await expect(bill.getByRole("alert")).not.toContainText("address_id");
  await expect(bill).toContainText("Not calculated");
  await expect(
    page.getByRole("button", { name: "Place order", exact: true }),
  ).toBeDisabled();
  await expect(
    bill.getByRole("button", { name: "Check address / pin" }),
  ).toBeVisible();
  await api(`/addresses/${fixture.address}/`, {
    token,
    method: "PATCH",
    body: { city: "South Delhi" },
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect(bill).toContainText("Delivery available");
  await expect(
    page.getByRole("button", { name: "Place order", exact: true }),
  ).toBeEnabled();
  const saved = await api(`/addresses/${fixture.address}/`, { token });
  assert.equal(saved.city, "South Delhi");
  assert.equal(saved.line2, "Floor 2, test lane");
  const discovery = await api(
    "/discovery/?city=South%20Delhi&q=Temporary%20checkout%20city%20kitchen",
  );
  assert.ok(
    discovery.restaurants.some(
      (restaurant) => restaurant.id === fixture.restaurant,
    ),
    "Selected South Delhi address must not hide Delhi restaurants",
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      passed: [
        "South Delhi saved address quotes Delhi kitchen without pin under standard pricing",
        "₹449 meal + ₹40 delivery = ₹489; Place order enabled",
        "Selected checkout address shared with header",
        "Noida remains blocked with readable error and address recovery",
        "Switching back restores quote; address details preserved",
        "390/320/1440px responsive layout",
      ],
      quoteStatuses,
      browserErrors: errors,
      ordersPlaced: 0,
    }),
  );
} finally {
  await browser?.close();
  console.log(
    db(
      `from api.models import User,Restaurant,Order
customer=User.objects.get(pk=payload['customer'],email=payload['marker']+'@example.test')
owner=User.objects.get(pk=payload['owner'],email=payload['marker']+'-owner@example.test')
restaurant=Restaurant.objects.get(pk=payload['restaurant'],owner=owner)
assert not Order.objects.filter(customer=customer).exists(), 'Do not delete order history'
customer.delete()
restaurant.delete()
owner.delete()
print(json.dumps({'temporary_fixture_removed':True}))`,
      { ...fixture, marker },
    ),
  );
}
