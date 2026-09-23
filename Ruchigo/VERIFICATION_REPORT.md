# Product verification — 23 September 2026

## Main-branch push checkpoint — production rollout pending

- Runtime `a2ffa26` was successfully pushed to `prasanti25/runchigoo` main.
  It contains the verified commerce, rewards, finance and responsive-dashboard
  increment below. No production database migration or deployment was performed.
- Before pushing: fetched origin, confirmed no branch divergence, checked staged
  whitespace, and scanned all 114 staged paths against 13 configured private
  values and credential/file patterns. No private values or private files were
  included. The tracked database URL example uses placeholder credentials.
- Read-only Vercel project and production-alias requests both returned HTTP 403
  with available local authentication. No live revision is claimed from this
  check. The last recorded repository mismatch and pending migrations 0023–0027
  remain release considerations; see DATA_STORAGE.md.
- The following local verification notes describe the pre-push checkpoint.
  Their test results are not evidence of production migration or deployment.

## Commerce, location and analytics increment — verified locally, not deployed

At this pre-push checkpoint, the working-tree increment followed `94b08fb` and
had **not been pushed or deployed**. The last verified production release was
the earlier contextual-support release below. See the push checkpoint above for
the current source-control status.
`IMPLEMENTATION_TODOS.md` tracks all 117 entries in the latest scoped request:
93 implemented, 20 partial, 4 missing. These are scoped feature counts, not
commercial launch approval or a zero-bug guarantee.

### Current verification

Merchant finance, admin shopping and responsive UI follow-up:

- Finance unit checks: **14 passed** initially; **61 PostgreSQL tests passed**
  across finance, actual concurrent callbacks/settlements, rewards, analytics
  and admin scopes. The four new PostgreSQL races verify duplicate accrual,
  concurrent account initialization, duplicate settlement debit and competing
  settlements without overdrawing.
- **39 additional targeted tests passed** after the final admin-shopping/ETA
  permission corrections. These include owner-only checkout/history/reviews,
  cancellation and rider chat, own-order ETA without reports access, denied
  access to another customer's order, notification isolation, taste preferences
  and existing delegated administration.
- Final `npm run test:merchant-finance` passed against its own real SQLite DB
  and Django backend, not mocked responses: UI policy configuration; customer
  checkout → owning kitchen → courier pickup/OTP delivery; ₹360 merchant accrual
  from a ₹400 fixture meal at a 10% fixture rate; ₹100 external payment record;
  audited correction back to ₹360. The admin with **no operational scopes**
  then shops through the actual restaurant/checkout UI, views only their own
  orders and cancels within the permitted window. No live financial activation.
- This browser suite also checks the empty/populated admin overview, separate
  payment/earnings/refund tabs, mobile payment cards, mobile workspace menu,
  restaurant-owned earnings, and desktop/390/320px overflow. **Zero page errors
  and zero failing API responses** in the final run. Screenshots retained at
  `/var/folders/d2/hgxpr10520s0mtkjj3b92qy40000gn/T/ruchigo-merchant-J5MQeW`.
- Final `npm run test:dashboard-queues` passed: paginated/searchable order queues,
  scoped payment filters and matching counts, admin refund controls, category
  editor, partner-only account pages and 1440/390/320px layouts. The test made
  **zero business writes** and verified shared user order 16 remained unchanged.
- Final lint/build, migration drift and whitespace checks pass. Migration 0027
  was applied only to the local preview and the retained historical PostgreSQL
  fixture. Before/after hashes of original totals, status, addresses, quote/reward
  snapshots and stock match. Legacy orders have empty commission snapshots and
  no invented financial entries. Shared orders 16/37 are present; accounting,
  settlement recording, rewards and extra-fee policies remain off.
- Private-provider scan: 568 selected source/build paths, four configured private
  provider values, **zero matches**. Public browser-restricted Maps config is not
  treated as a server secret. No credentials are recorded in these documents.
- Failures corrected during verification: an obsolete admin-shopping denial
  assertion; redundant false audience fields in delivery notifications; denied
  public restaurant/own-order ETA lookups for delegated admin shoppers; duplicate
  visit effects and SQLite deferred-write lock contention during cart changes.
  SQLite development transactions now begin IMMEDIATE with a bounded timeout;
  this is not a substitute for PostgreSQL concurrency or production load tests.
  Browser harness cleanup and ambiguous address selectors were also corrected.

**Final full rerun: 469 tests passed on isolated UTF-8 PostgreSQL, 888.9s**, including
all ten actual threaded commerce/reward/merchant-finance races. The final own-order
ETA permission guard was additionally covered in the 39-test targeted run and the
successful full browser flow above. The isolated PostgreSQL cluster was stopped
after verification; retained fixtures can be reused. Earlier failed and passing
checkpoints do not establish a zero-bug or production-ready claim.

Follow-up (rewards and city/pricing):

- **Final full run: 445 tests passed on isolated UTF-8 PostgreSQL**, 472.2s,
  including all six actual threaded races, pricing/city cases and a check that
  city availability adds only one query for a 20-card serialized response.
  Final lint/build, migration drift and `git diff --check` passed. Shared local
  orders 16/37 remain present; rewards remain disabled, with no new active fee
  rules or city overrides. The isolated PostgreSQL test cluster was stopped
  afterwards; its databases remain available for future migration checks.
- Private-provider scan: **616 source/build paths**, four configured private
  provider values, no matches. Browser-restricted Maps keys are deliberately
  public configuration, not included as server secrets. An initial broader scan
  matched the existing development-only secret placeholder in `.env.example`;
  that was not an exposed provider credential. Local login credentials were not
  written to source or these documents.

- **435 PostgreSQL tests passed** at the rewards checkpoint, 196.4s, including
  six total threaded races: the preceding three commerce races plus concurrent
  reward callbacks, competing referral qualification, and duplicate reward
  checkout. The next full suite includes city/pricing cases and response-level
  city-query batching; its final result is recorded above.
- A subsequent 74-test targeted rewards/pricing/checkout/location run passed.
  The old “loyalty not implemented” null assertion was deliberately replaced
  with checks for a disabled programme and genuine zero opening balances.
- `npm run test:rewards` uses a **dedicated temporary SQLite database and backend**,
  not shared live policies. Browser API traffic is forwarded to the real backend,
  not mocked. Admin policy configuration → customer checkout → kitchen stages →
  rider pickup/OTP delivery → actual reward earning → next checkout redemption →
  cancellation restoration all passed. Desktop/390/320px rewards and checkout
  layouts, admin surcharge creation, customer fee disclosure and city pause/
  reopen also passed, with zero browser errors. Final screenshots:
  `/var/folders/d2/hgxpr10520s0mtkjj3b92qy40000gn/T/ruchigo-rewards-lQ1p3k`.
  A first pricing run found a selector/accessibility-name mismatch on the zone
  dropdown; an explicit accessible label was added and the complete run passed.
- Migrations **0025–0026** were rehearsed from the retained PostgreSQL historical
  fixture. Order totals/statuses/address snapshots, menu stock and addresses were
  unchanged. Existing orders have zero reward discount and no earning snapshot;
  rewards do not appear retroactively. New policies/rules default inactive.
- The requested support-admin email was absent from the shared local database.
  Created a local-only application admin (not Django staff/superuser), with an
  explicit full-access grant and audit entry. Real browser sign-in reached
  `/admin-dashboard` with no browser errors. No live account/password changed.

Earlier commerce/location checkpoint (prior evidence, not the follow-up count):

- **416 backend tests pass on isolated UTF-8 PostgreSQL**, 130.5s. Includes
  three real threaded checkout races: one last coupon redemption, no overselling
  of BOGO portions, and duplicate checkout returning one order/reservation.
  The preceding 411-test SQLite run passed; the final five additions are covered
  by PostgreSQL. This is targeted contention coverage, not production load testing.
- New browser suite `npm run test:location-analytics` passes against real local
  APIs: selected-pin discovery; owner-scoped profile analytics; owned merchant
  coupon creation; scheduled COD checkout and early-cooking rejection; merchant
  BOGO/festival campaign and linked offer; admin delivery-fee coupon; exact signed
  bill and apply animation; actual configured Google forward address lookup and
  a ready Google map. Desktop/390/320px and keyboard suggestion selection pass.
  Free-delivery coupons no longer display contradictory spend-more prompts.
- `test:coupon-savings` passes: eligibility/search, expiry, spend thresholds,
  server-confirmed celebration, cart revalidation, non-stacking replacement,
  signed bill, removal, 1440/390/320px and reduced motion. No order/redemption.
- `test:dashboard-queues` passes: real paginated orders/payment ledgers,
  admin-only refund controls, category editor, partner accounts, three widths.
  No business writes. `test:checkout-city` passes for Delhi/South Delhi, Noida
  rejection, address recovery and three widths, with no orders placed.
- `test:rider-location` passes: rider's opt-in browser GPS writes, customer-owned
  lightweight GPS reads, real configured Google road route/map/ETA, provider
  failure recovery, stale state and completion cleanup at three widths. The
  controlled fixture reached the browser in 90ms in this run; this is **not**
  a latency SLA, background GPS or evidence of a physical delivery.
- Migrations **0023–0024** applied to local preview SQLite. An isolated PostgreSQL
  historical-model fixture at 0022 upgraded successfully: original order/payment
  amounts, stock, address snapshot and coupon usage survived; scheduling/tips
  default off and existing coupons default to meal discounts. This was a
  synthetic fixture rehearsal, not a fresh production-backup restore.
- Lint, production build, migration drift and diff whitespace checks pass.
  Private provider/database value scan covered five configured values across
  593 tracked/untracked/build paths with no exposures. Credentials were not changed.
- New fixture users, coupons, offers and orders were removed after testing;
  existing local user orders 16 and 37 were checked unchanged by the new suite.
  No production records, commercial settings or payments were written. The
  isolated PostgreSQL verification server is stopped; local app servers remain.

### Issues caught while checking

- Browser selectors exposed missing explicit accessible names on new selects;
  the form now provides those labels and the full rerun passes.
- Visual review caught the free-delivery coupon/spend-more contradiction; fixed
  with a regression assertion. Address search focus now follows the rounded field.
- An initial PostgreSQL harness inherited SQL_ASCII from its temporary cluster,
  failing seven Unicode JSON support fixtures. Re-run with UTF8/template0 passes
  all 416; application text was not stripped or altered to hide the harness issue.
- Parallel browser fixture writers contended on shared preview SQLite. The
  address regression passed when run sequentially after the others. Run local
  SQLite browser suites sequentially; production row locks were tested separately.
- Initial migration fixture creation omitted historical usernames. The successful
  rehearsal used a fresh isolated database and explicit unique fixture usernames.

### Boundaries

Scheduling means **preparation starts at the chosen time**, not guaranteed
arrival. A kitchen must opt in with explicit weekly hours; currently closed
kitchens cannot be booked through the existing cart. Capacity slots, reminders
and durable scheduled workers remain open. Cash tips are COD-only, opt-in and
paid directly to the rider; online payout accounting is not implemented.

BOGO is one specified kitchen dish, base price only, with both portions in the
cart and a free-portion cap. Free-delivery campaigns are platform-managed, scoped
to a serviceable address, and do not waive food/tips or consume already-free fees.
One coupon per order; no free gifts, cross-dish combos or discount stacking.

Spending is collected payment minus confirmed refunds grouped by **order date**,
not bank accounting. Delivery fees are gross before refund allocation. Wallet,
loyalty/referrals/cashback, private KYC documents, commission/settlements, city
lifecycle, surge/peak pricing and route optimization are still open. Production
release also needs migration rehearsal/backup and approved commercial operations.

## Contextual support follow-ups — deployed and public smoke verified

- Runtime `fa8e4e8` is pushed to `prasanti25/runchigoo` main. Deployment
  `dpl_GrbbxbFRDdQCYUCT1MSUXmKsN8VF` is READY and aliased to
  https://runchigoo.vercel.app. Deployment URL:
  https://runchigoo-77ad8f77t-shxvaayys-projects.vercel.app.
- Public-only production browser checks pass: updated
  `SupportPage-C65b6jGZ.js` contains same-ticket issue actions; guest sign-in
  works at 1440/390/320px with no overflow/browser errors. Anonymous support
  list, ticket and issue-endpoint reads return 401. Delhi/South Delhi public
  discovery remains consistent; Noida remains distinct. Zero business writes.

- Inspected only the supplied account's latest production ticket/order/payment
  using a read-only database session. No historical messages, author labels,
  ticket states or payments were changed. Temporary environment file removed.
- Fixed queued-text silence, contextual yes/no/payment choices and same-ticket
  issue intake. New tests cover requester isolation, affected-item ownership,
  idempotent retries, no-payment safety, no duplicate refund, delivery mismatch,
  existing refund decisions and processed/rejected refund follow-ups.
- Final focused support suite: **45 tests passed**, including reportedly missing
  refunds, added evidence on rejected reviews and avoiding repeated payment
  intake. Expanded full regression: **360 tests passed** on isolated SQLite in
  235.0s. The last payment-follow-up addition is covered by the final focused
  run; it was added after the full suite started.
- Final local browser suite passed on order **56**, ticket **66**: real persisted
  replies, queued/resolved COD refund flow, no-payment closure/face feedback,
  cash mismatch in the same ticket, inline cancellation confirmation, admin
  requester/staff isolation, lost-response retry and delayed POST recovery.
  Desktop/390/320px layouts pass with zero browser errors; mobile screenshot
  inspected. User order 16 unchanged; no real refunds. The final check also
  verifies existing payment details are acknowledged on follow-up.
- One intermediate browser run failed while the mobile bottom bar intercepted
  Send and the development page reloaded. Chat now hides the fixed shopping
  bar while a conversation is open, with a regression assertion; the final
  complete rerun passed. Header navigation remains available.
- Actual configured Gemini classified “Paise wapas kab milenge?” as refund and
  a delivered-but-not-received Hinglish complaint as not_received. Provider
  responses were not mocked in these two checks; broader language-quality
  evaluation remains necessary.
- Lint/production build, diff check and migration drift pass. A 573-file
  source/build scan found no matches for four configured private provider keys.
  The pre-existing local Django key is an example placeholder, not a production
  credential; use a unique secret in production. No new schema/provider
  configuration is needed.
  Production verification stayed public/read-only; authenticated actions were
  exercised on local fixtures rather than live customer conversations.
- Routine self-service is automatic, not universal dispute adjudication.
  Payment discrepancies and financial decisions remain verification/policy
  gated, and refund requested/approved/processing/processed are distinct states.

## Delhi district checkout regression — deployed and verified

- Fixed exact-city rejection of saved `South Delhi` addresses at `Delhi`
  kitchens. Explicit Delhi district aliases apply consistently to checkout,
  discovery and recommendation candidates; NCR neighbours remain distinct.
  Existing address text, delivery zones, pin requirements and distance limits
  are unchanged. No production address/order or policy was edited.
- Checkout shares its selected saved address with the header, hides raw request
  field names in errors, and offers address/pin recovery for genuine failures.
- `npm run test:checkout-city` passes against real local APIs: a ₹449 meal with
  a saved South Delhi address returns ₹40 delivery / ₹489 total and enables
  Place order; Noida returns 400; switching back returns 200. Same district
  selection retains Delhi discovery results. 390/320/1440px layouts pass with
  zero browser errors. No browser order placed; isolated fixture removed.
- **347 backend tests pass** on isolated SQLite, including actual checkout,
  preserved address text, alias rejection, zone-radius/trip limits and discovery.
  Lint/build, API retry regression and diff checks pass. No migration required.
- Runtime `c4bbce9` is pushed to main and deployed. Deployment
  `dpl_3o38CaK5TyeYmBmiQvDvN8X6oFdJ` is READY and aliased to
  https://runchigoo.vercel.app. Public-only production discovery confirms Delhi
  and South Delhi return the same two restaurants; Noida remains separate.

## Support release — production deployed and public smoke verified

- Runtime `a2236cd` is on `prasanti25/runchigoo` main. Deployment
  `dpl_Dkh32o15fXX6rPVG1sUCMLPZv27g` is READY, aliased to
  https://runchigoo.vercel.app. Deployment URL:
  https://runchigoo-d8hfmai9x-shxvaayys-projects.vercel.app.
- Final full backend rerun: **342 tests passed**, 86.5s on isolated SQLite.
  Final support browser suite passes, including invalid-link isolation and
  lost-response retry after waiting for the request to finish. Lint/build pass.
- Production public-only browser smoke passes at `/support?view=mine` on
  1440/390/320px. The delivered bundle includes ownership-based viewer context,
  quick-help requests and separate shopper/staff tabs. Guest sign-in is visible;
  anonymous support list/detail and dispatch reads return 401. Zero browser
  errors and zero production business writes.
- Authenticated replies, choices, financial safeguards and staff workflows were
  verified against the actual local API, not by sending test messages to live
  customer tickets. No production schema migration was needed.

## Support replies and operational ownership — local release verification

- Backend: **342 tests pass on isolated SQLite**, including administrator-as-
  shopper chat, delegated own-ticket access, denied cross-ticket assistance,
  stage-aware choices, queued factual help, retry idempotency, normal-stage
  admin/superuser denial, cross-partner ownership and kitchen → courier → OTP
  delivery without admin intervention. No schema changes detected.
- `npm run test:support-conversation` passes with actual local persisted messages:
  greeting, status, inappropriate pre-delivery meal complaint clarification,
  cooking cancellation refusal, queued refund-status check, staff reply visible
  without refresh, resolution/face feedback, restaurant issue/hold, admin
  exceptional resume/cancel, admin's own shopping chat and inaccessible-link
  isolation. Lost-response and delayed-POST subcases deliberately control only
  HTTP delivery; the underlying questions/answers are saved by the real API.
  Retrying a lost response produces exactly one question/answer. A poll-delivered
  answer unlocks the composer while its original POST is still in transit.
- Final support browser fixture is order **52**, ticket **55**. Earlier scoped
  local attempts retained clearly labelled QA records, not production data.
  Cancellation regression passes with local orders 49/50. User order 16 is
  unchanged; no real refund submitted. Screenshots at 1440/390/320px show no
  horizontal overflow; desktop and mobile chat screenshots visually inspected.
- `npm run test:dashboard-queues` passes: read-only paginated order/activity
  oversight, ledger filters, refund-review UI, role guards and responsive layout;
  zero business writes. Admin kitchen controls are absent in both order UIs.
- `npm run check`, migration drift and `git diff --check` pass. A source/build
  scan of 571 files found none of four configured private provider credentials.
  The intentionally public restricted Google browser key is not a server secret.
- The first browser attempt exposed a loading-state null guard; a later retry
  harness assertion needed to await its response. Both were corrected and the
  final complete browser run passed, with zero page errors.
- Conversation updates use short polling, not WebSockets. Gemini classifies
  unfamiliar messages; factual button checks do not depend on it. Human queues
  still need real staff, and refund processing still needs the payment provider
  and authorized review. This does not certify the complete 300-feature list.
- Main push and production deployment are pending at this checkpoint. No
  production ticket/order mutations were used for verification.

## Google address + rider rollout — production verified

- Runtime commit `3543609` is pushed to `prasanti25/runchigoo` main. Vercel
  deployment `dpl_CJo8CNs2MWFjQsv2tCctK3T3wRE6` is READY and aliased to
  https://runchigoo.vercel.app. Deployment URL:
  https://runchigoo-o8ujh19lh-shxvaayys-projects.vercel.app.
- `RUCHIGO_DELIVERY_BASE_URL=https://runchigoo.vercel.app npm run test:delivery-google`
  passes with actual Google maps and road geometry on both legs, scooter alignment
  to the displayed polyline, desktop/mobile/fullscreen ETA, real two-finger pinch,
  reduced motion, completion and map/route outage recovery. No real-order requests
  or production business writes; no browser errors. Only failure/reduced-motion
  subcases use explicit controlled responses; primary route/map acceptance is live.
- `RUCHIGO_LOCATION_BASE_URL=https://runchigoo.vercel.app npm run test:address-location:live`
  passes using real Google Geocoding, desktop/mobile map, guest address details,
  header persistence and browser-only save/reload at controlled public-landmark
  GPS. No production account, address or order records were created.
- Public address/delivery map configurations both return Google with private,
  no-store caching. Anonymous owned-order road-route requests return HTTP 401.
- Final local checks pass: lint/build, 334 backend tests, 18 device/address tests,
  Google-address fixtures, existing address regression, real rider-location test,
  actual Google demo and OSM fallback demo regression. The fallback harness now
  reuses Vite's exact router module/provider context for its isolated component
  test; earlier full-run interruptions during development reloads are not passes.
- A 462-file source/build scan found none of five configured server secrets.
  Google browser key is intentionally public and website-restricted. Shared
  server credentials still require rotation before a paid/public launch.
- No database schema migration, production fixtures, payment changes or order
  mutations were part of this rollout. GPS is browser/device/network-dependent;
  current road estimates exclude live traffic and are not a guaranteed ETA.

## Google delivery map and read-only public demo — pre-deployment verification

- Real Google Routes API and Maps JavaScript browser acceptance passed locally.
  The demo uses fresh Google road geometry for both acceptance-to-kitchen and
  kitchen-to-door legs. Scooter centres are checked within 1m of the **displayed
  polyline**, not claimed within 1m of a real rider. Desktop/mobile layout,
  expand/recenter/zoom, reduced motion, completion and provider failures pass.
- The actual local courier→API→customer test passes: original address directions,
  owned GPS/Google route/nearby-road reads, kitchen ETA, provider-outage isolation,
  stale GPS, ETA removal and delivered-marker cleanup. One observed new-fix delay
  was 1,298ms; this is not a latency guarantee. Controlled GPS uses public points;
  only the test's temporary fixture order/users were created and cleaned up.
- Backend: 334 tests pass on isolated in-memory SQLite (including 9 new routing
  tests for ownership, snapshots, stale/missing/paused GPS, safe provider errors,
  field allowlisting, bounded requests, no cache and fixed demo coordinates).
- Address Google fixture acceptance, 18 device/address tests and lint pass.
  Google keys were added to Vercel Production via protected stdin, never source
  control or command-line values. Runtime deployment and production acceptance
  remain pending at this checkpoint.
- `/demo/delivery` is intentionally included in production now, is labelled as
  simulated, and never calls real order endpoints or writes business records.
  Road ETA uses DRIVE without live traffic; this does not implement guaranteed
  GPS accuracy, two-wheeler optimization or a stored historical journey trace.

## Google browser credential — local live acceptance passed

- Separate browser credential added to ignored local environment; Django serves
  the Google address-map configuration. Server key remains private and separate.
- After the user saved `/*` website paths, live Google browser acceptance PASSES
  at `/addresses` on both `http://localhost:5173` and `http://127.0.0.1:5173`.
  The earlier homepage-only allowlist caused `RefererNotAllowedMapError` on
  `/addresses`; no restrictions were bypassed or disabled to resolve it.
- Both `npm run test:address-location:live` and the same command with
  `RUCHIGO_LOCATION_BASE_URL=http://localhost:5173` pass: real Google tiles and
  reverse geocoding, zoom/expand, 1440px/390px layouts, delivery-detail autofill,
  required-house validation, local account save/reload, original GPS coordinate
  preservation and no browser errors. Fresh desktop/mobile map screenshots were
  visually inspected at `/private/tmp/ruchigo-address-local-live-1440.png` and
  `/private/tmp/ruchigo-address-local-live-390.png`.
- Only device GPS was controlled at public coordinates `28.6315,77.2167`.
  Provider results were not mocked; Google returned Baba Kharak Singh Road,
  Delhi, 110001. This does not establish the user's home-address coverage or
  guarantee accurate house/flat/floor lookup. Geocoding requests stay server-side;
  the separate restricted Maps JavaScript browser key is intentionally public.
- Initial homepage-only probes were insufficient to certify the account page.
  Live acceptance now waits for real tile readiness, checks Google errors, and
  supports both local hostnames. The map displays a branded loader with bounded
  tile/script failure states instead of showing a pin over an unrendered map.
- Google fixture browser checks, the 18 device/address tests, existing address
  browser checks and full lint/build pass again. LocationIQ fixtures explicitly
  select their own renderer so production key configuration cannot alter them.
- No production deployment or business writes. Local acceptance users are cleaned
  up by the test scripts. The API's address form remains usable on map errors.

## Optional Google address integration — earlier server-key checks

- The supplied server credential is in ignored `backend/.env`, not the frontend
  or source control. A real Google reverse-geocoding request at a public landmark
  returned OK; the new adapter returned a street, city and building-number
  suggestion. This is not a test of the user's personal address coverage.
- Google lookup and its address map activate together only when a separate
  browser key is configured. Reusing the server key as the browser key is rejected.
  The rider's existing OSM/LocationIQ map path is unchanged. Google results are
  not silently drawn on a non-Google map or cached by the reverse endpoint.
- 33 focused backend tests pass for Google, existing geocoding and rider-location
  contracts. They cover consent/coordinates, sanitized responses/errors, no
  provider-centroid substitution, no Google result cache, throttling, partial
  data and suppression of interpolated/partial-match house numbers.
- `test:address-google` passes with mocked Google JS interfaces and reverse
  fixtures: desktop/mobile layout and expansion, pin movement, house/street
  autofill without duplication, preservation of typed edits, guest save/reload,
  script failure, authentication failure and bounded script timeout. These are
  not real Google Maps imagery or browser-key tests.
- Full lint/build, 18 device/address unit tests and the existing address browser
  regression pass. The configured real-provider browser test still passes via
  LocationIQ. A 435-file source/build scan found no configured server-secret
  values. No production business writes or new deployment were made.
- Full backend regression also passes: 325 tests on isolated in-memory SQLite.
  Test modules were enumerated explicitly because the namespace-only `api`
  discovery label finds no tests. This is not a PostgreSQL concurrency test.
- At this checkpoint, still required: a distinct website-restricted Maps JavaScript browser key,
  a real Google-renderer test on allowed origins, and credential rotation because
  the server key was shared in chat. Places autocomplete is not implemented here.

## Manual address autofill — local checks

- Both "Add delivery details" and "Enter address manually" now transfer the
  matched lookup fields and selected coordinates. The navbar no longer discards
  a known address when opening manual entry; the form's map return path uses the
  same merge while preserving typed edits.
- Returning from an unchanged existing pin keeps its address without another
  lookup. Moving the pin discards unmatched lookup text; incomplete lookup fields
  remain blank. Manual entry still works when GPS is unavailable or pending.
- Full lint/build, 18 device/address unit tests and the expanded local browser
  suite pass. Checks cover full/partial/locality-only prefill, guest/account
  save/reload, existing address edits, retained house/floor/landmark edits, map
  reopen without a lookup, missing GPS and stale results. No orders were created.
- Real-provider acceptance passes through the manual-entry button with a public
  landmark fixture, saved coordinates and unchanged city/state/postal code.
  Backend and database schema are unchanged. This increment is local only; no
  new provider or improvement to automatic street/house coverage is claimed.

## Location-copy cleanup — local checks

- Removed the standalone geocoder credit from the address picker and rider
  status. The credit now links from Privacy → Location and maps; tile attribution
  remains visible on the maps and the location-privacy links remain accessible.
- Locality-only results say "Area located" and explicitly request street/house
  details without claiming the locality is a complete delivery address. No
  provider coverage, GPS precision or automatic house detection improvement is
  claimed. No personal address was hardcoded or saved on the user's behalf.
- Full lint/build, 18 device/address unit tests and local address browser checks
  passed. Browser checks cover 1440/768/390/320 layouts, absence of provider text
  in the picker, retained map credit, the privacy credit link and manually entered
  street/house/floor persistence with unchanged coordinates.
- Real-provider local acceptance passed at a controlled public landmark, including
  street autofill, account save/reload and desktop/mobile screenshots. No browser
  errors or orders created. Backend code is unchanged; no new full backend run.
- This cleanup is locally verified, not yet deployed. The previous deployment
  listed below remains the last verified production release.

## Complete doorstep details and modern pin — release checks

- New-address forms require a blank user-entered house/flat/building field,
  separate from geocoded street/area; floor is optional. A locality alone cannot
  pass the new form. House, floor and landmark persist in the existing API address
  lines and remain compatible with order snapshots. Legacy free-form edits are
  preserved; no schema change or backend-wide address policy change is claimed.
- `test:location-device`: 18 tests pass, including six new address-composition,
  whitespace, required house, optional floor, length-limit and legacy-edit checks.
- `test:address-location` passes at 1440/768/390/320: invalid account/guest saves
  remain open without writes, real account save/reload and guest browser persistence
  retain house/floor/pin, and existing edit/checkout/permission flows still pass.
- The custom orange SVG pin has a precise centre target, lift/settle drag feedback,
  no continuous animation and reduced-motion handling. Tests verify drag state,
  less-than-one-pixel centre alignment, touch pinch/expansion and no paid lookups
  during map movement. Desktop and mobile screenshots were visually inspected.
- Actual local LocationIQ acceptance passed again with controlled public-landmark
  GPS, street auto-fill, user-entered house/floor and real API persistence.
- Rider browser tests pass with complete house/floor text visible and both
  directions links targeting saved coordinates, not an area-name search.
  The two unique local fixture orders 41/42 were deleted; existing user orders
  were not modified. Measured update delays (98/95 ms) reflect local polling phase,
  not a millisecond GPS or production latency guarantee.
- Full lint/build and whitespace validation passed; a 454-file source/build scan
  found no configured provider-secret values.
- Deployed runtime `1dfc9b5`, deployment `dpl_6RwUt1zYtEYxoNLmMjbmAmWpzMCm`, to
  https://runchigoo.vercel.app. Production public-only real-provider acceptance
  passed for the custom pin, desktop/mobile map, required house/flat input,
  guest details/save/reload, and no provider credentials/browser errors.
  No production business records were created. Rider acceptance remains an
  isolated local fixture check, not a live production delivery test.

## Delivery address selection — release checks

- Approximate-network selection removed; the location UI no longer calls IPinfo.
  Full guest manual entry, reload persistence, device-denied/browser-allowed
  recovery copy and retry are covered by browser checks. A locally verified
  follow-up removes the OS troubleshooting box and unproven permission-off claim.
  Denied/unavailable/timeout errors recover through the same-dialog retry;
  manual entry remains available. The follow-up is deployed as runtime `f209ebc`,
  deployment `dpl_Ago7SVJc58x64rFAH7Aa1eE3KCKd` at https://runchigoo.vercel.app.
  Production public-only live-provider acceptance passed again, including guest
  details and browser save/reload. Separate live smoke checks passed for denied
  access, silent callback timeout, manual entry and absence of OS instructions.
  No production business writes occurred.
- `test:rider-location` passed using isolated local customer/owner/courier/order
  fixtures and real API/provider calls. Browser-controlled GPS at a public point
  reached the customer's map in **1,434 ms** and **1,453 ms** in two runs; road lookup was actual
  LocationIQ. Provider failure did not stop movement. Stop-sharing naturally aged
  into last-shared state, completion removed the marker, and 1440/390/320 views
  passed without browser errors. The exact temporary fixture was deleted; no
  existing user order or production business data was changed. This is not a
  millisecond or production latency SLA.
- Eight new backend rider tests pass: owned lightweight one-query reads, foreign
  account denial, real GPS write/read, missing/stale/future/finished/paused guards,
  independent street-cache cadence, failure isolation and concurrent lookup lock.
- Device investigation confirmed the actual Chrome profile grants localhost
  location and the macOS global Location Services switch is on. System Settings
  was opened, and the user's subsequent screenshot confirms Chrome's individual
  OS toggle is enabled too. The running Chrome process had framework
  153.0.8010.48 loaded, while the installed version was 153.0.8010.53. With explicit
  user approval, Chrome was normally restarted; a new process loading
  153.0.8010.53 and the restored RuchiGo tab were verified. Restart did not resolve
  acquisition; it was not the cause. Chrome disallows AppleScript JavaScript
  execution; no privacy setting or OS restriction was bypassed or silently reset.
- Temporary localhost-only diagnostics captured error 1, browser permission
  granted, secure context and enabled geolocation policy, but a replaced
  `getCurrentPosition`. Urban VPN 5.14.4's installed location wrapper contains
  the matching `User denied Geolocation` error and one-shot fall-through.
  Standard `watchPosition` succeeded twice in the user's actual Chrome without
  any mocked coordinates. The diagnostic recorded success/failure flags only,
  not coordinates. After switching the app, the user supplied a screenshot with
  their actual map/locality loaded. All temporary diagnostics were removed.
- `test:location-device`: **12 tests passed**, covering first-fix/watch-ID-zero
  cleanup, genuine denial, a silent wrapper bounded by 15 seconds, stale callbacks,
  abort/unmount, synchronous callbacks, native timeout, invalid coordinates,
  throwing wrappers and unsupported browsers. No IP or fabricated fallback.
  The same acquisition helper now powers nearby discovery too.
- Guests now receive the editable delivery-details form after confirming a pin,
  just like account customers; guest details stay in browser storage. Flat/house
  numbers and missing streets require user entry. Locality-only lookup is not
  shown as an error when required form fields exist; genuinely missing fields
  are named. No extra geocoding requests or inferred street names were added.
- Final local browser rerun passed with the one-shot API deliberately broken:
  owned address/checkout selection, guest GPS → details → browser save/reload,
  locality-only lookup, nearby discovery, silent callback deadline and cleanup,
  denied/unavailable/timeout retry, 1440/768/390/320 layouts and touch expansion.
  No browser errors or orders created. Actual local LocationIQ acceptance also
  passed again with controlled public-landmark GPS and real address persistence.
  Lint/build and whitespace checks passed; a 454-file source/build scan found
  no configured provider-secret values.
- The user's current address result still lacks a mapped street and cannot infer
  a flat/floor. The latest screenshot confirms locality display, not exact street
  coverage. The user subsequently confirmed the pin is correct; no neighboring
  road or building number was substituted.

- Full current backend regression: **313 tests passed on isolated SQLite**,
  including 13 reverse-geocoding and 8 rider-location tests. The previous 292-test PostgreSQL
  result below remains evidence for the prior release, not this increment.
- New tests cover explicit consent, coordinate bounds/precision, zero coordinates,
  provider timeouts/HTTP failures, malformed results, missing configuration,
  partial addresses/city aliases, cached vs changed pins, throttling, no-store
  responses, no leaked key/raw provider centroid, and owned-address persistence.
  All provider responses in these unit tests are mocked.
- `test:address-location` passed with controlled device GPS and reverse-geocoding
  fixtures, real local account/address/cart persistence, and actual map tiles.
  Covers header → map → flat details → explicit save → reload → checkout selection,
  preservation of typed details, stale request cancellation, manual fallback,
  denied permission/timeout, low accuracy, touch pinch zoom/expansion, both-way
  header/checkout selection and logout clearing precise browser selection.
  1440/768/390/320 layouts passed with no horizontal overflow or browser errors.
  The final rerun also verified that saving from the header refreshes the open
  address page immediately, without a manual page reload.
- Map tests found sub-metre Leaflet pixel rounding on zoom, which invalidated a
  confirmed address. Resize ownership and a one-metre jitter guard fix that;
  meaningful pin movement still clears the stale address and requires lookup.
- The existing coupon/browser suite passed again with the shared address form
  and checkout changes: zero orders/redemptions, no browser errors, and existing
  user order 16 unchanged. These suites delete only their unique local fixtures.
- A LocationIQ credential was subsequently supplied and configured in the
  ignored, owner-readable local backend environment and Vercel Production Secret.
  `test:address-location:live` passed against the real local API/provider using a
  controlled public-landmark GPS point: **Outer Circle, Connaught Place, Delhi,
  110001**. Actual account saving, flat editing, exact requested coordinates,
  reload, desktop/mobile map and zero browser-provider credential exposure passed.
  No provider response is mocked in this suite. No order or production business
  row was created; its unique local test account/address was deleted afterwards.
- The live provider omits the territory on this New Delhi result. A guarded
  India-only Delhi administrative alias fills that field without inventing
  streets/postcodes or states for foreign/unknown cities. The focused 13-test
  geocoding suite passed, including both new normalization guards.
- Production public-only `test:address-location:live` passed on runtime commit
  `c6cc983`, deployment `dpl_A8n3Sye7XzvL6Vh6HTWCx88gMwyj`, at
  https://runchigoo.vercel.app. Real LocationIQ returned the public landmark's
  address; desktop/mobile tiles, pin confirmation and header persistence passed.
  No browser errors, browser provider calls or production business writes.
  Device GPS was controlled, so this does not certify the user's physical GPS.
  Anonymous requests to both new order live-location and rider-place endpoints
  returned HTTP 401 without exposing order coordinates.
- Missing keys/provider failures still preserve manual entry; no public
  Nominatim fallback is used. No schema migration is required.
- Final lint/production build, migration-drift check and whitespace validation
  passed. A scan of 518 source/build files found no configured provider-secret
  values. The map/picker remains lazy-loaded outside the initial header bundle.

## Coupon search, thresholds and confirmation

- `test:coupon-savings` passed twice against the local browser/API/database.
  Covers available/unavailable search, minimum-spend explanations, expired-code
  refusal without celebration, server-confirmed success burst, live coupon
  revalidation, non-stacking replacement, matching checkout bill, automatic
  minimum-spend removal and manual removal. Widths 1440/390/320 and reduced
  motion passed, with zero browser errors.
- Each coupon UI run created one unique local customer/cart/address and three
  clearly marked temporary campaigns, then deleted those exact records. No
  order, payment, inventory reservation or coupon redemption was created by
  this suite. Existing user order 16's status/events remained unchanged.
- The first 16 coupon tests passed on isolated PostgreSQL. The subsequent
  18-test SQLite pass also covers strict add-on prices and public usage privacy.
  A full 289-test PostgreSQL run passed before the last three edge tests were
  added; the final **292-test PostgreSQL suite passed**, including all 19 coupon
  tests. Lint and the production build passed without errors or warnings.
- `test:product` passed again on retained local fixture order **37**, including
  the new coupon drawer/confirmation, actual COD checkout, kitchen progression,
  real stored GPS, courier code, ratings/cleanup, support and responsive role
  pages. Zero browser errors; the temporary public review was removed by its
  exact fixture ID. This is a separate order-creating suite from coupon-only QA.
- The first zone tests had not explicitly activated their isolated fixtures;
  setting those test zones active fixed the setup. Production zone defaults
  remain off. No assertions or serviceability rules were relaxed.
- No migration, business-rate change, live coupon creation or production
  customer-cart mutation is required for this UI/API increment.
- Runtime release **`e7ae89c`** was pushed to main and deployed to the existing
  production alias as `dpl_4EZVZMm3PS8mkV2TmsGiYfnh79sN`. A read-only live browser
  smoke verified the coupon bundle, protected savings endpoint, six public
  routes at 1440/390/320px, admin login guard, actual pending original-logo
  loader and reduced motion, with zero browser errors/business writes. The
  real-Gemini non-veg/budget conversation passed again on this deployment.
  Authenticated coupon mutations were tested locally, not against live users.
- Final source/bundle scanning covered 394 files and 149 built assets with no
  configured-secret matches or private preview fixtures in browser JavaScript.
  Migration drift was empty. The isolated PostgreSQL verification server was
  stopped and the temporary production-environment copy deleted; the restricted
  pre-migration backup remains outside the repository. No user data was deleted.

## People, branded loading and non-veg conversation increment

- `test:people-loading` passed, including server search/filter counts, create,
  edit, block/restore, persisted edits, keyboard action dismissal and
  1440/1024/768/390/320px layouts. Its exact temporary account was deleted;
  audit entries remain. Local user order 16's events/status were unchanged.
- Original-logo loaders were inspected on actual held API/chunk requests,
  disappear on completion and respect reduced-motion. No forced minimum delay,
  fabricated percentage or rotating/distorted brand image was introduced.
- Local `test:food-constraints:live` used real Gemini (no mocked provider).
  Both `i would like to have a non veg pizza` and the corrective follow-up
  returned only Smoky Chicken Pizza, non-vegetarian. `under 200 instead` returned
  no matches with a budget explanation, preserving pizza/non-veg context.
  Desktop/mobile passed with zero browser errors and zero business writes.
- Forty targeted backend tests passed on isolated PostgreSQL; a preceding
  272-test SQLite run passed before the final bounded-context test was added.
  `npm run check`, migration-drift checks and read-only dashboard queues passed.
- The first 273-test PostgreSQL run exposed a clock-dependent forecast fixture
  just after midnight IST: subtracting 45 delivery minutes moved the expected
  daily order into the preceding date. The fixture now explicitly places one
  consistent order/delivery at midday on each reporting date. No production
  forecast calculation or assertion was weakened.
- The **273-test full PostgreSQL rerun passed**. The final consistent
  order/delivery fixture adjustment also passed all 20 intelligence tests on
  SQLite. Configured-secret scanning covered 388 source files and 148 built
  assets with no matches; one known local example-key placeholder was excluded.
  No preview-account credentials or delivery-demo route appeared in the bundle.
- This increment was pushed as `8220e3e` and deployed to the production alias
  (`dpl_5hBoiu2YjYqXjvsStzTwThhD6WoU`). The same real-Gemini browser test then
  passed on `https://runchigoo.vercel.app`, including both non-veg prompts,
  budget no-match, 1440/390/320px and zero business writes/browser errors.
  No schema migration was required for that increment.

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
