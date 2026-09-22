import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Local fixture only. Temporarily configures the preview thali, then restores
// exact menu/hour values. Does not create orders, reviews or new menu items.
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
let token, original, restaurant, itemId;
const errors = [];
async function api(path, { method = "GET", body, auth = token } = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  assert.ok(response.ok, `${path}: ${response.status}`);
  return response.status === 204 ? null : response.json();
}
try {
  const auth = await api("/auth/login/", {
    method: "POST",
    body: {
      email: "owner.spice@ruchigo.online",
      role: "restaurant",
      password: "RuchiGo-preview-2026",
    },
    auth: null,
  });
  token = auth.tokens.access;
  const items = await api("/menu-items/?search=Royal%20Veg%20Thali");
  assert.equal(items.results.length, 1);
  const dish = items.results[0];
  itemId = dish.id;
  original = {
    add_ons: dish.add_ons,
    option_groups: dish.option_groups,
    stock_quantity: dish.stock_quantity,
    is_available: dish.is_available,
  };
  restaurant = await api(`/restaurants/${dish.restaurant}/`);
  await api(`/restaurants/${restaurant.id}/`, {
    method: "PATCH",
    body: { opening_hours: [], is_open: true },
  });
  await api(`/menu-items/${itemId}/`, {
    method: "PATCH",
    body: {
      option_groups: [
        {
          id: "test_size",
          name: "Choose your size",
          min_select: 1,
          max_select: 1,
        },
      ],
      add_ons: [
        {
          id: "test_regular",
          name: "Regular portion",
          group_id: "test_size",
          price: "0.00",
          is_available: true,
        },
        {
          id: "test_large",
          name: "Large portion",
          group_id: "test_size",
          price: "50.00",
          is_available: true,
        },
        {
          id: "test_raita",
          name: "Extra raita",
          price: "20.00",
          is_available: true,
        },
      ],
      stock_quantity: 3,
      is_available: true,
    },
  });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/restaurant/${restaurant.id}`, {
    waitUntil: "networkidle",
  });
  await page
    .getByRole("button", { name: /Customise Royal Veg Thali:/ })
    .click();
  const dialog = page.getByRole("dialog", { name: "Customise your meal" });
  await expect(
    dialog.getByRole("group", { name: "Choose your size" }),
  ).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: /Sign in to add/ }),
  ).toBeDisabled();
  await dialog.getByRole("radio", { name: /Regular portion/ }).check();
  await expect(
    dialog.getByRole("button", { name: /Sign in to add/ }),
  ).toBeEnabled();
  await dialog.getByRole("radio", { name: /Large portion/ }).check();
  await expect(
    dialog.getByRole("radio", { name: /Regular portion/ }),
  ).not.toBeChecked();
  await dialog.getByRole("checkbox", { name: /Extra raita/ }).check();
  await expect(
    dialog.getByRole("button", { name: /Sign in to add/ }),
  ).toContainText("₹319");
  await dialog
    .getByRole("button", { name: "Increase quantity", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Increase quantity", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Increase quantity", exact: true }),
  ).toBeDisabled();
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-required-size-mobile.png",
    fullPage: false,
  });
  await page.keyboard.press("Escape");

  await api(`/restaurants/${restaurant.id}/`, {
    method: "PATCH",
    body: {
      opening_hours: Array.from({ length: 7 }, () => ({ closed: true })),
    },
  });
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByText("Currently closed", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Customise Royal Veg Thali:/ }),
  ).toBeDisabled();
  await page.getByText("Opening hours · IST", { exact: true }).click();
  await expect(page.getByText("Monday", { exact: true })).toBeVisible();

  const owner = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  await owner.addInitScript(
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
  const ownerPage = await owner.newPage();
  ownerPage.on("pageerror", (error) => errors.push(error.message));
  await ownerPage.goto(`${base}/restaurant-profile`, {
    waitUntil: "networkidle",
  });
  await expect(
    ownerPage.getByRole("group", { name: "Weekly opening hours" }),
  ).toBeVisible();
  await expect(
    ownerPage.getByRole("checkbox", { name: "Use a weekly schedule" }),
  ).toBeChecked();
  assert.ok(
    await ownerPage.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await ownerPage.goto(`${base}/restaurant-menu`, { waitUntil: "networkidle" });
  const card = ownerPage
    .locator(".food-card")
    .filter({
      has: ownerPage.getByRole("heading", {
        name: "Royal Veg Thali",
        exact: true,
      }),
    });
  await card.getByRole("button", { name: "Edit", exact: true }).click();
  await expect(
    ownerPage.getByLabel("Available portions (optional)"),
  ).toHaveValue("3");
  await expect(
    ownerPage.getByRole("group", { name: "Size & choice groups", exact: true }),
  ).toBeVisible();
  await ownerPage.screenshot({
    path: "/private/tmp/ruchigo-menu-configuration-mobile.png",
    fullPage: false,
  });
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed: [
          "Required radio choice and optional priced extras",
          "Correct total and stock-based quantity limit",
          "Closed-hours customer state and disabled ordering",
          "Mobile restaurant hours and menu configuration",
        ],
        browserErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  if (original && itemId)
    await api(`/menu-items/${itemId}/`, { method: "PATCH", body: original });
  if (restaurant)
    await api(`/restaurants/${restaurant.id}/`, {
      method: "PATCH",
      body: {
        opening_hours: restaurant.opening_hours,
        is_open: restaurant.is_open,
      },
    });
  await browser.close();
}
