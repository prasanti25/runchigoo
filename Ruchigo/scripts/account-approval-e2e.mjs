import assert from "node:assert/strict";
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { chromium, expect as baseExpect } from "@playwright/test";
const expect = baseExpect.configure({ timeout: 20000 });
const output = mkdtempSync(join(tmpdir(), "ruchigo-approval-"));
const env = {
  ...process.env,
  DATABASE_URL: "",
  POSTGRES_URL: "",
  DJANGO_DEBUG: "True",
  DJANGO_DB_ENGINE: "sqlite",
  DJANGO_SQLITE_PATH: join(output, "test.sqlite3"),
  EMAIL_BACKEND: "django.core.mail.backends.locmem.EmailBackend",
  API_ANON_RATE: "1000/min",
  API_USER_RATE: "1000/min",
};
const base = process.env.RUCHIGO_APPROVAL_BASE || "http://127.0.0.1:5173",
  backend = "http://127.0.0.1:8017";
assert.ok(
  ["127.0.0.1", "localhost"].includes(new URL(base).hostname),
  "Approval test frontend must be local",
);
const password = `Local-${randomUUID()}`;
// Only the administrator is provisioned. Every partner/customer below registers
// through the actual browser form against a new isolated database, never live.
execFileSync(
  ".venv/bin/python",
  ["backend/manage.py", "migrate", "--noinput"],
  { env, stdio: "ignore" },
);
execFileSync(
  ".venv/bin/python",
  [
    "backend/manage.py",
    "shell",
    "-c",
    "import sys; from api.models import User; User.objects.create_superuser('approval-admin@example.test', sys.stdin.read())",
  ],
  { env, input: password, stdio: ["pipe", "ignore", "inherit"] },
);
const server = spawn(
  ".venv/bin/python",
  ["backend/manage.py", "runserver", "127.0.0.1:8017", "--noreload"],
  { env, stdio: "ignore" },
);
let browser;
const errors = [];
const tested = [];
let activePage;
async function pageFor(width = 1440) {
  const context = await browser.newContext({
    viewport: { width, height: 1050 },
  });
  await context.route("**/api/v1/**", async (route) => {
    const url = new URL(route.request().url());
    try {
      const response = await route.fetch({
        url: backend + url.pathname + url.search,
      });
      await route.fulfill({ response });
    } catch (error) {
      if (/Route is already handled|Target.*closed/.test(error.message)) return;
      throw error;
    }
  });
  const page = await context.newPage();
  page.setDefaultTimeout(20000);
  page.on("pageerror", (error) => errors.push(error.message));
  return page;
}
async function noOverflow(page) {
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
    `Horizontal overflow at ${page.url()}`,
  );
}
async function login(page, email, role) {
  await page.goto(base + "/login");
  await page.getByLabel("Email Address").fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole("button", { name: role, exact: true }).click();
  await page.getByRole("button", { name: "Login", exact: true }).click();
}
async function register(role, suffix, width) {
  const email = `approval-${suffix}@example.test`;
  const page = await pageFor(width);
  activePage = page;
  await page.goto(`${base}/register?role=${role}`);
  await page.getByLabel("Full Name").fill(`Approval ${suffix}`);
  await page.getByLabel("Email Address").fill(email);
  await page.getByLabel("Mobile Number").fill("9999999999");
  await page.locator('input[name="password"]').fill(password);
  await page.locator('input[name="confirmPassword"]').fill(password);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Create Account", exact: true })
    .click();
  if (role !== "customer") {
    await expect(page).toHaveURL(/pending-approval$/);
    await expect(page.getByText(email, { exact: true })).toBeVisible();
    await noOverflow(page);
  } else {
    await expect(page).toHaveURL(base + "/");
  }
  return { page, email, role };
}
try {
  for (let i = 0; i < 80; i++) {
    try {
      if ((await fetch(backend + "/api/v1/restaurants/")).ok) break;
    } catch {
      /* starting */
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  browser = await chromium.launch({ channel: "chrome", headless: true });
  const rider = await register("delivery", "rider", 390);
  const owner = await register("restaurant", "owner", 1440);
  const secondRider = await register("delivery", "rider-two", 320);
  const customer = await register("customer", "customer", 390);
  tested.push(
    "Real customer registration opens customer home without approval",
  );
  const admin = await pageFor();
  activePage = admin;
  await login(admin, "approval-admin@example.test", "Admin");
  await expect(admin).toHaveURL(/admin-dashboard$/);
  for (const [account, path, width] of [
    [rider, "/admin-users", 390],
    [owner, "/admin-partner-accounts", 1440],
  ]) {
    await admin.setViewportSize({ width, height: 1050 });
    await admin.goto(base + path);
    await expect(admin.locator(".people-pending-notice")).toBeVisible();
    await admin.getByLabel("Search accounts").fill(account.email);
    await admin
      .locator(".people-search")
      .getByRole("button", { name: "Search", exact: true })
      .click();
    await admin.getByLabel("Filter account access").selectOption("pending");
    const row = admin
      .locator(".people-table tbody tr")
      .filter({ hasText: account.email });
    await expect(row).toHaveCount(1);
    await expect(
      row.getByText("Pending approval", { exact: true }),
    ).toBeVisible();
    await noOverflow(admin);
    if (width < 768) {
      const joined = await row.locator(".people-joined-cell").boundingBox();
      const actions = await row.locator(".people-manage-cell").boundingBox();
      assert.ok(
        actions.y >= joined.y + joined.height,
        "Mobile approval actions must not overlap the joining date",
      );
      assert.ok(
        (await row.boundingBox()).height < 300,
        "Mobile account cards must not inherit desktop cell padding",
      );
    }
    await admin.screenshot({
      path: join(output, `${account.role}-pending-${width}.png`),
      fullPage: true,
    });
    await row.getByRole("button", { name: "Approve", exact: true }).click();
    const modal = admin.getByRole("dialog", {
      name: "Approve partner account?",
    });
    await expect(
      modal.getByText(account.email, { exact: false }),
    ).toBeVisible();
    await modal
      .getByLabel("Reason", { exact: true })
      .fill("Reviewed isolated registration and correct role");
    await noOverflow(admin);
    await modal
      .getByRole("button", { name: "Approve account", exact: true })
      .click();
    await expect(modal).toHaveCount(0);
    await expect(row).toHaveCount(0);
    await admin.getByLabel("Filter account access").selectOption("true");
    await expect(row.getByText("Active", { exact: true })).toBeVisible();
    await admin.reload();
    await admin.getByLabel("Search accounts").fill(account.email);
    await admin
      .locator(".people-search")
      .getByRole("button", { name: "Search", exact: true })
      .click();
    await expect(
      admin
        .locator(".people-table tbody tr")
        .filter({ hasText: account.email })
        .getByText("Active", { exact: true }),
    ).toBeVisible();
    activePage = account.page;
    await account.page
      .getByRole("link", { name: "Sign in after approval" })
      .click();
    await expect(account.page.getByLabel("Email Address")).toHaveValue(
      account.email,
    );
    await account.page.locator('input[name="password"]').fill(password);
    await account.page
      .getByRole("button", { name: "Login", exact: true })
      .click();
    await expect(account.page).toHaveURL(
      new RegExp(`/${account.role}-dashboard$`),
    );
    await noOverflow(account.page);
    if (account.role === "delivery")
      await expect(
        account.page.getByRole("button", { name: /Go online/i }).first(),
      ).toBeVisible();
    await account.page.screenshot({
      path: join(output, `${account.role}-dashboard.png`),
      fullPage: true,
    });
    tested.push(
      `${account.role}: browser registration → visible pending queue → approval → reload persistence → original-password login → own dashboard at ${width}px`,
    );
    activePage = admin;
  }
  await admin.setViewportSize({ width: 320, height: 1050 });
  await admin.goto(base + "/admin-delivery-partners");
  await admin.getByLabel("Search delivery partners").fill(secondRider.email);
  await admin.getByLabel("Delivery partner filter").selectOption("pending");
  const card = admin
    .locator(".admin-rider-cards article")
    .filter({ hasText: secondRider.email });
  await expect(
    card.getByText("Pending approval", { exact: true }),
  ).toBeVisible();
  await noOverflow(admin);
  await card
    .getByRole("button", { name: "Approve account", exact: true })
    .click();
  let dialog = admin.getByRole("dialog", { name: "Approve rider account?" });
  await expect(
    dialog.getByRole("button", { name: "Approve account", exact: true }),
  ).toBeDisabled();
  await dialog
    .getByLabel("Reason for this decision")
    .fill("Reviewed isolated rider application");
  await dialog
    .getByRole("button", { name: "Approve account", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await admin.getByLabel("Delivery partner filter").selectOption("active");
  await expect(card.getByText("Active", { exact: true })).toBeVisible();
  await card
    .getByRole("button", { name: "Review access", exact: true })
    .click();
  dialog = admin.getByRole("dialog", { name: "Review rider access" });
  await dialog
    .getByLabel("Reason for this decision")
    .fill("Test account restriction");
  await dialog
    .getByRole("button", { name: "Block account", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  const blockedPage = await pageFor(390);
  await login(blockedPage, secondRider.email, "Delivery");
  await expect(
    blockedPage.getByText(
      "Account access is blocked. Contact support for an access review.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(blockedPage).toHaveURL(/\/login$/);
  await admin.getByLabel("Delivery partner filter").selectOption("blocked");
  await expect(card.getByText("Blocked", { exact: true })).toBeVisible();
  await card
    .getByRole("button", { name: "Restore access", exact: true })
    .click();
  dialog = admin.getByRole("dialog", { name: "Restore rider access?" });
  await dialog
    .getByLabel("Reason for this decision")
    .fill("Resolved isolated access restriction");
  await dialog
    .getByRole("button", { name: "Confirm restore", exact: true })
    .click();
  await expect(dialog).toHaveCount(0);
  await login(blockedPage, secondRider.email, "Delivery");
  await expect(blockedPage).toHaveURL(/delivery-dashboard$/);
  tested.push(
    "320px rider directory: approve / block / correct blocked-login message / restore / original-password login",
  );
  await admin.goto(base + "/admin-users");
  for (const width of [1440, 1280, 1024, 768, 390, 320]) {
    await admin.setViewportSize({ width, height: 1050 });
    await expect(admin.locator(".people-table tbody tr").first()).toBeVisible();
    await noOverflow(admin);
  }
  tested.push(
    "People directory: no page overflow at six desktop/tablet/mobile widths",
  );
  assert.equal(
    await customer.page.evaluate(
      () => JSON.parse(localStorage.getItem("ruchigo-auth")).role,
    ),
    "customer",
  );
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ output, tested, pageErrors: errors }, null, 2));
} catch (error) {
  if (activePage)
    await activePage
      .screenshot({ path: join(output, "failure.png"), fullPage: true })
      .catch(() => {});
  console.error(`Approval test artifacts: ${output}`);
  throw error;
} finally {
  if (browser) await browser.close();
  server.kill("SIGTERM");
}
