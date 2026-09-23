import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

const base = "http://127.0.0.1:5173";
const marker = `location-analytics-${randomUUID()}`;
const password = `Local-${randomUUID()}`;
const city = `Local QA ${marker.slice(-8)}`;
const pairCode = `PAIR${marker.slice(-8).toUpperCase()}`;
const feeCode = `FEE${marker.slice(-8).toUpperCase()}`;
const env = {
  ...process.env,
  DATABASE_URL: "",
  POSTGRES_URL: "",
  DJANGO_DEBUG: "True",
  DJANGO_DB_ENGINE: "sqlite",
  DJANGO_SQLITE_PATH: "/private/tmp/ruchigo-product-preview.sqlite3",
};
function db(code, values) {
  const output = execFileSync(
    ".venv/bin/python",
    [
      "backend/manage.py",
      "shell",
      "-c",
      `import json,sys; payload=json.loads(sys.stdin.read()); ${code}`,
    ],
    { env, input: JSON.stringify(values), encoding: "utf8" },
  );
  return JSON.parse(output.trim().split("\n").at(-1));
}
const fixture = db(
  `from django.db import transaction; from api.models import *
with transaction.atomic():
 assert not DeliveryPolicy.objects.filter(enabled=True).exists(), 'Use a dedicated local standard-policy preview; do not change shared policy'
 original=list(Order.objects.filter(pk__in=[16,37]).values('id','status','total','updated_at'))
 customer=User.objects.create_user(payload['marker']+'@example.test',password=payload['password'],first_name='Local QA')
 admin=User.objects.create_user(payload['marker']+'-admin@example.test',password=payload['password'],role='admin')
 owners=[]; kitchens=[]; items=[]
 for index,lat in enumerate([28.60,28.70]):
  owner=User.objects.create_user(payload['marker']+str(index)+'@example.test',password=payload['password'],role='restaurant'); owners.append(owner.pk)
  kitchen=Restaurant.objects.create(owner=owner,name='Local QA '+('Nearby kitchen' if index==0 else 'Further kitchen'),city=payload['city'],is_approved=True,latitude=lat,longitude=77.2,scheduling_enabled=True,opening_hours=[{'closed':False,'open':'00:00','close':'24:00'}]*7); kitchens.append(kitchen.pk)
  item=MenuItem.objects.create(restaurant=kitchen,name='Local QA meal',price=100,is_vegetarian=True); items.append(item.pk)
 address=Address.objects.create(user=customer,line1='Local QA doorstep',city=payload['city'],state='Delhi',postal_code='110001',latitude=28.6,longitude=77.2,is_default=True)
 order=Order.objects.create(customer=customer,restaurant_id=kitchens[0],delivery_address=address,status='delivered',subtotal=100,delivery_fee=40,total=140)
 OrderItem.objects.create(order=order,menu_item_id=items[0],name='Local QA meal',quantity=1,unit_price=100,total_price=100)
 Payment.objects.create(order=order,amount=140,status='paid')
 SavedRestaurant.objects.create(user=customer,restaurant_id=kitchens[0]); Wishlist.objects.create(user=customer,menu_item_id=items[0])
 print(json.dumps({'customer':customer.pk,'admin':admin.pk,'owners':owners,'kitchens':kitchens,'items':items,'order':order.pk,'original':original},default=str))`,
  { marker, password, city },
);
let browser;
const errors = [],
  passed = [];
async function api(path, token, body) {
  const response = await fetch(base + "/api/v1" + path, {
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
async function session(email, role) {
  const auth = await api("/auth/login/", null, { email, password, role });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    geolocation: { latitude: 28.6315, longitude: 77.2167 },
    permissions: ["geolocation"],
  });
  await context.addInitScript(
    ({ auth, city }) => {
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
          city,
          latitude: 28.6,
          longitude: 77.2,
          label: "Local QA doorstep",
          confirmed: true,
        }),
      );
    },
    { auth, city },
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, token: auth.tokens.access };
}
try {
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const { page, token } = await session(`${marker}@example.test`, "customer");
  await page.goto(base, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Good food near your address" }),
  ).toBeVisible();
  await expect(
    page
      .locator(`.restaurant-grid a[href="/restaurant/${fixture.kitchens[0]}"]`)
      .first(),
  ).toBeVisible();
  await expect(
    page.locator(
      `.restaurant-grid a[href="/restaurant/${fixture.kitchens[1]}"]`,
    ),
  ).toHaveCount(0);
  await page.goto(base + "/search", { waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Near me", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("combobox", { name: "Sort results" }),
  ).toHaveValue("distance");
  await page.goto(base + "/search?area=city", { waitUntil: "networkidle" });
  await expect(
    page.locator(`a[href="/restaurant/${fixture.kitchens[1]}"]`).first(),
  ).toBeVisible();
  passed.push(
    "Selected pin automatically limits home/search/feed; explicit city browsing remains available",
  );
  await page.goto(base + "/profile", { waitUntil: "networkidle" });
  const panel = page.getByRole("region", { name: "Your food activity" });
  await expect(panel).toContainText("₹140");
  await expect(panel).toContainText("Local QA meal");
  await panel.getByRole("button", { name: "90 days", exact: true }).click();
  await expect(panel).toContainText("₹140");
  await panel
    .locator("summary")
    .filter({ hasText: "Monthly spending" })
    .click();
  await expect(panel.locator(".shopping-month-grid>div")).toHaveCount(12);
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await panel.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/private/tmp/ruchigo-customer-analytics-${width}.png`,
      fullPage: true,
    });
  }
  const facts = await api("/customer-insights/", token);
  assert.equal(facts.lifetime.orders, 1);
  assert.equal(Number(facts.lifetime.spending.net), 140);
  passed.push(
    "Owned profile analytics persist actual paid history, favourites, 12 months, ranges and responsive layouts",
  );
  const kitchen = await session(`${marker}0@example.test`, "restaurant");
  await kitchen.page.goto(base + "/restaurant-offers", {
    waitUntil: "networkidle",
  });
  await kitchen.page
    .getByRole("button", { name: "Coupons", exact: true })
    .click();
  await kitchen.page
    .getByRole("button", { name: "Create coupon", exact: true })
    .click();
  const form = kitchen.page.getByRole("dialog");
  const code = `QA${marker.slice(-8).toUpperCase()}`;
  await form.getByLabel("Coupon code", { exact: true }).fill(code);
  await form.getByLabel("Fixed amount off (₹)", { exact: true }).fill("20");
  await form.getByLabel("Minimum order (₹)", { exact: true }).fill("100");
  await form.getByLabel("Starts", { exact: true }).fill("2026-09-01T00:00");
  await form.getByLabel("Ends", { exact: true }).fill("2026-12-31T23:59");
  await form.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(form).toHaveCount(0);
  const coupons = await api("/coupons/", kitchen.token);
  assert.equal(coupons.results[0].restaurant, fixture.kitchens[0]);
  passed.push(
    "Restaurant creates its own coupon through the real UI/API with owned persistence",
  );
  await api("/cart/items/", token, {
    menu_item: fixture.items[0],
    quantity: 1,
  });
  await page.setViewportSize({ width: 390, height: 1000 });
  await page.goto(base + "/checkout", { waitUntil: "networkidle" });
  const scheduled = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const localStamp = new Date(
    scheduled.getTime() - scheduled.getTimezoneOffset() * 60000,
  )
    .toISOString()
    .slice(0, 16);
  await page.getByLabel("Scheduled preparation time").fill(localStamp);
  await expect(
    page.getByRole("button", { name: "Place order", exact: true }),
  ).toBeEnabled();
  const placed = page.waitForResponse(
    (r) =>
      r.url().endsWith("/cart/checkout/") && r.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  const placedResponse = await placed;
  assert.equal(placedResponse.status(), 201);
  const booking = await placedResponse.json();
  assert.ok(booking.scheduled_for);
  assert.equal(Number(booking.total), 140);
  await expect(page).toHaveURL(new RegExp(`/tracking/${booking.id}$`));
  await kitchen.page.goto(base + "/restaurant-orders", {
    waitUntil: "networkidle",
  });
  await expect(kitchen.page.locator(".order-card")).toContainText(
    "Don’t start cooking yet",
  );
  await kitchen.page
    .getByRole("button", { name: "Accept order", exact: true })
    .click();
  await kitchen.page
    .getByRole("button", { name: "Order accepted", exact: true })
    .click();
  await expect(
    kitchen.page.getByRole("button", { name: "Start preparing", exact: true }),
  ).toBeDisabled();
  const early = await fetch(`${base}/api/v1/orders/${booking.id}/status/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${kitchen.token}`,
    },
    body: JSON.stringify({ status: "preparing" }),
  });
  assert.equal(early.status, 400);
  await kitchen.page.screenshot({
    path: "/private/tmp/ruchigo-scheduled-kitchen-1440.png",
    fullPage: true,
  });
  passed.push(
    "Scheduled COD checkout persists, kitchen accepts it, and UI plus API prevent early cooking",
  );
  await kitchen.page.goto(base + "/restaurant-offers", {
    waitUntil: "networkidle",
  });
  await kitchen.page
    .getByRole("button", { name: "Coupons", exact: true })
    .click();
  await kitchen.page
    .getByRole("button", { name: "Create coupon", exact: true })
    .click();
  const pairForm = kitchen.page.getByRole("dialog");
  await pairForm.getByLabel("Coupon code", { exact: true }).fill(pairCode);
  await pairForm.getByLabel("Benefit", { exact: true }).selectOption("bogo");
  await pairForm
    .getByLabel("Campaign", { exact: true })
    .selectOption("festival");
  await pairForm
    .getByLabel("Campaign name (optional)")
    .fill("Local QA meal pairs");
  await expect(pairForm.getByLabel("BOGO dish").locator("option")).toHaveCount(
    2,
  );
  await pairForm.getByLabel("BOGO dish").selectOption(String(fixture.items[0]));
  await pairForm.getByLabel("Starts", { exact: true }).fill("2026-09-01T00:00");
  await pairForm.getByLabel("Ends", { exact: true }).fill("2026-12-31T23:59");
  await pairForm
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(pairForm).toHaveCount(0);
  await kitchen.page
    .getByRole("button", { name: "Offers", exact: true })
    .click();
  await kitchen.page
    .getByRole("button", { name: "Create offer", exact: true })
    .click();
  const offerForm = kitchen.page.getByRole("dialog");
  await offerForm
    .getByLabel("Offer title", { exact: true })
    .fill("Local QA pair offer");
  await offerForm
    .getByLabel("Redeemable coupon code (optional)")
    .fill(pairCode);
  await offerForm
    .getByLabel("Starts", { exact: true })
    .fill("2026-09-02T00:00");
  await offerForm.getByLabel("Ends", { exact: true }).fill("2026-12-30T23:59");
  await offerForm
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(offerForm).toHaveCount(0);
  const admin = await session(`${marker}-admin@example.test`, "admin");
  await admin.page.goto(base + "/admin-offers", { waitUntil: "networkidle" });
  await admin.page
    .getByRole("button", { name: "Coupons", exact: true })
    .click();
  await admin.page
    .getByRole("button", { name: "Create coupon", exact: true })
    .click();
  const feeForm = admin.page.getByRole("dialog");
  await feeForm.getByLabel("Coupon code", { exact: true }).fill(feeCode);
  await feeForm
    .getByLabel("Benefit", { exact: true })
    .selectOption("free_delivery");
  await feeForm.getByLabel("Starts", { exact: true }).fill("2026-09-01T00:00");
  await feeForm.getByLabel("Ends", { exact: true }).fill("2026-12-31T23:59");
  await feeForm
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(feeForm).toHaveCount(0);
  await api("/cart/items/", token, {
    menu_item: fixture.items[0],
    quantity: 2,
  });
  await page.goto(base + "/checkout", { waitUntil: "networkidle" });
  const savings = page.getByRole("region", { name: "Offers and savings" });
  await savings
    .getByRole("button", { name: /Find a coupon for your meal/ })
    .click();
  const drawer = page.getByRole("dialog", { name: "Coupons for your meal" });
  await drawer
    .getByRole("textbox", { name: "Search coupons or enter code" })
    .fill(pairCode);
  await expect(drawer.locator(`[data-coupon="${pairCode}"]`)).toContainText(
    "Buy one, get one free",
  );
  await drawer
    .getByRole("button", { name: `Apply ${pairCode}`, exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "You saved ₹100!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nice, continue" }).click();
  await expect(page.locator(".bill-total")).toContainText("₹140");
  await savings.getByRole("button", { name: "View other coupons" }).click();
  await drawer
    .getByRole("textbox", { name: "Search coupons or enter code" })
    .fill(feeCode);
  await drawer
    .getByRole("button", { name: `Apply ${feeCode}`, exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "You saved ₹40!" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Nice, continue" }).click();
  await expect(page.locator(".bill-total")).toContainText("₹200");
  await expect(page.locator(".sticky-summary")).toContainText(
    "Delivery coupon saved ₹40",
  );
  await expect(savings).toContainText("You’re saving ₹40");
  await expect(savings).toContainText("Free delivery with your coupon");
  await expect(savings).not.toContainText("more for free delivery");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await page.locator(".sticky-summary").scrollIntoViewIfNeeded();
    await page.screenshot({
      path: `/private/tmp/ruchigo-coupon-benefits-${width}.png`,
      fullPage: true,
    });
  }
  await page.goto(base + "/offers", { waitUntil: "networkidle" });
  await expect(
    page
      .locator(".offer-card")
      .filter({ hasText: "Local QA pair offer" })
      .getByRole("button", { name: `Copy coupon ${pairCode}` }),
  ).toBeVisible();
  passed.push(
    "Merchant BOGO and linked offer, admin fee waiver, real apply animation and signed bills at desktop/390/320px",
  );
  // Real configured Google lookup at a public landmark; no address save/order.
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.locator(".location-trigger").click();
  await page
    .getByRole("button", { name: "Use my current location", exact: true })
    .click();
  const picker = page.getByRole("dialog", {
    name: "Set your delivery location",
  });
  const search = picker.getByRole("combobox", {
    name: "Search your street, building or area",
  });
  const response = page.waitForResponse(
    (r) =>
      r.url().endsWith("/location/search/") && r.request().method() === "POST",
  );
  await search.fill("Connaught Place Delhi");
  const lookup = await response;
  assert.equal(lookup.status(), 200);
  const suggestions = await lookup.json();
  assert.ok(suggestions.results.length);
  await expect(picker.getByRole("option").first()).toBeVisible();
  await search.press("ArrowDown");
  await search.press("Enter");
  await expect(
    picker.getByRole("heading", {
      name: suggestions.results[0].label,
      exact: true,
    }),
  ).toBeVisible();
  await expect(picker.getByRole("option")).toHaveCount(0);
  await expect(picker.locator('[data-map-state="ready"]')).toBeVisible({
    timeout: 20000,
  });
  await page.screenshot({
    path: "/private/tmp/ruchigo-address-search-1440.png",
  });
  passed.push(
    "Live Google forward suggestions selected by keyboard update the map/address without saving customer data",
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      { passed, browserErrors: errors, productionWrites: 0 },
      null,
      2,
    ),
  );
} finally {
  await browser?.close();
  console.log(
    db(
      `from django.db import transaction; from api.models import *
with transaction.atomic():
 customer=User.objects.get(pk=payload['customer'],email=payload['marker']+'@example.test')
 assert not Order.objects.filter(customer=customer).exclude(restaurant_id__in=payload['kitchens']).exists()
 assert json.loads(json.dumps(list(Order.objects.filter(pk__in=[16,37]).values('id','status','total','updated_at')),default=str))==payload['original']
 Order.objects.filter(customer=customer,restaurant_id__in=payload['kitchens']).delete()
 AuditLog.objects.filter(actor=customer).delete()
 customer.delete()
 Offer.objects.filter(restaurant_id__in=payload['kitchens']).delete()
 Coupon.objects.filter(restaurant_id__in=payload['kitchens']).delete()
 Coupon.objects.filter(code=payload['feeCode']).delete()
 for index,pk in enumerate(payload['owners']):
  owner=User.objects.get(pk=pk,email=payload['marker']+str(index)+'@example.test')
  AuditLog.objects.filter(actor=owner).delete()
  owner.delete()
 admin=User.objects.get(pk=payload['admin'],email=payload['marker']+'-admin@example.test')
 AuditLog.objects.filter(actor=admin).delete()
 admin.delete()
 print(json.dumps({'isolated_fixtures_removed':True,'user_orders_16_37_unchanged':True}))`,
      { ...fixture, marker, feeCode },
    ),
  );
}
