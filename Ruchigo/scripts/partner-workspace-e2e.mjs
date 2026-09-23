import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chromium, expect as baseExpect } from "@playwright/test";
import { partnerReportCsv } from "../src/lib/partnerOverview.js";

// Existing local records only. No seeds, account resets or operational writes.
const base = process.env.RUCHIGO_WORKSPACE_BASE || "http://127.0.0.1:5173";
assert.equal(new URL(base).hostname, "127.0.0.1", "Local-only test target");
assert.ok(
  ["5173", "4175"].includes(new URL(base).port),
  "Use a known local development or build-preview server",
);
const output = mkdtempSync(join(tmpdir(), "ruchigo-partner-workspace-"));
const expect = baseExpect.configure({ timeout: 20000 });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [],
  failures = [],
  writes = [];
const roles = [
  {
    role: "restaurant",
    email: "owner.spice@ruchigo.online",
    routes: [
      "dashboard",
      "orders",
      "menu",
      "profile",
      "offers",
      "earnings",
      "analytics",
    ],
  },
  {
    role: "delivery",
    email: "preview.delivery@ruchigo.test",
    routes: ["dashboard", "orders", "navigation", "earnings", "profile"],
  },
];
async function fit(page, label) {
  await expect
    .poll(
      () =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      { message: label + " document overflow" },
    )
    .toBe(true);
  const clipped = await page.locator(".workspace-main").evaluate((main) =>
    [...main.querySelectorAll("input, select, button")]
      .filter((el) => {
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return false;
        for (let p = el.parentElement; p && p !== main; p = p.parentElement) {
          if (
            p.hidden ||
            getComputedStyle(p).display === "none" ||
            (p.tagName === "DETAILS" && !p.open && !el.closest("summary"))
          )
            return false;
          if (["auto", "scroll"].includes(getComputedStyle(p).overflowX))
            return false;
        }
        return rect.left < -1 || rect.right > innerWidth + 1;
      })
      .map(
        (el) =>
          el.getAttribute("aria-label") || el.textContent.trim().slice(0, 50),
      ),
  );
  assert.deepEqual(clipped, [], label + " controls clipped");
}
try {
  for (const actor of roles) {
    const login = await fetch(base + "/api/v1/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: actor.email,
        role: actor.role,
        password: process.env.RUCHIGO_SEED_PASSWORD || "RuchiGo-preview-2026",
      }),
    });
    assert.equal(login.status, 200, actor.role + " login");
    const auth = await login.json();
    const get = async (path) => {
      const response = await fetch(base + "/api/v1" + path, {
        headers: { Authorization: "Bearer " + auth.tokens.access },
      });
      assert.equal(response.status, 200, path);
      return response.json();
    };
    const before = await get("/orders/summary/");
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
            expiresAt: Date.now() + 3600000,
          }),
        ),
      auth,
    );
    await context.route("**/api/v1/**", async (route) => {
      const request = route.request();
      if (
        !["GET", "HEAD", "OPTIONS"].includes(request.method()) &&
        !request.url().includes("/auth/")
      ) {
        writes.push(request.method() + " " + new URL(request.url()).pathname);
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.url().includes("/api/v1/") && response.status() >= 400)
        failures.push(
          response.status() + " " + new URL(response.url()).pathname,
        );
    });
    let latestReport;
    page.on("response", async (response) => {
      if (response.url().includes("/api/v1/insights/?") && response.ok())
        latestReport = await response.json();
    });
    for (const route of [
      ...actor.routes.map((name) => actor.role + "-" + name),
      "settings",
      "notifications",
      "support",
    ]) {
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(base + "/" + route);
      await expect(
        page.locator(".workspace-partner .workspace-heading h1"),
      ).toBeVisible();
      await expect(
        page.locator(".skeleton:visible, .ruchigo-loader:visible"),
      ).toHaveCount(0);
      await page.waitForLoadState("networkidle");
      for (const width of [1440, 1280, 1024, 768, 390, 320]) {
        await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
        await fit(page, actor.role + " " + route + " " + width);
        if ([1440, 390].includes(width))
          await page.screenshot({
            path: join(output, actor.role + "-" + route + "-" + width + ".png"),
            fullPage: true,
          });
      }
      console.log("PASS", route, "six viewport sizes");
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(base + "/" + actor.role + "-dashboard");
    await page
      .getByRole("button", { name: `Find a ${actor.role} workspace` })
      .click();
    const search = page.getByRole("textbox", {
      name: `Search ${actor.role} workspaces`,
    });
    await expect(search).toBeFocused();
    const destinations = await page
      .locator(".admin-command-results a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    assert.ok(
      destinations.every((path) => !path.startsWith("/admin-")),
      "No admin destinations exposed",
    );
    await search.fill(actor.role === "restaurant" ? "menu" : "history");
    await search.press("Enter");
    await expect(page.locator(".workspace-heading h1")).toHaveText(
      actor.role === "restaurant" ? "Menu & availability" : "Delivery history",
    );
    if (actor.role === "restaurant") {
      await page
        .getByLabel("Menu availability", { exact: true })
        .selectOption("false");
      await expect
        .poll(() => page.locator(".food-card .status-pill").allTextContents())
        .toEqual(
          (await get("/menu-items/?is_available=false")).results.map(
            () => "Unavailable",
          ),
        );
      await page
        .getByLabel("Menu availability", { exact: true })
        .selectOption("");
      await page.getByRole("button", { name: "Add dish", exact: true }).click();
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await expect(page.getByRole("dialog")).toBeVisible();
        assert.ok(
          await page
            .getByRole("dialog")
            .evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
          "Menu editor fits",
        );
        await page
          .getByRole("button", { name: "Save dish", exact: true })
          .scrollIntoViewIfNeeded();
        await expect(
          page.getByRole("button", { name: "Close dialog" }),
        ).toBeInViewport();
        await page.screenshot({
          path: join(output, "menu-editor-" + width + ".png"),
        });
      }
      await page.getByRole("button", { name: "Close dialog" }).click();
      await page.setViewportSize({ width: 1440, height: 1000 });
      await page.goto(base + "/restaurant-dashboard");
      await page
        .getByRole("button", { name: "Last 30 days", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Last 30 days", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await expect(page.locator(".performance-panel")).toBeVisible();
      const download = page.waitForEvent("download");
      await page.getByRole("button", { name: "Export", exact: true }).click();
      const file = await download;
      assert.equal(
        readFileSync(await file.path(), "utf8"),
        partnerReportCsv(latestReport),
      );
      await page
        .getByRole("button", { name: "Trend chart", exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: "Trend chart", exact: true }),
      ).toHaveAttribute("aria-pressed", "true");
      await page
        .getByRole("link", { name: /orders? needs? your response/ })
        .click();
      await expect(page).toHaveURL(/restaurant-orders\?status=pending/);
      if (
        await page
          .getByRole("button", { name: "Reject order", exact: true })
          .count()
      ) {
        await page
          .getByRole("button", { name: "Reject order", exact: true })
          .first()
          .click();
        await expect(page.getByRole("dialog")).toContainText(
          "has not been accepted",
        );
        await page
          .getByRole("button", { name: "Keep order", exact: true })
          .click();
      }
    } else {
      await page
        .getByLabel("Search delivery history", { exact: true })
        .fill("no-matching-order-xyz");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(
        page.getByText("No matching deliveries", { exact: true }),
      ).toBeVisible();
      await page
        .getByLabel("Delivery history status")
        .selectOption("cancelled");
      await expect(
        page.getByText("No matching deliveries", { exact: true }),
      ).toBeVisible();
    }
    assert.deepEqual(
      await get("/orders/summary/"),
      before,
      actor.role + " orders unchanged",
    );
    await context.close();
  }
  assert.deepEqual(errors, [], "Browser errors");
  assert.deepEqual(failures, [], "API errors");
  assert.deepEqual(writes, [], "No business writes attempted");
  console.log(
    JSON.stringify(
      {
        passed: true,
        routes: 18,
        widths: [1440, 1280, 1024, 768, 390, 320],
        output,
      },
      null,
      2,
    ),
  );
} catch (error) {
  console.log("Artifacts", output);
  throw error;
} finally {
  await browser.close();
}
