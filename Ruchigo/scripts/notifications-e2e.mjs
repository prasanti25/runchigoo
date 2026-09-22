import assert from "node:assert/strict";
import { chromium, expect } from "@playwright/test";

// Uses only existing local preview accounts. Read-state mutations are restored.
const base = "http://127.0.0.1:5173";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
const reports = [];
async function api(path, { token, method = "GET", body } = {}, attempt = 0) {
  // Respect normal API throttling during large read-state restoration batches.
  await new Promise((resolve) => setTimeout(resolve, 250));
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
    const delay = Math.min(
      60000,
      Math.max(
        1000,
        Number(response.headers.get("Retry-After") || 1) * 1000 + 100,
      ),
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
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
  context.setDefaultTimeout(10000);
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
  const page = await context.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return { page, context, token: auth.tokens.access };
}
const bell = (page) => page.locator(".notification-bell:visible");
async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    `Horizontal overflow: ${page.url()}`,
  );
}

try {
  const guest = await browser.newPage();
  let guestPolls = 0;
  guest.on("request", (request) => {
    if (request.url().includes("/notifications/summary/")) guestPolls++;
  });
  await guest.goto(base, { waitUntil: "networkidle" });
  await expect(guest.locator(".notification-bell")).toHaveCount(0);
  assert.equal(guestPolls, 0);
  reports.push(
    "Guest sessions do not display a private inbox or poll notifications",
  );

  for (const [email, role, home] of [
    ["preview.customer@ruchigo.test", "customer", "/profile"],
    ["owner.spice@ruchigo.online", "restaurant", "/restaurant-dashboard"],
    ["preview.delivery@ruchigo.test", "delivery", "/delivery-dashboard"],
    ["preview.admin@ruchigo.test", "admin", "/admin-dashboard"],
  ]) {
    const { page, context, token } = await session(email, role);
    const summary = await api("/notifications/summary/", { token });
    for (const width of [1440, 1024, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(base + home, { waitUntil: "networkidle" });
      await expect(bell(page)).toHaveCount(1);
      await expect(bell(page)).toHaveAttribute(
        "aria-label",
        `Notifications, ${summary.unread_count} unread`,
      );
      await noOverflow(page);
      if (width === 1440 || width === 390)
        await page.screenshot({
          path: `/private/tmp/ruchigo-${role}-notification-bell-${width}.png`,
        });
      await bell(page).focus();
      await bell(page).press("Enter");
      await page.waitForURL(base + "/notifications");
      await expect(
        page.getByRole("heading", { name: "Notifications", exact: true }),
      ).toBeVisible();
      await expect(bell(page)).toHaveCount(1);
      await noOverflow(page);
      if (width === 390)
        await page.screenshot({
          path: `/private/tmp/ruchigo-${role}-notifications-mobile.png`,
        });
    }
    reports.push(
      `${role}: one visible bell, accurate account count, keyboard navigation and 320/390/1024/1440px layout`,
    );

    if (role === "customer") {
      const unread = [];
      let more = true;
      for (let pageNumber = 1; more; pageNumber++) {
        const batch = await api(
          `/notifications/?is_read=false&page=${pageNumber}`,
          { token },
        );
        unread.push(...batch.results);
        more = Boolean(batch.next);
      }
      try {
        if (unread.length) {
          await page
            .getByRole("button", { name: "Unread", exact: true })
            .click();
          await page
            .locator(".notification-list article.unread")
            .first()
            .getByRole("button", { name: "Mark read", exact: true })
            .click();
          await expect(bell(page)).toHaveAttribute(
            "aria-label",
            `Notifications, ${unread.length - 1} unread`,
          );
          if (unread.length > 1)
            await page
              .getByRole("button", { name: "Mark all read", exact: true })
              .click();
        }
        await expect(bell(page)).toHaveAttribute(
          "aria-label",
          "Notifications, 0 unread",
        );
        await expect(bell(page).locator(".notification-badge")).toHaveCount(0);
        await page.reload({ waitUntil: "networkidle" });
        await expect(bell(page)).toHaveAttribute(
          "aria-label",
          "Notifications, 0 unread",
        );
        await expect(
          page.getByRole("button", { name: "Mark all read", exact: true }),
        ).toBeDisabled();
        assert.equal(
          (await api("/notifications/summary/", { token })).unread_count,
          0,
        );
        reports.push(
          "Mark read / mark all read update the badge immediately and persist across reloads",
        );
      } finally {
        for (const entry of unread)
          await api(`/notifications/${entry.id}/`, {
            token,
            method: "PATCH",
            body: { is_read: false },
          });
      }
      // Explicit UI-only edge cases; no synthetic notification records are saved.
      await page.route("**/notifications/summary/", (route) =>
        route.fulfill({ json: { unread_count: 105 } }),
      );
      await page.reload({ waitUntil: "networkidle" });
      await expect(bell(page)).toHaveAttribute(
        "aria-label",
        "Notifications, 105 unread",
      );
      await expect(bell(page).locator(".notification-badge")).toHaveText("99+");
      await page.unroute("**/notifications/summary/");
      await page.route("**/notifications/summary/", (route) =>
        route.fulfill({
          status: 503,
          json: { detail: "Preview connection failure" },
        }),
      );
      await page.reload({ waitUntil: "networkidle" });
      await expect(bell(page)).toHaveAttribute(
        "aria-label",
        "Notifications, unread count unavailable",
      );
      await expect(bell(page).locator(".notification-badge")).toHaveCount(0);
      await page.unroute("**/notifications/summary/");
      await page.getByRole("button", { name: /Retry|Try again/ }).click();
      await expect(bell(page)).toHaveAttribute(
        "aria-label",
        `Notifications, ${unread.length} unread`,
      );
      reports.push(
        "99+ badge, zero state and unavailable-count retry behavior",
      );
    }
    await context.close();
  }
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({ passed: reports, browserErrors: errors }, null, 2),
  );
} finally {
  await browser.close();
}
