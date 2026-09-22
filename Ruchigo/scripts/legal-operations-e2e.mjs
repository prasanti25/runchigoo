import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Mutates only the development fixtures at the fixed local preview URL.
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const reports = [];
const reviewMarker = `[Automated moderation test ${randomUUID()}] Temporary test record.`;
let reviewOwner;
let reviewOrder;
async function cleanupReview() {
  if (!reviewOrder) return;
  const order = await api(`/orders/${reviewOrder}/`, { token: reviewOwner });
  if (order.review) {
    assert.equal(
      order.review.comment,
      reviewMarker,
      "Never change an unrelated review",
    );
    await api(`/reviews/${order.review.id}/`, {
      token: reviewOwner,
      method: "DELETE",
    });
  }
  reviewOrder = null;
}
async function api(path, { token, method = "GET", body } = {}, attempt = 0) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = response.status === 204 ? null : await response.json();
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
async function session(email, role) {
  const auth = await api("/auth/login/", {
    method: "POST",
    body: { email, role, password: "RuchiGo-preview-2026" },
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.addInitScript(
    ({ user, tokens }) =>
      localStorage.setItem(
        "ruchigo-auth",
        JSON.stringify({
          user,
          role: user.role,
          token: tokens.access,
          refreshToken: tokens.refresh,
          expiresAt: Date.now() + 600000,
        }),
      ),
    auth,
  );
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, context, token: auth.tokens.access };
}
async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Horizontal overflow at ${page.url()}`,
  );
}

try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${base}/login`, { waitUntil: "networkidle" });
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
  assert.equal(await page.locator(".auth-roles button").count(), 4);
  assert.ok(
    await page
      .locator(".brand-logo")
      .evaluate((image) => image.naturalWidth > 0),
  );
  await page
    .getByPlaceholder("Enter your password")
    .fill("not-a-real-password");
  await page
    .getByRole("button", { name: "Show password", exact: true })
    .click();
  await expect(page.getByPlaceholder("Enter your password")).toHaveAttribute(
    "type",
    "text",
  );
  await page
    .getByRole("button", { name: "Hide password", exact: true })
    .click();
  await page.getByPlaceholder("Enter your password").fill("");
  await page.screenshot({
    path: "/private/tmp/ruchigo-login-refined.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await noOverflow(page);
  await page.screenshot({
    path: "/private/tmp/ruchigo-login-refined-mobile.png",
    fullPage: true,
  });
  reports.push(
    "Auth: original logo, role controls, password visibility and mobile layout",
  );

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of [
      "privacy",
      "terms",
      "about",
      "contact",
      "faq",
      "offers",
    ]) {
      await page.goto(`${base}/${path}`, { waitUntil: "networkidle" });
      await expect(page.locator("main h1")).toBeVisible();
      await noOverflow(page);
      if (["privacy", "terms"].includes(path)) {
        assert.equal(await page.locator(".legal-section").count(), 10);
        await expect(
          page.getByText(
            "Preview document — not yet a final published policy.",
          ),
        ).toBeVisible();
        assert.equal(await page.locator(".legal-sidebar nav a").count(), 10);
        if (width !== 320)
          await page.screenshot({
            path: `/private/tmp/ruchigo-${path}-${width === 1440 ? "desktop" : "mobile"}.png`,
          });
      }
    }
  }
  await page.goto(`${base}/privacy#ai`, { waitUntil: "networkidle" });
  await expect(page.locator("#ai h2")).toBeInViewport();
  await page.locator('.legal-sidebar a[href="#payments"]').click();
  await expect(page.locator("#payments h2")).toBeInViewport();
  await page.emulateMedia({ media: "print" });
  await expect(page.locator(".app-header")).toBeHidden();
  await expect(page.locator(".legal-sidebar")).toBeHidden();
  await page.emulateMedia({ media: "screen" });
  await page.goto(`${base}/faq`, { waitUntil: "networkidle" });
  await page.getByText("How do I place an order?", { exact: true }).click();
  await expect(page.locator(".faq-list details").first()).toHaveAttribute(
    "open",
    "",
  );
  reports.push(
    "Public pages: legal sections, deep links, print styles, FAQ accordion and 320/390/1440px layouts",
  );

  const customer = await session("preview.customer@ruchigo.test", "customer");
  await customer.page.goto(`${base}/profile`, { waitUntil: "networkidle" });
  await expect(
    customer.page.getByRole("heading", { name: "Recent orders" }),
  ).toBeVisible();
  await customer.page
    .getByRole("button", { name: "Edit profile", exact: true })
    .click();
  await expect(
    customer.page.getByLabel("First name", { exact: true }),
  ).toBeVisible();
  await customer.page
    .getByRole("button", { name: "Save profile", exact: true })
    .click();
  await expect(customer.page.getByRole("dialog")).toBeHidden();
  await expect(
    customer.page.getByText("Profile updated", { exact: true }),
  ).toBeHidden({ timeout: 7000 });
  for (const width of [1440, 390, 320]) {
    await customer.page.setViewportSize({ width, height: 1000 });
    await noOverflow(customer.page);
    if (width !== 320)
      await customer.page.screenshot({
        path: `/private/tmp/ruchigo-profile-${width === 1440 ? "desktop" : "mobile"}.png`,
        fullPage: true,
      });
  }
  reports.push(
    "Customer profile: inline edit, real order cards, account shortcuts and responsive layout",
  );
  await customer.page.goto(`${base}/support?category=privacy`, {
    waitUntil: "networkidle",
  });
  await expect(customer.page.getByLabel("Topic", { exact: true })).toHaveValue(
    "privacy",
  );
  await customer.page
    .getByLabel("Subject", { exact: true })
    .fill("Preview privacy access request");
  await customer.page
    .getByLabel("What happened?", { exact: true })
    .fill("Please explain what data is stored for this preview account.");
  await customer.page
    .getByRole("button", { name: "Create support ticket", exact: true })
    .click();
  await expect(customer.page.getByRole("dialog")).toBeHidden();
  const tickets = await api("/support/", { token: customer.token });
  assert.ok(
    tickets.results.some(
      (ticket) =>
        ticket.category === "privacy" &&
        ticket.subject === "Preview privacy access request",
    ),
  );
  reports.push(
    "Privacy request opens the right topic and persists an owned support ticket",
  );

  const admin = await session("preview.admin@ruchigo.test", "admin");
  for (const [email, role, routes] of [
    [
      "preview.admin@ruchigo.test",
      "admin",
      ["admin-profile", "admin-dashboard", "admin-reviews", "admin-activity"],
    ],
    [
      "preview.delivery@ruchigo.test",
      "delivery",
      ["delivery-profile", "delivery-dashboard"],
    ],
    [
      "owner.spice@ruchigo.online",
      "restaurant",
      ["restaurant-profile", "restaurant-dashboard"],
    ],
  ]) {
    const partner = role === "admin" ? admin : await session(email, role);
    for (const width of [1440, 390]) {
      await partner.page.setViewportSize({ width, height: 1000 });
      for (const route of routes) {
        await partner.page.goto(`${base}/${route}`, {
          waitUntil: "networkidle",
        });
        await expect(partner.page.locator("main h1")).toBeVisible();
        await noOverflow(partner.page);
        if (route.endsWith("profile"))
          await partner.page.screenshot({
            path: `/private/tmp/ruchigo-${role}-profile-${width}.png`,
            fullPage: true,
          });
      }
    }
  }
  await admin.page.setViewportSize({ width: 1440, height: 1000 });
  reports.push(
    "Admin, restaurant and delivery profile/overview pages render without mobile overflow",
  );
  const orders = await api("/orders/?status=delivered", {
    token: customer.token,
  });
  const eligible = orders.results.find(
    (order) => order.status === "delivered" && !order.review,
  );
  assert.ok(
    eligible,
    "Run test:product first to create a delivered fixture order",
  );
  reviewOwner = customer.token;
  reviewOrder = eligible.id;
  const review = await api("/reviews/", {
    token: reviewOwner,
    method: "POST",
    body: { order: reviewOrder, rating: 4, comment: reviewMarker },
  });
  try {
    await admin.page.goto(`${base}/admin-reviews`, {
      waitUntil: "networkidle",
    });
    const card = admin.page
      .locator("article")
      .filter({ hasText: `Order #${review.order}` })
      .first();
    await card
      .getByRole("button", { name: "Hide review", exact: true })
      .click();
    await admin.page
      .getByLabel("Reason for moderation")
      .fill("Temporary automated review moderation test");
    await admin.page
      .getByRole("button", { name: "Confirm visibility change", exact: true })
      .click();
    await expect(card.getByText("Hidden", { exact: true })).toBeVisible();
  } finally {
    await api(`/review-moderation/${review.id}/visibility/`, {
      token: admin.token,
      method: "POST",
      body: {
        is_visible: true,
        reason: "Verify publish action on the temporary test record",
      },
    });
    await cleanupReview();
  }
  await admin.page.goto(`${base}/admin-activity`, { waitUntil: "networkidle" });
  await admin.page.getByLabel("Search activity").fill("review.hidden");
  await admin.page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(admin.page.locator(".audit-list article").first()).toContainText(
    "review.hidden",
  );
  reports.push(
    "Admin moderation records a reason, updates visibility and appears in searchable activity",
  );
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ passed: reports, browserErrors: errors }, null, 2),
  );
} finally {
  try {
    await browser.close();
  } finally {
    await cleanupReview();
  }
}
