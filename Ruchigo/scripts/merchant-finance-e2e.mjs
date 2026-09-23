import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { chromium, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 15000 });

// Isolated real database/API. Nothing is enabled in the shared preview.
const output = mkdtempSync(join(tmpdir(), "ruchigo-merchant-"));
const env = {
  ...process.env,
  DATABASE_URL: "",
  POSTGRES_URL: "",
  DJANGO_DEBUG: "True",
  DJANGO_DB_ENGINE: "sqlite",
  DJANGO_SQLITE_PATH: join(output, "test.sqlite3"),
};
const base = "http://127.0.0.1:5173",
  backend = "http://127.0.0.1:8014";
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
admin=User.objects.create_user('merchant-admin@example.test',password=payload['password'],role='admin')
customer=User.objects.create_user('merchant-customer@example.test',password=payload['password'])
owner=User.objects.create_user('merchant-owner@example.test',password=payload['password'],role='restaurant')
rider=User.objects.create_user('merchant-rider@example.test',password=payload['password'],role='delivery')
kitchen=Restaurant.objects.create(owner=owner,name='Merchant QA kitchen',city='Local QA',is_approved=True)
item=MenuItem.objects.create(restaurant=kitchen,name='QA meal',price=400,stock_quantity=10,is_vegetarian=True)
address=Address.objects.create(user=customer,line1='QA doorstep 24',city='Local QA',state='Delhi',postal_code='110001',is_default=True)
print(json.dumps({'item':item.pk,'address':address.pk,'restaurant':kitchen.pk}))`,
  { password },
);
const server = spawn(
  ".venv/bin/python",
  ["backend/manage.py", "runserver", "127.0.0.1:8014", "--noreload"],
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
    email: `merchant-${name}@example.test`,
    password,
    role,
  });
}
async function pageFor(auth) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    await route.fulfill({
      response: await route.fetch({ url: backend + url.pathname + url.search }),
    });
  });
  await context.addInitScript(
    (auth) =>
      localStorage.setItem(
        "ruchigo-auth",
        JSON.stringify({
          user: auth.user,
          role: auth.user.role,
          token: auth.tokens.access,
          refreshToken: auth.tokens.refresh,
          expiresAt: Date.now() + 600000,
        }),
      ),
    auth,
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.url().includes("/api/v1/") && response.status() >= 400)
      errors.push(`${new URL(response.url()).pathname}: ${response.status()}`);
  });
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
  assert.ok(ready, "Isolated API starts");
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const admin = await login("admin"),
    customer = await login("customer"),
    owner = await login("restaurant", "owner"),
    rider = await login("delivery", "rider");
  const page = await pageFor(admin);
  await page.goto(`${base}/admin-dashboard`);
  await expect(
    page.getByRole("heading", { name: "Platform overview" }),
  ).toBeVisible();
  await expect(
    page.getByText("The first order starts here", { exact: true }),
  ).toBeVisible();
  await page.goto(`${base}/admin-payments`);
  await page
    .getByRole("tab", { name: "Restaurant earnings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Review policy", exact: true })
    .click();
  await page.getByLabel("Food commission (%)").fill("10");
  await page.getByLabel("Enable accounting for new orders").check();
  await page
    .getByLabel("Allow finance-confirmed external payment records")
    .check();
  await page
    .getByLabel(
      "The funding, refund and pre-tax convention above has business approval",
    )
    .check();
  await page
    .getByLabel("Reason for change")
    .fill("Isolated QA approval only, not a live commercial activation");
  await page.getByRole("button", { name: "Save accounting policy" }).click();
  await expect(
    page.getByText("10.00% on new orders · Revision 2"),
  ).toBeVisible();
  await api("/cart/items/", customer.tokens.access, {
    menu_item: fixture.item,
    quantity: 1,
  });
  const quote = await api("/cart/quote/", customer.tokens.access, {
    address_id: fixture.address,
  });
  const order = await api("/cart/checkout/", customer.tokens.access, {
    address_id: fixture.address,
    quote_token: quote.quote_token,
    checkout_key: randomUUID(),
  });
  assert.equal(order.commission_snapshot, undefined);
  for (const status of ["confirmed", "preparing", "ready"])
    await api(`/orders/${order.id}/status/`, owner.tokens.access, { status });
  await api(`/orders/${order.id}/accept/`, rider.tokens.access, {});
  await api(`/orders/${order.id}/pickup/`, rider.tokens.access, {});
  await api(`/orders/${order.id}/status/`, rider.tokens.access, {
    status: "delivered",
    delivery_code: order.delivery_code,
  });
  await page.reload();
  await expect(page.locator(".finance-balance strong")).toHaveText("₹360");
  await page
    .getByRole("button", { name: "Record external payment", exact: true })
    .click();
  await page.getByLabel("Amount paid (₹)").fill("100");
  await page.getByLabel("External payment reference").fill("QA-BANK-100");
  await page.getByLabel("Actual payment date & time").fill("2026-01-01T12:00");
  await page
    .getByLabel("I have verified that this external payment was made")
    .check();
  await page
    .getByLabel("Finance note")
    .fill("QA external payment record, not a real transfer");
  await page
    .getByRole("button", { name: "Save external payment record" })
    .click();
  await expect(page.locator(".finance-balance strong")).toHaveText("₹260");
  await page.getByRole("tab", { name: "Settlement records" }).click();
  await expect(page.getByText("QA-BANK-100", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Correct this record" }).click();
  await page
    .getByLabel("Reason for correction")
    .fill("QA correction keeps original audit trail");
  await page.getByRole("button", { name: "Confirm ledger correction" }).click();
  await expect(page.locator(".finance-balance strong")).toHaveText("₹360");
  await expect(page.getByText(/Record corrected: QA correction/)).toBeVisible();
  await page.screenshot({
    path: join(output, "admin-finance-desktop.png"),
    fullPage: true,
  });
  const merchantPage = await pageFor(owner);
  await merchantPage.goto(`${base}/restaurant-earnings`);
  await expect(merchantPage.locator(".finance-balance strong")).toHaveText(
    "₹360",
  );
  await expect(
    merchantPage.getByRole("button", {
      name: "Record external payment",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    merchantPage.getByRole("button", { name: "Review policy", exact: true }),
  ).toHaveCount(0);
  await merchantPage
    .getByText("View accounting breakdown", { exact: true })
    .click();
  await expect(merchantPage.locator(".finance-entry dl")).toContainText("₹40");
  for (const target of [page, merchantPage]) {
    for (const width of [1440, 390, 320]) {
      await target.setViewportSize({ width, height: 950 });
      assert.ok(
        await target.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Finance fits ${width}px`,
      );
      await target.screenshot({
        path: join(
          output,
          `${target === page ? "admin" : "merchant"}-${width}.png`,
        ),
        fullPage: true,
      });
    }
  }
  await page.goto(`${base}/admin-dashboard`);
  await expect(page.locator(".overview-order")).toHaveCount(1);
  await page.setViewportSize({ width: 390, height: 950 });
  await page.getByRole("button", { name: "More", exact: true }).click();
  const workspaceMenu = page.getByRole("dialog", { name: "Your workspace" });
  await expect(
    workspaceMenu.getByRole("link", {
      name: "Payments & earnings",
      exact: true,
    }),
  ).toBeVisible();
  assert.ok(
    await workspaceMenu.evaluate(
      (node) => node.getBoundingClientRect().width <= innerWidth,
    ),
  );
  await page.screenshot({
    path: join(output, "admin-workspace-menu-390.png"),
    fullPage: true,
  });
  await workspaceMenu.getByRole("button", { name: "Close dialog" }).click();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 950 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Admin overview fits ${width}px`,
    );
    await page.screenshot({
      path: join(output, `admin-overview-${width}.png`),
      fullPage: true,
    });
  }
  await page.goto(`${base}/admin-payments?tab=payments`);
  await expect(page.locator(".payment-mobile-records article")).toHaveCount(1);
  await expect(page.locator(".merchant-finance")).toHaveCount(0);
  await page.screenshot({
    path: join(output, "admin-payments-320.png"),
    fullPage: true,
  });
  await page.getByRole("tab", { name: "Refund reviews", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Refund reviews", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".payment-mobile-records")).toHaveCount(0);
  // Stop polling the finance workspace before deliberately revoking its access.
  await page.context().unrouteAll({ behavior: "wait" });
  await page.close();
  // Personal shopping also works for an admin with NO operational scopes.
  db(`from api.models import *
admin=User.objects.get(email='merchant-admin@example.test')
AdminAccessGrant.objects.update_or_create(user=admin,defaults={'full_access':False,'scopes':[]})
Address.objects.create(user=admin,line1='Admin personal doorstep',city='Local QA',state='Delhi',postal_code='110001',is_default=True)
print(json.dumps({'ready':True}))`);
  const shopper = await login("admin");
  const shopPage = await pageFor(shopper);
  await shopPage.goto(`${base}/admin-dashboard`);
  await expect(
    shopPage.getByRole("heading", { name: "Waiting for workspace access" }),
  ).toBeVisible();
  await shopPage
    .getByRole("button", { name: "Find an admin workspace" })
    .click();
  const palette = shopPage.getByRole("dialog", { name: "Find a workspace" });
  for (const path of [
    "/admin-users",
    "/admin-payments",
    "/admin-access",
    "/admin-reports",
    "/support?view=team",
  ]) {
    await expect(palette.locator(`a[href="${path}"]`)).toHaveCount(0);
  }
  await expect(
    palette.getByRole("link", { name: "Account settings" }),
  ).toBeVisible();
  await shopPage.keyboard.press("Escape");
  await shopPage.setViewportSize({ width: 390, height: 844 });
  await shopPage
    .getByRole("button", { name: "Open workspace menu", exact: true })
    .click();
  const scopedMenu = shopPage.getByRole("dialog", { name: "Your workspace" });
  await expect(
    scopedMenu.getByRole("link", { name: "Payments & earnings", exact: true }),
  ).toHaveCount(0);
  await expect(
    scopedMenu.getByRole("link", { name: "People", exact: true }),
  ).toHaveCount(0);
  await expect(
    scopedMenu.getByRole("link", { name: "Support inbox", exact: true }),
  ).toHaveCount(0);
  await expect(
    scopedMenu.getByRole("link", { name: "Account settings", exact: true }),
  ).toBeVisible();
  await scopedMenu.getByRole("button", { name: "Close dialog" }).click();
  await shopPage.setViewportSize({ width: 1440, height: 1000 });
  await shopPage.goto(`${base}/restaurant/${fixture.restaurant}`);
  await shopPage.getByRole("button", { name: "ADD", exact: true }).click();
  await expect(
    shopPage.getByRole("button", { name: "Add one QA meal" }),
  ).toBeVisible();
  await shopPage.goto(`${base}/checkout`);
  await expect(
    shopPage
      .getByRole("main")
      .getByText("Admin personal doorstep", { exact: false }),
  ).toBeVisible();
  const placedResponse = shopPage.waitForResponse(
    (response) =>
      response.url().includes("/cart/checkout/") &&
      response.request().method() === "POST",
  );
  await shopPage
    .getByRole("button", { name: "Place order", exact: true })
    .click();
  const personalOrder = await (await placedResponse).json();
  assert.ok(personalOrder.id);
  assert.equal(personalOrder.customer, shopper.user.id);
  const ownHistory = await api("/orders/?view=mine", shopper.tokens.access);
  assert.deepEqual(
    ownHistory.results.map((row) => row.id),
    [personalOrder.id],
  );
  await shopPage.goto(`${base}/tracking/${personalOrder.id}`);
  await shopPage
    .getByRole("button", { name: "Cancel order", exact: true })
    .click();
  const dialog = shopPage.getByRole("dialog", { name: "Cancel this order?" });
  await dialog.getByLabel("I changed my mind").check();
  await dialog.getByRole("button", { name: "Confirm cancellation" }).click();
  await expect(
    shopPage.getByText("This order was cancelled.", { exact: true }),
  ).toBeVisible();
  await shopPage.goto(`${base}/orders`);
  await expect(
    shopPage.getByRole("button", { name: /Reorder/i }),
  ).toBeVisible();
  await shopPage.setViewportSize({ width: 390, height: 950 });
  assert.ok(
    await shopPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await shopPage.screenshot({
    path: join(output, "admin-personal-orders-390.png"),
    fullPage: true,
  });
  assert.deepEqual(errors, []);
  const result = db(
    "from api.models import *; print(json.dumps({'entries':MerchantEntry.objects.count(),'balance':str(MerchantAccount.objects.get().balance),'settlements':MerchantSettlement.objects.count(),'audit':AuditLog.objects.filter(action__startswith='finance.').count()}))",
  );
  assert.equal(result.entries, 3);
  assert.equal(Number(result.balance), 360);
  assert.equal(result.settlements, 1);
  assert.equal(result.audit, 3);
  console.log(
    JSON.stringify({
      passed: true,
      result,
      screenshots: output,
      browserErrors: errors,
    }),
  );
} catch (error) {
  for (const [index, context] of (browser?.contexts() || []).entries()) {
    const last = context.pages().at(-1);
    if (last && !last.isClosed()) {
      await last
        .screenshot({
          path: join(output, `failure-${index}.png`),
          fullPage: true,
        })
        .catch(() => {});
      console.error(
        JSON.stringify({
          page: new URL(last.url()).pathname,
          browserErrors: errors,
          content: (
            await last
              .locator("body")
              .innerText()
              .catch(() => "")
          ).slice(0, 3000),
        }),
      );
    }
  }
  throw error;
} finally {
  for (const context of browser?.contexts() || [])
    await context.unrouteAll({ behavior: "ignoreErrors" });
  await browser?.close();
  server.kill("SIGTERM");
}
