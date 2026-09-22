# Product verification — 22 September 2026

## Release verification

- The consolidated **260-test suite passed on isolated PostgreSQL**. The prior
  257-test SQLite suite and the 59-test product/storage rerun also passed.
  This is backend regression evidence, not a concurrent-load certification.
- A restricted pre-upgrade production backup was restored to an isolated local
  PostgreSQL database. Migrations 0012–0022 passed; every pre-existing column and
  row across 24 application tables was unchanged by the rehearsal.
- `npm run check` and `test:dashboard-queues` passed again, including 320/390/1440px,
  zero browser errors, zero business writes and unchanged local user order 16.
- Staged source and built JavaScript passed configured-secret checks. Local demo
  route/coordinates and the old hardcoded food catalog are absent from the bundle.
- Serverless startup requires an external database URL. Profile-photo uploads
  fail safely and show their unavailability until durable file storage is set up;
  other profile edits continue working. Three new storage tests cover this gate.
- See `DATA_STORAGE.md` for the actual Neon database, existing sample restaurant
  records and remaining provider/financial-policy limitations. Historical local
  checkpoints below describe the state at their respective test runs.

Preview: http://localhost:5173. API: http://127.0.0.1:8000.
Isolated fixture database: `/private/tmp/ruchigo-product-preview.sqlite3`.

## Latest dashboards, delegated access and delivery conversations

- New working workspaces: server-paginated People, order queue, admin/restaurant
  payment ledger, finance refund-review controls, category access, superuser-only
  team delegation and private customer–courier messaging.
- Reporting moved from a 10,000-row Python slice to SQL aggregates. Tests include
  **10,001 orders**, matching list/summary filters, timezone boundaries, date
  validation, previous-period comparisons and role separation.
- `test:dashboard-chat` passed: People create/edit/block/restore, matching search,
  admin/restaurant date ranges and CSV, real two-way delivery messages/read
  receipts/reload and terminal read-only history. Fixture **31** delivered;
  desktop/mobile at 1440/390/320px; zero browser errors. The first run exposed a
  test helper expecting 200 instead of 201 from cart insertion. Only unchanged
  test cart item **42** was removed before rerun; no user cart was replaced.
- `test:admin-access` passed: actual superuser grant edits, no-scope landing,
  support-only workspace, finance/account API denial, same-session revocation,
  and 1440/390/320px permission modal. The two explicitly seeded temporary test
  administrator accounts were deleted by exact ID/email in the isolated DB;
  audit entries remain. No existing admin authority was changed.
- `test:dashboard-queues` passed read-only: order pagination/search/status,
  activity detail, payment filters/matching counts, admin-only refund controls,
  responsive widths and zero business writes/browser errors.
- Cancellation suite passed on new fixtures **32/33**; support suite passed on
  fixture **34**, conversation **40**, including holds/admin decisions. User
  order **16** remained unchanged. The cancellation test now checks next-step
  controls/no reopen control plus actual backend rewind rejection, replacing
  assertions about the removed generic status dropdown.
- Full product browser rerun passed on fixture **36** through catalog, checkout,
  kitchen, real stored GPS, courier code, rating, support, notifications and
  responsive role pages with zero browser errors. A preceding run completed
  fixture **35** but timed out while the app was at its screen-loading boundary;
  it was rerun with application edits stopped. No business assertion was weakened.
- Final consolidated backend rerun passed **257 tests**. The three new modules
  also passed independently as a **39-test** suite. Minimal merchant lookup,
  private/no-store headers, partner-only counts and current-scope enforcement are
  covered. Final lint/build and migration-drift/system checks pass.
- Read-only queue checks were repeated after the catalog/partner-access routes
  were added. Temporary QA-account count and automated public-review count are
  both zero. SQLite integrity is `ok` with zero foreign-key violations. Order 16
  remains cancelled (pending → cancelled only), without a delivery assignment.
- Local migrations through **0022** are applied. Earlier release remains at
  0011. No deployment, financial policy activation, real refund, payout, KYC
  certification or final legal publication was performed. Temporary public test
  reviews are exact-ID cleaned by the product suite. Whole product coverage is
  **145 implemented / 76 partial / 5 provider-gated / 74 missing**, not complete.

## Previous persisted support and fulfilment operations

- **218 backend tests pass**, including 23 new tests for persisted assistance,
  owned ticket/message boundaries, greeting/fallback, cooking cancellation
  guidance without mutations, food-arrival/status mismatch, actual refund facts,
  redacted classifier inputs, retry-safe message keys, stale-message suppression,
  team handoff, staff takeover, fulfilment holds, dispatch/pickup/delivery blocks,
  admin-only resume, full original-method refund approval, conflicting refunds,
  stale stage/confirmation checks, cash capture refusal and inventory release.
- `test:support-conversation` passed on real local API/database state using
  fixture order **25** and conversation **34** (kitchen hold: conversation **35**).
  It exercises the reported “hi gets no reply” journey, actual status questions,
  pre-delivery food complaint clarification, cooking-time cancellation refusal,
  reload persistence, explicit team handoff, admin reply/resolution, face feedback,
  kitchen issue/hold, blocked progress, resume without rewind and explicit staff
  cancellation of only the new COD fixture. Zero browser errors. The typing UI
  check delays a real intercepted response by 600 ms; no fake server reply is used.
- `test:cancellations` passed again on fixtures **26/27**, including the new
  required reason cards and live cooking cutoff. `test:checkout-support` passed
  again with QA conversation **36** and no provider refund.
- `test:product` passed fully on fixture **30**. Earlier runs completed deliveries
  **28/29** but their old global text locators matched both optimistic message
  bubbles and composer text. Both checks now target the conversation log, and
  resolved state uses the conversation badge. Default browser action timeouts
  were also made explicit. No business rule was weakened for these selectors.
- Final lint/build and migration checks pass; local database is through **0019**.
  SQLite integrity is `ok`, with no foreign-key violations. Support screenshots
  exposed a form-selector collision that compressed face feedback; composer
  styles now target only `.thread-message-form`. The final read-only responsive
  check verifies all five face buttons fit inside their panel at 320/390/1440px.
- The ticket sidebar is bounded instead of stretching the chat into a large
  empty column. Current-conversation notifications persist without overlay
  toasts. Fulfilment alerts route kitchen/courier accounts to their authorized
  workspace, not a customer's private support ticket. Role-link checks passed.
- User order **16 was already cancelled when this increment was inspected**.
  Its event history was pending → cancelled, with no preparing event. This is
  not a cooking-cancellation bypass. Browser suites now compare its pre-run and
  post-run state instead of assuming it remains pending; none of these tests
  changed it. It still has no delivery assignment.
- No real provider refund, automatic-prepaid policy enablement, push or deploy.
  Razorpay credentials/webhook remain unconfigured. Cash payouts, staffed support,
  production concurrency/provider certification and the wider 300-entry backlog
  are not completed by this increment. Planned rider messaging/legal consent
  receipts were not implemented in this pass; the reported support regression
  took priority.

Final inspected artifacts: `/private/tmp/ruchigo-support-final-1440.png`,
`/private/tmp/ruchigo-support-final-390.png` and the cancellation confirmation/
blocked screenshots. The unchanged feature-matrix counts describe scoped
coverage, not a production-readiness certificate.

## Preceding cancellation verification

- **195 Django tests pass**, including 21 cancellation tests. Covers unpaid/COD
  cancellation, both policy cutoffs, every cooking/later/terminal state, owned
  access, reason validation, kitchen-first and cancellation-first ordering,
  immutable checkout policy, stale quote rejection, one-time stock/coupon
  release, opt-in original-method prepaid refund, missing provider, timeout,
  delayed capture, existing-refund conflicts, recovery-command dry-run/replay,
  owned-order support guidance and admin rewind prevention. Provider calls are
  mocked. Sequential interleavings are tested, not production SQL contention.
- `test:cancellations` passed twice, most recently with fixtures **23/24**.
  History confirmation/keep, tracking cancel/reason, customer/kitchen notices,
  an open modal invalidated by cooking, stale API rejection, order-linked help,
  blocked backwards admin choices and unchanged policy; **320/390/1440px**, zero
  browser errors/overflow. Only created COD fixtures were closed. Earlier
  cancellation fixtures **20/21** are also cancelled.
- `test:checkout-support` passed again, retaining clearly marked resolved QA
  ticket **31**. Its first rerun exposed a test assumption: restaurant reviews
  select the latest eligible meal, not always fixture #17. The script now
  checks the restaurant stars but writes on exact fixture #17, registers the
  response ID before assertions and cleans it in `finally`. That failed run's
  temporary QA review **19** was removed via its exact ID/marker and normal API;
  it was synthetic test data, not a customer review, and is not recoverable
  through the app. No unrelated reviews were removed.
- `test:product` passed again with fixture **22**, through customer checkout,
  kitchen, courier/GPS/pickup/code, delivered rating, support and role pages.
- Final lint and production build passed. Migration drift/check is clean
  through **0017**. SQLite integrity is `ok`; no foreign-key violations.
  Both expiry and cancellation-refund recovery dry-runs found zero candidates.
- Policy remains **before acceptance**, automatic prepaid refunds **off**,
  delivery zones **off**. Razorpay credentials and refund webhook are still
  unconfigured. No real provider refund, policy enablement, push or deployment.
  User order **16 stays pending with no delivery assignment**.

Inspected cancellation screenshots:
`/private/tmp/ruchigo-cancel-confirm-390.png` and
`/private/tmp/ruchigo-cancel-blocked-1440.png`.

Current matrix: **142 implemented, 78 partial, 5 provider-gated, 75 missing**;
all 300 numbered rows/counts were validated. This is not commercial completion.
See `CHECKOUT_SUPPORT_RUNBOOK.md` for explicit policy opt-in, original-method
refund recovery and staff prepaid-exception/live-provider limitations.

## Preceding checkout, refund and support increment

- Restaurant categories now come from that restaurant's visible menu. Delivered
  meals expose five directly selectable stars in tracking and restaurant reviews.
- Food-quality/missing-item help is an order-linked conversation: affected
  dishes, description, explicit support/refund-review choice and confirmation.
  Resolved conversations collect persisted face feedback and an optional comment.
- Admin refund review/approval is distinct from submission/completion. The
  Razorpay adapter targets the original payment, sends a stable provider
  idempotency key, verifies amount/currency/payment/reference and records partial
  or full completion. Unknown network outcomes are reconciled, not blindly retried.
- Signed checkout quote and opt-in delivery-zone administration enforce
  account/address/cart/pricing ownership. New financial rules are disabled by
  default. Unpaid reservations expire after 15 minutes; stock/coupon release is
  one-time and a delayed capture never revives the cancelled order.

Verification for this increment:

- Existing 144 Django tests passed again. **30 new tests** in
  `api.test_checkout_support` pass for zone/quote rules, expiry, late capture,
  review permissions, original-payment refunds, partial refunds, replay
  prevention, signed callbacks, read-only provider reconciliation and feedback.
- `npm run test:checkout-support`: real local API/database star rating,
  order-linked complaint, refund request, admin review/rejection, resolved face
  feedback, checkout quote and admin form. **320/390/1440px**, zero browser errors,
  no overflow. Temporary review and cart item removed by exact fixture ID.
- `npm run test:product`: full customer → kitchen → courier → review → support
  flow passed with fixture order **19**. A preceding run created fixture order
  **18**, then failed because the old non-exact “Rate meal” selector also matched
  the five new star buttons. The selector was made exact and the full suite passed.
- `npm run test:experience` and `npm run test:updates`: passed, zero browser errors.
  Covers profiles, legal/privacy intake, moderation, photos, footer, filters,
  notification deep links and toasts. Earlier unrelated browser suites below
  are historical runs, not claimed as rerun during this increment.
- Final frontend lint/build, Django migration drift/check and `git diff --check`
  passed. Local database is through **0016**; SQLite integrity is `ok` and no
  foreign-key violations were found. Expiry dry-run found zero eligible orders.
- User order **16 stays pending with zero assignments**. The local suite retains
  clearly marked QA conversations (new dedicated support check: ticket **27**),
  not genuine customer complaints. No provider refunds, zone-policy changes,
  pushes or deployments were performed.
- Official Razorpay documentation was read to verify normal-refund endpoint,
  idempotency header, receipt, minimum amount and fetch/reconciliation contracts.
  Local Razorpay keys and refund webhook are **not configured**. Gateway calls
  in unit tests are mocked. Live refund/settlement, production expiry scheduling,
  approved rates/cash policy and SQL contention testing remain required.

Inspected screenshots: `/private/tmp/ruchigo-support-choice-390.png`,
`/private/tmp/ruchigo-support-choice-1440.png`,
`/private/tmp/ruchigo-support-feedback-390.png` and
`/private/tmp/ruchigo-verified-checkout-390.png`.

Matrix at that checkpoint: **142 implemented, 77 partial, 5 provider-gated, 76 missing**.
These are checklist entries including duplicates, not unique features or a
production-readiness certification. See `CHECKOUT_SUPPORT_RUNBOOK.md`.

## Earlier assistant/tracking verification and reported regressions

This is local verification, not a production launch or a claim that all 300
requested entries are implemented. The feature matrix still contains **133
implemented, 78 partial, 5 provider-gated and 84 missing** entries.

### Fixed and verified

- The supplied screen recording showed Delhi-selected pizza requests returning
  a generic empty response, even though pizzas exist in **Noida**. Butter chicken
  is absent from the seeded catalog. Chat now explains those distinct cases,
  offers an explicit city-browsing action or an available alternative, and keeps
  the saved delivery city, dietary limits and budget unchanged. Named butter
  chicken is no longer broadened into unrelated chicken dishes.
- `test:assistant-recovery`: real API/Gemini replay at **1440px and 390px**;
  “I want a pizza”, “pizza?”, explicit Noida browsing, returned pizza menu cards,
  return to Delhi, absent butter chicken and chosen Chicken Biryani. No browser
  errors; browsing Noida leaves the stored delivery city as Delhi.
- `test:delivery-demo`: separate acceptance location, 1.80 km approach to the
  kitchen, cooking/ready update, arrival at kitchen, pickup confirmation, then
  1.56 km doorstep leg. Tested marker motion, heading/tyres, route transition,
  decreasing route/preparation-derived ETA, completion/restart, fullscreen,
  retained centre/zoom, keyboard focus, actual two-touch Chromium pinch input
  and reduced motion. Zero server writes and zero browser errors.

### Automated checks at that earlier increment

- **144 Django tests passed** across `api.tests`, `api.test_product`,
  `api.test_intelligence`, `api.test_menu_operations`,
  `api.test_tracking_feedback` and `api.test_assistant_recovery`.
- Django system check clean; `migrate --check` clean; migration drift absent.
  Local database is migrated through **0014**. SQLite `integrity_check` returns
  `ok`; `foreign_key_check` returns no violations.
- `npm run check`: lint + production build passed. `pip check`: no broken
  requirements. `npm audit --omit=dev --audit-level=high`: zero reported
  vulnerabilities (this is not a comprehensive security audit).
- Three configured backend secret values checked against source/client assets:
  **zero matches**. Production bundle excludes the demo route/page/coordinates.
- `test:product`: real local customer → restaurant menu/add-ons → coupon/COD →
  kitchen → courier GPS/pickup/OTP → delivered review/edit → support/admin.
  Passed with zero browser errors on **fixture order 17**. Its two GPS samples
  are test writes, not proof of physical-device/background tracking. Verified
  the marker stops without new data. Temporary reviews were removed by exact ID.
- `test:desktop`: feed/chat layout, real menu-grounded Gemini, 3.5-second hero
  and auth carousels, form persistence, no playback toolbar, reduced motion,
  **1280/768/390px** responsive fit; zero browser errors.
- `test:intelligence`: live conversation/budget follow-up, preferences/history
  opt-out, saved/recent restaurants, scoped analytics and clarification/support
  handoff; zero browser errors. Speech input remains simulated browser events.
- `test:menu-operations`: required choices, priced extras, stock limits, closed
  kitchen state, restored fixture menu/hours and mobile editor; passed.
- `test:notifications`: all four roles, private inbox boundaries, accurate
  badge/read persistence, failure retry and **320/390/1024/1440px**; passed.
- `test:updates`: all 12 photo mappings, combined discovery filters, opt-in
  nearby, footer links, automatic support notification/toast, keyboard/expiry,
  and persisted validated profile-photo upload/removal; passed.
- `test:experience`: original logo/auth, legal anchors/print/FAQ, customer and
  partner profiles, owned privacy ticket and reason/audit-backed moderation at
  mobile/desktop widths; passed.
- `test:menu` and `test:api-retry`: add-on price preview, guest selection
  restoration, mobile picker/reviews, read-retry and no replay of writes; passed.
- `test:ai:live`: fresh real Gemini veg/pizza/coffee ranking, empty/unclear
  constraints and IPinfo approximate-city confirmation; passed with zero browser
  errors. Observed successful ranking times were 1.70–4.37 seconds in this run,
  not a latency guarantee. Across this round, **12 browser suites passed**.

Database after these checks: **17 local orders**, including the intentionally
retained fixture order 17 and local support test tickets. **User order 16 stays
pending with no assignment.** No temporary automated reviews remain; fixture
taste/menu/hour/photo state is restored. No changes were pushed or deployed.

### Remaining verification boundaries

No physical phone GPS/background trial, traffic-aware production ETA,
Google Maps integration, real payment capture/refund/settlement, production
SQL concurrency/load test, approved legal policy, staffed delivery/support or
complete 300-feature parity is claimed. Live release blockers remain documented
in `PRODUCT_STATUS.md`, `FEATURE_MATRIX.md` and `LEGAL_RELEASE_CHECKLIST.md`.

## Earlier intelligence and menu-operations increment

This increment is local and not deployed. Production still uses `2a8ebb8`; local schema migrations 0012–0014 add preferences/activity, weekly hours, menu choice groups, stock tracking and a dedicated GPS timestamp.

- Full expanded Django suite: **137 tests passed** (`api.tests api.test_product api.test_intelligence api.test_menu_operations api.test_tracking_feedback`). Covers tenant/role isolation, profile validation/reset, coupon eligibility, dietary tagging/history opt-out, bounded chat/no mutation/clarification, sentiment output validation and scoping, insufficient-history forecasts/ETA, rule-only risks, option min/max/required pricing, cart configuration quantities, stock rollback/idempotency/cancellation and hours. New checks cover GPS-pair validation/server timestamps/ownership/terminal states, public map config, review create/edit/immutability/limits and owned-order support topic classification/fallback.
- Frontend lint and production build passed; migration drift check reports no changes.
- `test:intelligence`: real local backend and configured Gemini; coffee request, budget follow-up, random-input clarification, refund handoff, saved preferences/history opt-out, saved/recent restaurants and scoped role analytics passed with zero browser errors. Fixture taste/saved states are restored; browsing history may update.
- Web Speech recognition events are **simulated** in browser tests. Verified microphone placement inside search, icon-only active state, no “Listening” popup/native title, text insertion and no automatic home-search/chat submission. This is not real microphone/accent/browser recognition certification. Search-page text insertion uses the existing debounced results filter.
- `test:menu-operations`: guest required radio choice, optional extras, correct total, stock-based quantity cap, closed-hours UI/disabled ordering and mobile partner editors passed. Exact preview menu and hour settings are restored in `finally`; no orders/reviews/items are created by this suite.
- Core customer → menu → coupon/COD checkout → kitchen → courier OTP → review/support/admin suite passed. Temporary test reviews are cleaned up exactly; fixture orders/tickets remain intentionally local.
- Expanded core browser flow passed on local order 15: two explicit fixture GPS writes moved the scooter without replacing the map; a subsequent polling interval with no new GPS produced no movement. Delivered-order review creation from tracking, editing from history, persistence, order-linked typing and ticket handoff passed, zero browser errors. The GPS points are test samples, not a road-driven device trial.
- Desktop feed/browser checks passed with real catalog/Gemini results: wide side-by-side feed/chat, carousel auto-advance/interaction stopping, 1280/768/390px fit and reduced-motion behavior. Visible playback controls were subsequently removed at the user's request; the updated regression verifies dot-only navigation.
- Screenshots inspected: desktop meal feed/chat, desktop tracking scooter, mobile review dialog and order-support typing. Desktop is the primary layout; mobile screenshots are responsive checks, not the design target.
- Final desktop suite re-run passed after removing the toolbar and speeding autoplay to 3.5s. Login/register photo crossfade, preserved typed email, no playback buttons, menu-grounded Gemini chat and reduced-motion/responsive checks passed with zero browser errors. Final frontend lint/build also passed.
- Live recommendation/IPinfo suite passed for veg, pizza, coffee, empty budget, random/unrelated text and approximate-city confirmation.

Manual screenshots inspected: `/private/tmp/ruchigo-mic-no-popup.png`, `/private/tmp/ruchigo-assistant-mobile.png`, `/private/tmp/ruchigo-required-size-mobile.png`. These checks do not establish real provider settlement/refunds, durable uploads, PostgreSQL contention safety or 300-feature parity.

Stock is reserved at checkout even for awaiting-payment orders. Automatic unpaid expiry is not implemented; it remains a release blocker. Demand/sales estimates are historical weekday baselines; arrival ranges use prior deliveries; risk signals are deterministic rules. None is claimed to be a trained forecasting/fraud model. Review sentiment is provider-integrated and unit-tested with bounded mocked responses; live sentiment quality still requires an appropriate review dataset.

## Local delivery preview — 22 September 2026

- `npm run test:delivery-demo`: passed the real-time 50-second replay through
  pending, accepted, cooking, ready, assigned, out-for-delivery and delivered.
  Verified rendered scooter movement, changing heading, tyre animation, arrival
  estimate, road polyline, completion/restart and no persisted replay state.
- Desktop fullscreen retains the map instance, zoom and geographic centre;
  Escape restores focus. Inspected desktop and expanded screenshots.
- At 390px, real two-finger Chromium touch events increase map zoom; fullscreen,
  collapse, scroll restoration and reduced-motion behavior pass. No horizontal
  overflow. Physical-device GPS/background delivery are not covered by this test.
- The production map component with an unpinned pending fixture shows kitchen
  status without a blank location map or invented GPS. The replay observed
  **zero server writes and zero browser errors**.
- Local database checks before/after: 16 orders; user order #16 remains pending,
  with zero delivery assignments. No user order was advanced by the demo.
- `manage.py test api.test_tracking_feedback --noinput`: **12 tests passed**.
  The earlier 137-test full-suite result remains an earlier run, not rerun here.
- `npm run check` and `git diff --check`: passed. The production assets contain
  no demo route, demo page text or sample road coordinates.
- This preview uses OpenStreetMap/Leaflet plus bundled OSRM road geometry, not
  Google Maps. A licensed Google Maps renderer/key/billing setup is outstanding.
  Demo arrival minutes are labelled accelerated simulation; they do not add
  traffic-aware ETA or automatic dispatch to real orders. Nothing was deployed.

## Earlier real provider checks

No AI responses were mocked in `npm run test:ai:live`.

| Browser scenario | Real outcome | Observed response time |
| --- | --- | --- |
| Veg under ₹250 | Royal Veg Thali ₹249, Garden Fresh Salad ₹229, Crispy Veg Burger ₹199; all vegetarian | 1.81 s |
| Pizza night, up to ₹500 | Farmhouse Pizza ₹349, Classic Margherita ₹279, Smoky Chicken Pizza ₹399 | 1.47 s |
| Coffee break, up to ₹150 / 20 min preparation | Cold Coffee ₹149, 10 min preparation | 1.36 s |
| Pizza under ₹50 | No eligible dishes; no unrelated substitution | No model call needed |
| IPinfo network location | Delhi suggestion, labelled approximate; city saved only after confirmation; no fake GPS coordinates | Passed |
| `uhbh`, `zzzxq`, `what is the stock price` | Zero dishes, clarification requested; no invented “matches” | All passed against the live provider |

These are individual development observations, not latency guarantees. The live ranking model was Gemini 3.5 Flash-Lite. Google returned a 404 for the older 2.5 model for this project; the replacement was confirmed through Google's model-list API. Technical model/provider details belong in this report/API, not customer recommendation copy.

## Earlier automated checks (before this increment)

- `manage.py test api.tests api.test_product --noinput`: 89 passed.
- `makemigrations --check --dry-run`: no changes detected.
- `npm run check`: lint and production build passed.
- `npm run test:ai:live`: live ranking, dietary/budget/preparation constraints, changed-preference handling, empty results, mobile width and IP city confirmation passed.
- `npm run test:menu`: optional add-ons, live price total, guest sign-in selection restoration, quantity controls, mobile sheet, review layout/empty/error/retry passed.
- `npm run test:product`: customer → menu/add-ons → coupon/COD checkout → kitchen → courier pickup/delivery → review cleanup → support/admin; responsive role routes passed, zero browser errors.
- `npm run test:updates`: matching images, combined filters, nearby controls, footer, automatic support notification, toast dismissal/expiry and persisted avatar upload/removal passed.
- `npm run test:notifications`: guest privacy; all four roles' bells, unread counts, read-all persistence, error/retry and responsive layouts passed.
- `npm run test:experience`: authentication UI, legal pages/print/deep links, customer/partner profiles, privacy request, reason-required moderation and audit search passed. This test now creates and deletes its own uniquely marked temporary review instead of depending on or modifying an existing public review.
- `npm run test:api-retry`: brief GET throttles recover, writes are not replayed, aborted navigation cancels retry.
- Credential scan: both provider keys configured in ignored backend config; neither present in the frontend build.

Backend tests include invalid model IDs/duplicates/boolean IDs, untrusted generated claims, provider timeout, closed/blocked/unapproved kitchens, query/budget constraints, review ownership/moderation/rating updates, IPinfo timeout/cache, untrusted forwarded headers and trusted-proxy chain handling.

The screenshot-reported random-input regression is covered both without a provider and against live Gemini. The model must classify intent before ranking; unclear/unavailable intent cannot be replaced with arbitrary fallback dishes. Cache versioning prevents reuse of the previous incorrect results. Model-based intent recognition still needs broader language/quality evaluation before production.

## Data and release boundaries

Seven confirmed test reviews were archived with moderation audit entries; records remain recoverable. New product tests use uniquely marked temporary reviews, delete only their own record, and retry cleanup in `finally`. Browser review-layout fixtures are intercepted in the test browser, never inserted into the database. Forced termination/provider downtime can still interrupt cleanup. Product/notification/support scripts may create local fixture orders/tickets; they are not customer records.

Keys exist only in the ignored backend `.env`; never copy them to frontend variables or version control. Rotate keys shared in chat before release. The catalog is a small illustrative preview, not live merchant inventory. IP geolocation is approximate and local loopback tests describe the development server's network. Budget limits are per dish before extras/delivery. Allergen verification, production payments, background GPS, dispatch, reliability/load testing and broader marketplace features still require release work. These checks do not certify Swiggy/Zomato parity or full production readiness.
