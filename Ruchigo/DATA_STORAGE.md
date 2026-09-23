# RuchiGo data storage

## Live application

Local increment note (23 September): migrations 0023–0027 are **not applied to
production**. They add restaurant schedule settings, order preparation time/cash
tip, optional tip-policy fields, coupon benefit/campaign rules and a redeemable
coupon link on offers. Orders keep the applied coupon rule/version in their
delivery quote snapshot. Existing totals and discount codes are preserved by
defaults. Analytics query owned/scoped order/payment/refund records; there is no
separate hard-coded spending balance. Rewards use `api_rewardaccount`,
`api_rewardentry` and `api_rewardpolicy`, with order-level redemption/rule
snapshots and transaction-locked balances. This is promotional credit, not a
bank/deposit wallet. `api_servicecity` holds city availability overrides;
`api_deliverypricingrule` holds finite, explicitly enabled pricing windows.
Merchant finance adds `api_commissionpolicy`, `api_merchantaccount`,
`api_merchantentry` and `api_merchantsettlement`, plus private order commission
snapshots. External settlement records are finance attestations, not provider
transfers. Ledger corrections preserve the original record; there is no
balance-edit/delete API. New accounting remains disabled on the shared preview.
See IMPLEMENTATION_TODOS.md for remaining KYC, payout and tax-accounting work.

The Vercel deployment runs the React frontend and Django API. The API connects
to **Neon PostgreSQL** through server-only `DATABASE_URL` / `POSTGRES_URL`.
Vercel is the application host; it is not where database rows are stored.
Vercel startup now refuses a missing database URL instead of falling back to
ephemeral SQLite.

| Data | Persistent source |
| --- | --- |
| Customer, restaurant-owner, courier and admin accounts | `api_user`; Django password hashes, not plaintext passwords |
| Restaurant profiles, approval, hours, menu prices, choices, stock | `api_restaurant`, `api_menuitem`, `api_category` |
| Addresses, carts, saved dishes/restaurants and preferences | Account-linked PostgreSQL tables |
| Orders, line items, totals, address snapshots and status history | `api_order`, `api_orderitem`, `api_orderevent` |
| Courier assignment and latest submitted GPS fix | `api_deliveryassignment`; no simulated production movement |
| Payments and refund requests | `api_payment`, `api_refundrequest`; status is distinct from actual provider completion |
| Reviews, support threads, delivery chat and notifications | PostgreSQL tables linked to the permitted account/order |
| Admin scopes and activity | `api_adminaccessgrant`, `api_auditlog` |

The frontend fetches these records through `/api/v1/`. Its browser storage keeps
the current authentication session, cached profile, theme/location preferences
and temporary UI state. It is not the source of truth for accounts, menu data,
orders or courier work. JWT session storage is not a replacement for secure
HttpOnly-cookie authentication; that is separate security-hardening work.

## Sample data is not a real merchant network

The existing live database contains four **starter/sample restaurants** and
twelve sample dishes from an earlier explicit seed. These are editable database
records, not frontend arrays or verified operational businesses. Seeded ratings
and offers are illustrative and must not be treated as real commercial claims.
Existing records are preserved during this deployment, not silently deleted or
reseeded. A real launch requires onboarding and reviewing actual merchants,
menus, prices, photos, operating hours, locations and couriers.

The deployment does **not** copy the local preview SQLite database, local test
accounts, demonstration GPS paths or test orders. The demo route is excluded
from the production build. Unrouted legacy mock pages remain in source history
but are not used by the active customer/partner/admin routes or bundle.
Decorative photos, labels and icons are static assets, not business records.

## Upload and provider limitations

- Uploaded photos need persistent object storage. The current Vercel deployment
  has no such provider configured. Profile uploads are explicitly unavailable
  while the default storage is a serverless local filesystem; other profile
  edits remain available. Local development can still upload to `backend/media`.
  Menu image URLs are stored in the database; the image bytes remain on their
  source host. This release does not claim persistent production photo uploads.
- Razorpay is not enabled without provider keys. COD records persist in the
  database, but no actual payment, refund or payout is implied by a UI request.
- Commission, payout, tax and final fee/refund policies await business approval.
  The existing fallback delivery rule is ₹40 below ₹500, otherwise ₹0; it is a
  development default, **not** an approved commercial policy. Configured delivery
  zones can supply database-backed delivery rates. Do not use this preview for
  real commercial ordering until policies and operations are approved.
- Gemini/IPinfo/LocationIQ/payment/database secrets belong in server environment variables,
  never `VITE_*`, browser responses, source control or public screenshots.
- Optional LocationIQ reverse geocoding receives only a customer-authorized pin,
  not their account/order or typed flat details. Normalized lookup results are
  cached for up to 24 hours under a hashed coordinate key. Confirmed account
  addresses remain in PostgreSQL; the selected address also persists in the
  browser until changed or signed out. A provider lookup alone creates no address.

## Inspecting data

Use the role dashboards for normal operations. For database inspection, open the
connected Neon integration from Vercel's Storage/Integrations area, then its
database console. Treat account, address, order and conversation tables as
private data. Do not publish exports or share connection strings in chat.

## Releases

Back up the connected database, rehearse pending migrations against an isolated
restored database, then run `manage.py migrate --noinput` before routing the new
deployment to it. Existing startup code initializes an empty database only; it
does **not** apply upgrades automatically to an existing database. Never run
`seed_preview` or `seed_ruchigo --allow-production` as a release step. Backups must
stay outside Git and have restricted permissions and an appropriate retention
policy. A manual pre-release backup is not a scheduled backup/restore program.

Production environments currently share some Neon integration variables with
Preview/Development. Do not run destructive tests or seeds against those URLs;
use an isolated database/branch for previews that need to write data.

At this release check the Git remote is `prasanti25/runchigoo`, while the Vercel
project is linked to `shxvaayy/runchigoo`. Therefore a push to this remote is not
proof of deployment. Deploy from this app directory to the existing linked
Vercel project and verify its production alias. Git-triggered deployment needs
an explicit repository/root-directory alignment; this release does not silently
repoint the existing integration.
