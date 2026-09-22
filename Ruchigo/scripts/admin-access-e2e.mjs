import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { chromium, expect } from "@playwright/test";

const base = "http://127.0.0.1:5173";
const marker = `access-qa-${randomUUID()}`;
const password = `QA-${randomUUID()}`;
const db = "/private/tmp/ruchigo-product-preview.sqlite3";
const emails = [
  `${marker}-root@example.test`,
  `${marker}-delegate@example.test`,
];
function django(code) {
  const output = execFileSync(
    ".venv/bin/python",
    ["backend/manage.py", "shell", "-c", code],
    { env: { ...process.env, DJANGO_SQLITE_PATH: db }, encoding: "utf8" },
  );
  return JSON.parse(output.trim().split("\n").at(-1));
}
const ids = django(`import json
from django.db import connection, transaction
from api.models import User, AdminAccessGrant
assert str(connection.settings_dict['NAME']) == ${JSON.stringify(db)}
with transaction.atomic():
    root = User.objects.create_superuser(${JSON.stringify(emails[0])}, ${JSON.stringify(password)})
    delegate = User.objects.create_user(${JSON.stringify(emails[1])}, ${JSON.stringify(password)}, role='admin')
    AdminAccessGrant.objects.create(user=delegate, scopes=[])
print(json.dumps([root.pk, delegate.pk]))`);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const errors = [];
async function session(email) {
  const response = await fetch(`${base}/api/v1/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "admin" }),
  });
  assert.equal(response.status, 200);
  const auth = await response.json();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  context.setDefaultTimeout(20000);
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
  return { page, token: auth.tokens.access };
}
try {
  const root = await session(emails[0]);
  const delegate = await session(emails[1]);
  await delegate.page.goto(`${base}/admin-dashboard`, {
    waitUntil: "networkidle",
  });
  await expect(
    delegate.page.getByRole("heading", {
      name: "Waiting for workspace access",
    }),
  ).toBeVisible();
  await delegate.page.setViewportSize({ width: 390, height: 1000 });
  await expect(
    delegate.page
      .getByLabel("Partner navigation")
      .locator('option[value="/admin-payments"]'),
  ).toHaveCount(0);
  await expect(
    delegate.page
      .getByLabel("Partner navigation")
      .locator('option[value="/support"]'),
  ).toHaveCount(0);
  await delegate.page.setViewportSize({ width: 1440, height: 1000 });
  await expect(
    delegate.page
      .getByRole("navigation", { name: "admin workspace" })
      .getByRole("link", { name: "Payments", exact: true }),
  ).toHaveCount(0);
  await root.page.goto(`${base}/admin-access`, { waitUntil: "networkidle" });
  const card = root.page
    .locator(".access-grid > section")
    .filter({ hasText: emails[1] });
  await card.getByRole("button", { name: "Review permissions" }).click();
  const dialog = root.page.getByRole("dialog");
  await dialog
    .getByLabel("Support conversations and feedback", { exact: true })
    .check();
  await dialog
    .getByLabel("Reason for access change")
    .fill("Temporary local verification: support-only delegate");
  for (const width of [1440, 390, 320]) {
    await root.page.setViewportSize({ width, height: 1000 });
    assert.ok(
      await root.page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await root.page.screenshot({
      path: `/private/tmp/ruchigo-team-permissions-${width}.png`,
      fullPage: true,
    });
  }
  await dialog.getByRole("button", { name: "Save permissions" }).click();
  await expect(dialog).toHaveCount(0);
  await delegate.page.reload({ waitUntil: "networkidle" });
  await expect(
    delegate.page.getByRole("link", {
      name: "Support conversations Open workspace",
    }),
  ).toBeVisible();
  await delegate.page.goto(`${base}/support`, { waitUntil: "networkidle" });
  await expect(
    delegate.page.getByRole("heading", { name: "Let’s sort it out." }),
  ).toBeVisible();
  await delegate.page.goto(`${base}/admin-payments`, {
    waitUntil: "networkidle",
  });
  await expect(
    delegate.page.getByRole("heading", { name: "Workspace access required" }),
  ).toBeVisible();
  for (const path of [
    "payments/",
    "refund-requests/",
    "users/",
    "admin-access/",
  ]) {
    const response = await fetch(`${base}/api/v1/${path}`, {
      headers: { Authorization: `Bearer ${delegate.token}` },
    });
    assert.equal(response.status, 403, path);
  }
  await root.page.setViewportSize({ width: 1440, height: 1000 });
  await card.getByRole("button", { name: "Review permissions" }).click();
  await dialog
    .getByLabel("Support conversations and feedback", { exact: true })
    .uncheck();
  await dialog
    .getByLabel("Reason for access change")
    .fill("Revoke the test scope without replacing the delegate session");
  await dialog.getByRole("button", { name: "Save permissions" }).click();
  await expect(dialog).toHaveCount(0);
  const revoked = await fetch(`${base}/api/v1/support/`, {
    headers: { Authorization: `Bearer ${delegate.token}` },
  });
  assert.equal(revoked.status, 403);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify(
      {
        passed: [
          "Superuser-only team permission editor",
          "Delegated navigation and direct API denial",
          "Support-only access without financial or account permissions",
          "Immediate API revocation using the same session",
          "320/390/1440 permission modal layout",
        ],
        browserErrors: errors,
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
  const removed = django(`import json
from django.db import connection, transaction
from api.models import User
assert str(connection.settings_dict['NAME']) == ${JSON.stringify(db)}
with transaction.atomic():
    root = User.objects.get(pk=${ids[0]}, email=${JSON.stringify(emails[0])})
    delegate = User.objects.get(pk=${ids[1]}, email=${JSON.stringify(emails[1])})
    assert not root.orders.exists() and not delegate.orders.exists()
    root.delete()
    delegate.delete()
print(json.dumps({'removed_test_accounts': 2}))`);
  console.log(JSON.stringify(removed));
}
