# Partner workspace refresh — 23 September 2026

Scope: apply the admin console's desktop/mobile design quality to every active
restaurant and delivery workspace, including shared account and support pages.
This is not a claim that all features in the wider 300-item product matrix exist.

## Page coverage

| Restaurant manager | Delivery partner | Shared, verified under each role |
| --- | --- | --- |
| `/restaurant-dashboard` — kitchen flow, live counts, period reports, CSV | `/delivery-dashboard` — availability, active routes, assignment record | `/settings` — profile and password forms |
| `/restaurant-orders` — status filters, exact order links, accept/prepare/pickup queue | `/delivery-orders` — available requests and assigned deliveries | `/notifications` — filters, unread states and links |
| `/restaurant-menu` — search/category/availability, dishes, stock and add-ons | `/delivery-navigation` — pickup, directions, contact, GPS consent and OTP | `/support` — partner topics, ticket composer, conversations and FAQs |
| `/restaurant-profile` — business details, opening hours and listing preview | `/delivery-earnings` — searchable, paginated delivery history | |
| `/restaurant-offers` — campaign cards, coupon rules and BOGO editor | `/delivery-profile` — photo, contact, availability and security links | |
| `/restaurant-earnings` — payments, filters, ledger and settlement records | | |
| `/restaurant-analytics` — interactive chart, dates, CSV and existing insights | | |

18 role/page combinations, plus dialogs and tab states. The original logo remains.
The grouped rail, command search, notification bell, mobile role header and
animated navigation are shared. Partner pages expose no admin destinations.

## Behavior and data

- Metrics use existing authenticated, role-scoped APIs; no fake activity was
  inserted to fill charts. Delivery customer bill totals are not rider earnings.
- Kitchen historical performance is separate from the current queue. The
  overview uses 7/30/90 complete IST-day windows; CSV preserves backend values.
- Missing/failed reads display unknown values and retry. Empty histories stay
  empty. Menu availability/category/search filters are server-backed.
- Exact recent-order links retain status/order filters; kitchen/history
  pagination is URL-backed. Prepared/paid kitchen orders use issue review;
  simple decline is only offered for an unpaid, unaccepted order and requires
  confirmation. Backend expected-status validation is unchanged.
- Existing pickup, handover OTP, GPS permission, support and finance endpoints
  retain their authorization and operational controls.
- Partner support now has role-relevant topics and FAQs, not customer food-order
  recommendations or self-service food-refund prompts.

## Verification

- `npm run test:partner-workspace`: all 18 page/role combinations at 1440,
  1280, 1024, 768, 390 and 320px; browser/API errors, overflow, controls,
  command-search isolation, menu filters, exact report CSV, queue links and
  unchanged local order totals. Operational writes are blocked.
- `npm run test:partner-details`: 15 deeper cases covering add-on groups, edit
  dish, weekly schedule, offer/meal/BOGO coupon dialogs, payment filters, report
  dates, both support forms, settings, report failure/recovery, completed
  delivery and pickup/OTP UI states. Pickup/OTP states use explicitly labelled
  browser-only responses derived from a local record, not reopened orders.
- `npm run test:mobile-navigation`: six shopper/workspace scenarios; focus,
  dismissal, scroll lock, touch targets, reduced motion and desktop resize.
- `npm run test:admin-workspace` and `npm run test:admin-command`: all 19 admin
  routes remain responsive; command keyboard controls and permissions pass.
- `npm run test:merchant-finance`: real isolated database/API journey across
  merchant acceptance/preparation, rider pickup/OTP delivery, accounting,
  settlement/correction and admin shopping; no shared policies are enabled.
  Its proxy handler now tolerates cancelled routes during navigation/teardown.
- 100 targeted Django tests pass in an isolated in-memory SQLite test database:
  dashboards, menu operations, delivery chat, support operations and merchant
  finance. This is not a production PostgreSQL concurrency test.
- Four partner-report and seven chart unit tests, lint and production build.

To test the actual compiled frontend using the retained local API:

```sh
npm run preview -- --host 127.0.0.1 --port 4175 --strictPort
RUCHIGO_WORKSPACE_BASE=http://127.0.0.1:4175 npm run test:partner-workspace
```

The browser tests are intentionally restricted to local hosts. Production
acceptance must not reuse preview passwords, seed fixtures or reset accounts.

## Unchanged activation boundaries

No database migration, shared record seed/reset, payment-provider activation,
commission/reward-policy change or real refund/payout is part of this UI release.
Production uploads still need durable storage, and rider payouts/incentives
need an approved implementation/provider. Existing feature gaps remain in
`IMPLEMENTATION_TODOS.md`; they are not marked complete by this visual refresh.

Live runtime/alias verification belongs in `VERIFICATION_REPORT.md` after
deployment, not inferred from a Git push or a local screenshot.
