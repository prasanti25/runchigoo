import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";
import { getFoodFallback, getRestaurantFallback } from "../src/lib/images.js";

// Local preview fixtures only. Creates one support conversation. Restores the
// customer's original avatar, including its bytes when a photo already exists.
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const passed = [];
async function api(path, { token, method = "GET", body } = {}, attempt = 0) {
  const multipart = body instanceof FormData;
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      ...(multipart ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: multipart ? body : JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  if (response.status === 429 && attempt < 4) {
    await new Promise((resolve) =>
      setTimeout(
        resolve,
        Math.min(
          60000,
          Math.max(
            1000,
            Number(response.headers.get("Retry-After") || 1) * 1000 + 100,
          ),
        ),
      ),
    );
    return api(path, { token, method, body }, attempt + 1);
  }
  assert.ok(response.ok, `${path}: ${JSON.stringify(data)}`);
  return data;
}
const login = (email, role) =>
  api("/auth/login/", {
    method: "POST",
    body: { email, role, password: "RuchiGo-preview-2026" },
  });
const overflow = async (page) =>
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Overflow: ${page.url()}`,
  );
let customer;
let previousPhoto;
let photoChanged = false;
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  context.setDefaultTimeout(12000);
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  const catalog = await api("/menu-items/");
  for (const item of catalog.results) {
    assert.ok(
      !getFoodFallback(item).includes("unavailable"),
      `Missing catalog photo: ${item.name}`,
    );
    const response = await fetch(base + getFoodFallback(item));
    assert.ok(response.ok, `Missing asset: ${item.name}`);
  }
  assert.equal(
    getFoodFallback({
      name: "Cold Coffee",
      category_name: "Healthy",
      description: "Creamy",
    }),
    "/food/iced-coffee.webp",
  );
  assert.equal(
    getFoodFallback({ name: "Royal Veg Thali" }),
    "/food/veg-thali.webp",
  );
  assert.equal(
    getFoodFallback({ name: "Chicken Biryani" }),
    "/food/biryani.webp",
  );
  const restaurants = await api("/restaurants/");
  for (const restaurant of restaurants.results)
    assert.ok(!getRestaurantFallback(restaurant).includes("unavailable"));
  await page.goto(`${base}/restaurant/4`, { waitUntil: "networkidle" });
  const coffee = page.locator(".menu-item").filter({ hasText: "Cold Coffee" });
  await coffee.scrollIntoViewIfNeeded();
  await expect(coffee.locator("img")).toHaveAttribute(
    "src",
    "/food/iced-coffee.webp",
  );
  await coffee.screenshot({ path: "/private/tmp/ruchigo-coffee-fixed.png" });
  passed.push(
    "All 12 current dishes have available matching photo mappings; coffee, thali and biryani regressions checked",
  );

  await page.goto(`${base}/search`, { waitUntil: "networkidle" });
  await page.getByLabel("Budget filter").selectOption("250");
  await page.getByRole("button", { name: "Rating 4.0+", exact: true }).click();
  await page
    .getByRole("button", { name: "Fast prep · ≤30 min", exact: true })
    .click();
  await page.getByRole("button", { name: "Veg dishes", exact: true }).click();
  await expect(page.locator(".restaurant-card").first()).toBeVisible();
  for (const key of [
    "budget=250",
    "min_rating=4",
    "max_prep=30",
    "vegetarian=true",
  ])
    assert.ok(page.url().includes(key));
  await page.reload({ waitUntil: "networkidle" });
  await expect(
    page.getByRole("button", { name: "Rating 4.0+", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await overflow(page);
    await page.screenshot({
      path: `/private/tmp/ruchigo-discovery-filters-${width}.png`,
    });
  }
  await context.grantPermissions(["geolocation"]);
  await context.setGeolocation({ latitude: 28.6, longitude: 77.2 });
  await page.getByRole("button", { name: "Near me", exact: true }).click();
  await expect(page.getByLabel("Nearby radius")).toHaveValue("5");
  await expect(
    page.getByText(/Distances are approximate straight-line/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await expect(page.getByLabel("Budget filter")).toHaveValue("");
  passed.push(
    "Combinable budget/rating/fast/veg filters persist, reset correctly, support opt-in nearby and fit 320/390/1440px",
  );

  await page.goto(base, { waitUntil: "networkidle" });
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    const footer = page.locator(".product-footer");
    await footer.scrollIntoViewIfNeeded();
    await overflow(page);
    await expect(
      footer.getByRole("link", { name: "Privacy policy", exact: true }),
    ).toHaveAttribute("href", "/privacy");
    await footer.screenshot({
      path: `/private/tmp/ruchigo-footer-${width}.png`,
    });
  }
  await page
    .locator(".product-footer")
    .getByRole("link", { name: "Restaurant partner", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: /Restaurant/ }),
  ).toHaveAttribute("aria-pressed", "true");
  assert.ok(page.url().includes("role=restaurant"));
  passed.push(
    "Responsive footer has real legal/support links and partner registration destinations",
  );

  customer = await login("preview.customer@ruchigo.test", "customer");
  const admin = await login("preview.admin@ruchigo.test", "admin");
  const ticket = await api("/support/", {
    token: customer.tokens.access,
    method: "POST",
    body: {
      category: "delivery",
      subject: "Local notification regression",
      message: "Local preview test of automatic activity.",
    },
  });
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
    customer,
  );
  await page.goto(`${base}/profile`, { waitUntil: "networkidle" });
  await expect(page.locator(".notification-bell:visible")).toHaveAttribute(
    "aria-label",
    /\d+ unread/,
  );
  await expect(page.locator(".app-toast")).toHaveCount(0);
  await api(`/support/${ticket.id}/reply/`, {
    token: admin.tokens.access,
    method: "POST",
    body: { message: "Automatic notification test reply." },
  });
  // Wait for the actual visible-tab poll, without a fabricated event feed.
  await expect(
    page.locator(".app-toast").filter({ hasText: "Support replied" }),
  ).toBeVisible({ timeout: 20000 });
  await page
    .locator(".app-toast")
    .screenshot({ path: "/private/tmp/ruchigo-modern-toast-mobile.png" });
  await page
    .locator(".app-toast")
    .getByRole("link", { name: "View update", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Local notification regression",
      exact: true,
      level: 2,
    }),
  ).toBeVisible();
  assert.ok(page.url().includes(`ticket=${ticket.id}`));
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(page.locator(".app-toast.is-visible")).toHaveCount(0);
  passed.push(
    "Real support reply automatically updates the inbox/toast, opens the correct ticket and does not replay on focus",
  );

  // Explicit UI-only edge case: long error text, loading updates and timers.
  await page.evaluate(async () => {
    const moduleUrl = performance
      .getEntriesByType("resource")
      .find((entry) => entry.name.includes("/react-hot-toast.js"))?.name;
    const { default: toast } = await import(moduleUrl);
    toast.error(
      "Your payment could not be verified. Please check the order before trying again; your order history and support are available if you need help.",
      { id: "ui-error", duration: Infinity },
    );
  });
  await expect(page.locator(".app-toast--error")).toBeVisible();
  await overflow(page);
  // Leaving the toast resumes react-hot-toast's intentional hover pause.
  await page.mouse.move(0, 0);
  await page
    .locator(".app-toast--error")
    .getByRole("button", { name: "Dismiss notification" })
    .press("Enter");
  await expect(page.locator(".app-toast--error")).toHaveCount(0);
  await page.evaluate(async () => {
    const moduleUrl = performance
      .getEntriesByType("resource")
      .find((entry) => entry.name.includes("/react-hot-toast.js"))?.name;
    const { default: toast } = await import(moduleUrl);
    toast.success("Saved successfully", { duration: 600 });
  });
  await expect(page.locator(".app-toast--success")).toHaveCount(0, {
    timeout: 3000,
  });
  passed.push(
    "Long toast messages fit mobile; keyboard dismiss and automatic expiry work",
  );

  if (customer.user.avatar)
    previousPhoto = await (
      await fetch(new URL(customer.user.avatar, base))
    ).blob();
  await page.goto(`${base}/profile`, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Change profile photo", exact: true })
    .click();
  await page.getByLabel("Choose profile photo").setInputFiles({
    name: "wrong.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("Not an image"),
  });
  await expect(
    page.getByText("Choose a JPG, PNG or WebP photo.", { exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Choose profile photo")
    .setInputFiles("public/demo-food/iced-coffee.jpg");
  await expect(page.locator(".photo-preview img")).toHaveAttribute(
    "src",
    /^blob:/,
  );
  await page.getByRole("button", { name: "Save photo", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Profile photo", exact: true }),
  ).toHaveCount(0);
  photoChanged = true;
  await expect(page.locator(".profile-photo-control img")).toHaveAttribute(
    "src",
    /avatars\/.*\.webp/,
  );
  await page.reload({ waitUntil: "networkidle" });
  const avatar = page.locator(".profile-photo-control img");
  await expect(avatar).toBeVisible();
  assert.ok(
    await avatar.evaluate(
      (image) => image.complete && image.naturalWidth === 512,
    ),
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-profile-photo-mobile.png",
  });
  await page
    .getByRole("button", { name: "Change profile photo", exact: true })
    .click();
  await page.getByRole("button", { name: "Remove photo", exact: true }).click();
  await expect(page.locator(".profile-photo-control img")).toHaveCount(0);
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator(".profile-photo-control img")).toHaveCount(0);
  passed.push(
    "Profile photo validates files, previews, uploads/re-encodes to 512px WebP, survives reload and removes persistently",
  );
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed, browserErrors: errors }, null, 2));
} finally {
  if (photoChanged && customer) {
    let body = { avatar: null };
    if (previousPhoto) {
      body = new FormData();
      body.append("avatar", previousPhoto, "original.webp");
    }
    await api("/auth/me/", {
      token: customer.tokens.access,
      method: "PATCH",
      body,
    });
  }
  await browser.close();
}
