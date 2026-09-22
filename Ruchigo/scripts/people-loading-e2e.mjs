import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

// Intentionally local-only. Never use this account-mutation test on production.
const base = "http://127.0.0.1:5173";
const email = `people-ui-${randomUUID()}@example.test`;
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
let createdId;
async function api(path, options = {}) {
  const response = await fetch(`${base}/api/v1${path}`, {
    method: options.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  assert.ok(response.ok, `${path}: HTTP ${response.status}`);
  return response.status === 204 ? null : response.json();
}
const auth = await api("/auth/login/", {
  method: "POST",
  body: {
    email: "preview.admin@ruchigo.test",
    role: "admin",
    password: "RuchiGo-preview-2026",
  },
});
const token = auth.tokens.access;
const original = await api("/orders/16/", { token });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
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
page.setDefaultTimeout(20000);
page.on("pageerror", (error) => errors.push(error.message));
try {
  let release;
  const held = new Promise((resolve) => {
    release = resolve;
  });
  await page.route(
    (url) => url.pathname === "/api/v1/users/",
    async (route) => {
      await held;
      await route.continue();
    },
  );
  await page.goto(`${base}/admin-users`, { waitUntil: "commit" });
  await expect(
    page.locator(".people-directory .ruchigo-loader.is-inline"),
  ).toBeVisible();
  assert.notEqual(
    await page
      .locator(".people-directory .ruchigo-loader-orbit")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.screenshot({
    path: "/private/tmp/ruchigo-people-loading.png",
    fullPage: true,
  });
  release();
  await expect(page.locator(".people-table tbody tr").first()).toBeVisible();
  await page.unrouteAll({ behavior: "wait" });
  await expect(page.locator(".people-directory .ruchigo-loader")).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "Customers", exact: true }).click();
  const customers = await api("/users/?role=customer", { token });
  await expect(page.locator(".people-table tbody tr")).toHaveCount(
    customers.results.length,
  );
  await page.getByLabel("Filter account access").selectOption("false");
  const inactive = await api("/users/?role=customer&is_active=false", {
    token,
  });
  await expect(page.locator(".people-table tbody tr")).toHaveCount(
    inactive.results.length,
  );
  await page
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await page.getByRole("button", { name: "Add account", exact: true }).click();
  let modal = page.getByRole("dialog", { name: "Add account", exact: true });
  await modal.getByLabel("First name", { exact: true }).fill("Directory QA");
  await modal.getByLabel("Email", { exact: true }).fill(email);
  await modal.getByLabel("Initial password").fill("Preview-only-people-2026");
  await modal
    .getByLabel("Reason for this change")
    .fill("Local UI regression fixture");
  await modal
    .getByRole("button", { name: "Save account", exact: true })
    .click();
  await expect(modal).toHaveCount(0);
  createdId = (
    await api(`/users/?search=${encodeURIComponent(email)}`, { token })
  ).results.find((row) => row.email === email)?.id;
  assert.ok(createdId);
  await page.getByLabel("Search accounts", { exact: true }).fill(email);
  await page
    .locator(".people-search")
    .getByRole("button", { name: "Search", exact: true })
    .click();
  await expect(page.locator(".people-table tbody tr")).toHaveCount(1);
  await page.getByRole("button", { name: "Edit details", exact: true }).click();
  modal = page.getByRole("dialog", { name: "Edit account", exact: true });
  await modal
    .getByLabel("First name", { exact: true })
    .fill("Directory updated");
  await modal
    .getByLabel("Reason for this change")
    .fill("Verify persisted edit");
  await modal
    .getByRole("button", { name: "Save account", exact: true })
    .click();
  await expect(page.locator(".people-table")).toContainText(
    "Directory updated",
  );
  const more = page.getByRole("button", {
    name: `More actions for ${email}`,
    exact: true,
  });
  await more.click();
  await expect(
    page.getByRole("button", { name: "Block access", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(more).toBeFocused();
  await expect(page.locator(".people-action-popover")).toHaveCount(0);
  for (const [action, title, confirm, status] of [
    ["Block access", "Block account access?", "Confirm block", "Inactive"],
    ["Restore access", "Restore account access?", "Confirm restore", "Active"],
  ]) {
    await more.click();
    await page.getByRole("button", { name: action, exact: true }).click();
    modal = page.getByRole("dialog", { name: title, exact: true });
    await modal
      .getByLabel("Reason", { exact: true })
      .fill("Local access workflow regression");
    await modal.getByRole("button", { name: confirm, exact: true }).click();
    await expect(page.locator(".people-access-badge")).toHaveText(status);
  }
  assert.equal(
    (await api(`/users/${createdId}/`, { token })).first_name,
    "Directory updated",
  );
  await api(`/users/${createdId}/`, { token, method: "DELETE" });
  createdId = null;
  await page.goto(`${base}/admin-users`);
  await expect(page.locator(".people-table tbody tr").first()).toBeVisible();
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1100 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      `People overflow at ${width}`,
    );
    await page.screenshot({
      path: `/private/tmp/ruchigo-people-refined-${width}.png`,
      fullPage: true,
    });
  }
  for (const reducedMotion of ["no-preference", "reduce"]) {
    const loadingContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion,
    });
    const loadingPage = await loadingContext.newPage();
    loadingPage.on("pageerror", (error) => errors.push(error.message));
    let resume;
    const pending = new Promise((resolve) => {
      resume = resolve;
    });
    await loadingPage.route(
      (url) => url.pathname === "/src/pages/About.jsx",
      async (route) => {
        await pending;
        await route.continue();
      },
    );
    await loadingPage.goto(`${base}/about`, { waitUntil: "commit" });
    const loader = loadingPage.locator(".ruchigo-loader.is-page");
    await expect(loader).toBeVisible();
    assert.ok(
      await loader
        .locator("img")
        .evaluate((el) => el.complete && el.naturalWidth > 0),
    );
    const animation = await loader
      .locator(".ruchigo-loader-orbit")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName);
    assert.equal(animation === "none", reducedMotion === "reduce");
    await loadingPage.screenshot({
      path: `/private/tmp/ruchigo-brand-loader-${reducedMotion}.png`,
    });
    resume();
    await expect(loader).toHaveCount(0);
    await loadingContext.close();
  }
  const unchanged = await api("/orders/16/", { token });
  assert.deepEqual(unchanged.events, original.events);
  assert.equal(unchanged.status, original.status);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      passed: [
        "Role/access filters and server search",
        "Create/edit/block/restore with persisted data",
        "Keyboard-dismissable account actions",
        "1440/1024/768/390/320 layouts",
        "Original-logo orbit loader on actual pending data and page chunks",
        "Reduced-motion support; no artificial navigation delay",
      ],
      browserErrors: errors,
      userOrder16Unchanged: true,
    }),
  );
} finally {
  if (createdId) {
    const candidate = await api(`/users/${createdId}/`, { token });
    if (candidate.email === email)
      await api(`/users/${createdId}/`, { token, method: "DELETE" });
  }
  await browser.close();
}
