# RuchiGo product comparison and handoff

Updated 23 September 2026. This compares the supplied Swiggy/Zomato-style feature list with the active code; it is not a claim of parity with either live service.

Release storage/rollout notes are in [DATA_STORAGE.md](DATA_STORAGE.md). The
469-test backend regression suite now passes on isolated PostgreSQL, including
restored-database migration rehearsal; production load/concurrency certification
remains outstanding. Earlier local-only deployment references below are
historical checkpoints, not evidence of the current Vercel alias.

## Outcome

### Restaurant and delivery workspaces — desktop/mobile refresh

Live runtime `748aeb5`, deployment `dpl_CectrctZgsZToJs1LrtzkZrch9Pe`, at
https://runchigoo.vercel.app. The stale-prone main-branch alias was also aligned.
All 135 public HTML/JavaScript/CSS files match the tested local production build.
Public catalog APIs respond successfully; account APIs retain authentication.

The restaurant and delivery roles now use the same console-level design system
as admin, with their own navigation and operational priorities. All 18 active
partner/shared page combinations are covered, not only the landing dashboards.
Kitchen reports/CSV and current queues, menu/stock/add-ons, offers/coupons,
merchant finance, rider availability/routes/history, profiles, notifications,
settings and role-specific support are included. Original logo and database
records are preserved. See [PARTNER_WORKSPACES.md](PARTNER_WORKSPACES.md) for the
page matrix, test scope and unchanged provider/feature boundaries. This does
not mark the wider product matrix or real commercial operations complete.

### Previous admin production release — 23 September

Runtime `477963e` is live at https://runchigoo.vercel.app, deployment
`dpl_ELq971mHuhvTSTm6x1XTgJdWgHbb`. The production, project and main-branch
aliases point to this release. All 131 HTML/JavaScript/CSS files checked on the
public deployment match the local production build byte-for-byte. Catalog APIs
return 200; unauthenticated account access returns 401. Migrations through 0027
were backed up, rehearsed and applied while preserving existing application rows.
Commercial policies remain disabled; no production data was seeded or reset.
Authenticated production-admin browser verification remains unperformed.
Earlier source-only and blocked-rollout checkpoints below are historical.
Automatic Git deployment still needs the repository connection aligned with
the user's approval; the current release was deployed and promoted directly.

### Admin UI release — desktop and mobile

The active admin routes now share a grouped evergreen navigation rail, consistent
headers, restrained status colours, data tables, forms and responsive cards.
This covers overview, orders, payments/restaurant finance, restaurants, riders,
people, partner accounts, categories, offers/coupons, reports, reviews, delivery
settings, order policies, audit history, team access and profile. Account settings,
the team support inbox and notifications use the same admin workspace.

- Overview and admin reports share an interactive chart: orders/order value,
  bars/trend, daily/seven-day aggregation, delivered-series toggle, keyboard/touch
  inspection and exact daily figures. Sparse history remains sparse; no business
  data was seeded to decorate the charts.
- Restaurant and rider directories have real search/filtering, mobile cards and
  explicit confirmation before existing approval/availability/access operations.
  Failed reads offer retry; failed payment badges are not coloured as success.
- Cancellation, cash/tips and rewards policies are separate keyboard-accessible
  tabs. Zones, cities and pricing have their own tabs. Unsaved form state survives
  switching sections; no shared commercial setting was activated.
- Offers/categories have aligned campaign cards, audit records use a timeline,
  and access cards identify the administrator. Original RuchiGo branding remains.
- Mobile navigation has a sliding/fading drawer, a morphing menu icon, immediate
  link navigation, reduced-motion support, focus return and scroll-lock cleanup.
- Desktop now has a compact branded rail with independently scrolling navigation,
  a persistent rail footer and automatic visibility of the selected page. The
  utility bar contains workspace search, storefront, notifications and profile.
  Search supports Cmd/Ctrl+K, arrow keys, Enter/Escape, focus return and only
  permitted destinations; it does not search or expose private record contents.
- Desktop overview hierarchy, live-operation strip, value cards and chart/flow
  alignment are refined. Order rows and category cards are denser without losing
  details, support controls or real statuses. Original logo/assets are unchanged.
- The admin phone header identifies the operations workspace without shopping
  address/cart controls. Admin shopping routes retain the customer header.
  Mobile forms use readable inputs, safe-area-aware scrolling and a reachable
  sticky close action. Date filters collapse without discarding drafts; a native
  details-toggle/desktop-resize race was fixed and covered by browser regression.
- Mobile review search has its own full-width row and notification text no longer
  competes with a right-hand action column. Narrow and short viewports are
  checked in addition to desktop/laptop layouts.

This is a UI implementation/verification pass, **not completion of all 300
features or production certification**. It is now deployed as recorded above.
No shared account reset or commercial-policy activation was performed.
Verification details are in [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md).

### Mobile navigation and admin overview refresh — local follow-up

The mobile header now has an explicit 44px menu trigger for shoppers and all
partner/admin workspaces. Header, Account and More shortcuts open the same
role-aware, scrollable dialog. It includes account settings/sign-out, supports
Escape/backdrop dismissal and focus return, and closes when navigation or a
desktop resize makes it obsolete. Original branding is unchanged.

The admin overview now separates the current operational snapshot from
7/30/90-day performance: real API-backed trends, readable KPI cards, exact daily
figures/CSV export, stage-filtered order links, latest-order lookup and partner
approvals. Reporting uses complete IST days and groups by order placement date;
gross delivered-order value is not labelled platform profit. Unavailable
reports show an error/retry instead of invented zeros. Delegated admins retain
permission-scoped shortcuts without gaining reporting/finance access.

This follow-up is included in the admin UI release above. Mobile navigation,
overview reporting, dashboard queues and the isolated merchant-finance journey
were verified locally, as were lint/build checks. The later production release
above resolves the earlier migration and Vercel authentication blockers.

### Historical commerce checkpoint — 23 September, before production rollout

Runtime commit `a2ffa26` is pushed to `prasanti25/runchigoo` main. This was a
source-only release: no production migration, deployment or policy activation
was performed. Vercel project/alias metadata checks returned HTTP 403 using the
available local authentication, so the live version could not be reconfirmed.
The last recorded Git integration points to `shxvaayy/runchigoo`; do not assume
this push deployed automatically. Migrations 0023–0027 still require the release
procedure in [DATA_STORAGE.md](DATA_STORAGE.md).

The latest 117-feature request is tracked individually in
[IMPLEMENTATION_TODOS.md](IMPLEMENTATION_TODOS.md): **93 implemented, 20 partial,
4 missing**. The complete numbered matrix remains a comparison, not a promise
that all 300 entries or commercial operations are ready.

This increment connects selected doorstep/city/zone filtering across discovery,
search, recommendations and the personalized feed. Google forward address
suggestions update the existing Google pin and address form; customers confirm
missing street/flat/floor details. Precise coordinates stay out of Gemini ranking
context. Profile analytics now show actual collected/refund-adjusted spending,
monthly history, favourites and order frequency. Business reports add defined
cohort retention and separate collected/refunded/net figures.

Approved merchants now manage owned coupons and link offer banners to redeemable
codes. Named festival/first-order campaigns, single-dish BOGO and platform-funded
fee-waiver coupons share eligibility, cart display, signed quote and checkout
validation. Extras are not free under BOGO; both portions consume stock. Coupon
usage and stock are locked on checkout. Linked campaign changes invalidate old
quotes. Administrators cannot silently turn a merchant offer into a global one.

Kitchens can opt into scheduled **preparation starts** with configured hours,
notice and horizon. Early cooking is blocked in the kitchen UI and API. Optional
cash tips are policy-gated and COD-only, visible in the bill/order/rider collection
details. Both are disabled by default, and no live policy has been enabled.

Verification: **416 PostgreSQL tests including actual concurrent checkouts**,
real local customer/merchant/admin/rider browser regressions, 1440/390/320px,
actual configured Google geocoding/maps, lint/build, credential scan and an
isolated 0022→0024 migration rehearsal. See [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md).
This batch changes schema and is now committed/pushed; its production rollout
remains pending. Database/source changes are not automatically deployed by a
successful local build.

Follow-up: real promotional points/credit ledger, capped cashback, levels,
referrals, signed redemption and confirmed-refund/cancellation reconciliation
now connect the profile, checkout, order bill and admin policy UI. Policies stay
disabled until commercial approval. Existing order snapshots survive policy
changes. Refunds still go through the original payment method; promotional
credits are not a replacement. Negative adjustment balances can result when
already-spent rewards are reversed; no bank charge or withdrawal is implied.

City availability now has audited pause/reopen controls shared by discovery,
catalog and checkout without interrupting existing deliveries. Finite weekday
peak pricing and fixed temporary demand fees are configurable; overlapping fees
do not stack, the cheapest eligible adjusted zone wins, and free-delivery
benefits still waive the full fee. Automatic demand prediction/pricing is not
claimed. All new pricing rules remain inactive on the shared preview.

Merchant finance now records pre-tax food sales, approved snapshotted commission,
confirmed-refund adjustments and finance-confirmed external payments in a locked,
append-only service ledger. Customer bill amounts do not change when commission
is configured. Platform-funded discounts are separated from merchant discounts;
delivery/tips are excluded from commission. External payment recording and
audited corrections do not initiate or reverse bank transfers. Legacy orders
remain outside the new ledger and coverage is explicit. Both policies stay off.

Admin personal shopping no longer requires switching accounts: owned checkout,
history, reviews, cancellation, rider chat and ETA are separate from delegated
operations permissions. The admin overview now uses concise metrics/action
cards and mobile order cards. Finance workspaces use separate payment, earnings
and refund tabs; mobile has scoped Overview / Orders / More navigation.

Still missing or partial beyond keys: stored-money wallets, private
KYC/license/FSSAI workflows, automated payouts/tax accounting, automatic surge,
route optimization, scheduled capacity/workers,
online tip payout handling and broader audit coverage. Do not enable real
commerce until provider, storage, commercial policy and operations gates are met.

RuchiGo now has a consistent customer experience and operational workspaces connected to its Django API: discovery → menu → cart/coupon → checkout → kitchen states → delivery confirmation → review/support. The implementation is a working product foundation, **not a completed 300-feature commercial platform**.

### Support conversations and fulfilment ownership — deployed

Support now distinguishes the requester from staff using server-derived ticket
ownership, not their account role. Administrators shopping for themselves get
normal replies and feedback; other customers' tickets clearly show staff mode.
My order help and the customer support inbox are separate. Delegated admins can
access their own help without gaining another customer's data or inbox access.

Order-aware quick choices use current kitchen, delivery, cancellation and payment
records. A queued customer can explicitly check facts without dropping the human
review. The newer contextual-support increment below also enables ordinary text
assistance in that queue; there is no claim of a human agent being online.
Replies are persisted, retries are idempotent, and a
reply arriving through polling cannot leave typing/buttons stuck. Selected chat
updates are polled every 3 seconds (the inbox every 5); this is not WebSocket or
millisecond delivery. Requests time out after 20 seconds with recovery messaging.

Only the owning restaurant can accept/prepare/mark ready. Only a delivery-role
account can claim pickup, and only the assigned rider can pick up/complete with
the delivery code. Admin/superuser normal-stage bypasses and kitchen buttons are
removed. Exceptional audited hold/resume/cancel/refund review remains separate.
Quick help never executes a cancellation, refund approval or transfer itself.
No schema migration, new provider credential or change to the Google demo.

Verification: 342 isolated SQLite backend tests; real local support conversation,
cancellation and dashboard-queue browser regressions; desktop/320px/390px views;
lint/build and migration drift checks. Final support fixture: local order 52,
ticket 55; user order 16 unchanged and no real refunds submitted. Runtime
`a2236cd` is pushed to main and deployed at https://runchigoo.vercel.app
(`dpl_Dkh32o15fXX6rPVG1sUCMLPZv27g`). Public-only production checks confirm the
updated support bundle, guest sign-in flow, 1440/390/320px layout, protected
support/dispatch endpoints and no browser errors or business writes. Authenticated
conversations were exercised locally, not by modifying production customer tickets.

### Contextual support follow-ups — deployed and verified

The supplied account's latest ticket was inspected read-only. It was resolved,
had a queued-review flag, and concerned a cancelled COD order without a recorded
collection. That flag incorrectly silenced later customer text. Assistance now
continues while review stays queued, with context-aware yes/no and payment-method
choices. Historical messages and their actual authors are not rewritten.

No-payment confirmation offers an explicit close-chat/feedback path. Reported
cash or online debits open payment-mismatch intake in the same owned ticket.
Missing/spoiled/wrong food, delivery-status discrepancies, refund follow-ups and
additional review details use persisted issue intake, affected-item validation
and retry-safe submissions. Only a captured payment can create a refund-review
request; this never approves or transfers money. Existing refund decisions are
preserved. Rejected or reportedly missing refunds can receive more details without
creating a second refund. Routine cancellation and meal-rating choices open the
real confirmation/rating controls inside the conversation.

Only the latest support message exposes its choices, mobile resizing retains the
latest message, and pending replies recover after failed/lost requests. Fixed
shopping navigation is hidden in open conversations so it cannot cover Send.
Payment follow-ups acknowledge already-recorded details instead of repeating
the initial payment question. Gemini
classifies unfamiliar redacted text; order/payment facts and allowed actions come
from the database. Routine assistance does not require staff. Unverified payments,
food disputes and refund approval still require verification and authorized
policy; this is not a claim of universally humanless support.

No schema changes, live customer test messages or real refund submissions are
part of this increment. Runtime `fa8e4e8` is pushed to main and deployed at
https://runchigoo.vercel.app, deployment `dpl_GrbbxbFRDdQCYUCT1MSUXmKsN8VF`.
The full 360-test backend run, final 45-test support run, real local browser
conversation and public-only live privacy/bundle/layout checks pass.
See `VERIFICATION_REPORT.md` for test scope and retained local fixtures.

### Delhi district checkout — deployed

Explicit Delhi district aliases now let South Delhi addresses match Delhi
kitchens in checkout, discovery and recommendation filtering. Noida/Gurugram
remain separate; configured pin/radius/trip constraints are unchanged. Checkout
and the delivery header share the selected saved address. Runtime `c4bbce9` is
deployed at https://runchigoo.vercel.app, deployment
`dpl_3o38CaK5TyeYmBmiQvDvN8X6oFdJ`. Public discovery checks and the isolated
checkout browser regression pass; no live address/order/policy was edited.

### Google rider map and public demo — deployed and verified

The address and delivery maps now share the Google renderer configuration. Live
orders retain their fast, owned GPS channel; Google Routes supplies a separate
road path to the restaurant before pickup and the snapshotted doorstep after
pickup. Fresh GPS is matched to that road only within 25m; off-route points are
not forced onto it. Stale GPS dims the marker, stops animation and suppresses
route ETA. Driving-road estimates exclude live traffic and are not exact arrival
guarantees or two-wheeler routing. No new schema or business-data migration.

`/demo/delivery` is now an explicitly labelled public, read-only 50-second preview.
It requests two Google road legs between fixed public sample pins and never calls
real order endpoints. No routes are cached or saved to the database. Actual
Google demo acceptance passes locally, including centre-on-polyline checks,
desktop/mobile zoom/expand and reduced-motion/error handling. The separate live
rider test passes through real courier GPS writes and customer reads (one observed
update took 1,298ms), Google route/nearby lookup, stale state and completion.
334 isolated SQLite backend tests pass. Runtime `3543609` is pushed to main and
deployed at https://runchigoo.vercel.app, deployment
`dpl_CJo8CNs2MWFjQsv2tCctK3T3wRE6`. Public-only production Google address and
delivery-demo acceptance both pass, including actual maps/routes, two-finger
touch zoom, fullscreen ETA and no business-data writes. The OSM fallback browser
regression also passes with explicit fixtures. Demo: https://runchigoo.vercel.app/demo/delivery.

### Delivery-location increment — production public lookup verified

Local follow-up: manual entry now retains the matched lookup and pin. An optional
Google Geocoding adapter and Google address-map renderer are implemented. The
server credential was verified with a public-landmark lookup. A separate
Maps JavaScript browser key is now configured locally and activates Google.
After the website allowlist was corrected to include `/*`, live browser acceptance
passes at `/addresses` on both `http://localhost:5173` and
`http://127.0.0.1:5173`: actual Google tiles and reverse lookup, desktop/mobile
layout, zoom/expand, delivery-detail autofill, local account save/reload and
preserved GPS coordinates. Only device GPS was controlled at a public landmark;
the user's personal address coverage was not tested. No Google deployment has
been made at that checkpoint. The rider map is upgraded in the release candidate above. Google house-number
suggestions are editable and never imply reliable flat/floor detection. No Places
autocomplete or production Google acceptance is claimed.

The desktop-first header/address flow now supports opt-in GPS, an adjustable map
pin, zoom/expand, street/locality autofill through an optional server-side
LocationIQ adapter, editable flat/landmark details and explicit account saving.
The header displays the selected address rather than only the city; header and
checkout use the same owned saved address. Typed flat details survive pin updates,
stale lookup responses are ignored, and missing providers keep manual entry
available. Logout clears the browser's precise address selection.

LocationIQ is configured in the local backend and Vercel Production environment.
The real-provider browser test passed locally at a public Connaught Place pin:
street/locality/city/state/postcode autofill, typed flat details, account saving,
coordinate preservation and reload. No provider response was mocked in that test;
only device GPS was controlled. Public-only production checks also passed at
https://runchigoo.vercel.app: real provider lookup, desktop/mobile maps, confirmation
and browser persistence, without production business writes. This verifies runtime
commit `c6cc983`, deployment `dpl_A8n3Sye7XzvL6Vh6HTWCx88gMwyj`.
The full 313-test SQLite regression, including geocoding and rider-location tests,
passes; the 292-test PostgreSQL result above applies to the preceding deployed
release. No database migration is required.

Approximate IP/network selection has been removed from the customer interface.
Guests can enter a full address without GPS; manual city filtering is explicitly
browsing-only. A subsequent location fix removes OS-specific instructions and
the definite permission-off diagnosis; the picker keeps a short error, retry and
manual entry. All users, including guests, confirm their pin then edit delivery
details. Missing provider streets are not invented, and flat numbers remain
user-entered. A locality-only result no longer gets a generic warning when its
required address fields are present. This follow-up is deployed at
https://runchigoo.vercel.app, runtime `f209ebc`, deployment
`dpl_Ago7SVJc58x64rFAH7Aa1eE3KCKd`. Public-only live acceptance passed: real
LocationIQ lookup, desktop/mobile map, guest delivery details and browser save,
reload persistence, denied recovery and a silent-callback deadline. No production
business records were created.
The user's Chrome localhost permission and global macOS Location Services were
verified enabled; their screenshot also confirms Chrome's OS toggle is on.
Read-only process inspection found Chrome running framework 153.0.8010.48 while
the installed version was 153.0.8010.53. After explicit user approval, Chrome was
normally restarted and the new process was verified loading 153.0.8010.53.
The restart did not fix acquisition. Temporary localhost-only diagnostics then
identified a replaced one-shot geolocation method returning denial despite granted
browser permission; Urban VPN 5.14.4's installed wrapper contains the matching
error/fall-through. A standard first-fix watch succeeded in the actual browser,
and the user supplied a screenshot with their map/locality loaded after the fix.
The picker and nearby search now share that method with a 15-second application
deadline and cleanup on completion, timeout, replacement and close. No privacy
setting was bypassed, no extension was disabled, and no IP-derived pin was used.
Temporary diagnostics were removed; no device coordinates were recorded by them.
The user's current lookup contains a locality but no mapped street. Exact street
coverage is not resolved by the GPS fix; flat/floor information cannot be inferred
from a pin. The user subsequently confirmed the pin is correct; address-data
coverage, not pin placement, is the remaining limit for automatic street text.

The next increment adds a blank required house/flat/building input, separate
street/area and optional floor fields for new addresses. House and floor details
are composed into the existing API address lines so saved addresses and order
snapshots remain compatible; legacy edits preserve their existing free-form text.
Rider directions now prefer saved restaurant/customer coordinates rather than
re-geocoding an area label. The pin uses a custom orange vector marker, centred
target, drag lift/settle feedback and reduced-motion support. Local browser tests,
18 device/address unit tests, actual provider persistence and rider checks pass.
This doorstep/pin increment is now live at https://runchigoo.vercel.app,
runtime `1dfc9b5`, deployment `dpl_6RwUt1zYtEYxoNLmMjbmAmWpzMCm`. Public-only
production checks passed for real-provider lookup, the custom pin, required
house/flat entry, guest save and reload. No production business records were created.

The customer rider map now has a separate one-second owned GPS polling channel,
with rider writes limited to once per second and stale fixes labelled after
15 seconds. LocationIQ nearby-road lookup is independent and cached for 30
seconds, never used to generate positions. The real local cross-browser test
observed a new GPS fix on the customer map in **1,434 ms**; this is one controlled
local measurement, not a device/network/production latency guarantee.

The original code already contained JWT/password/email-OTP authentication, role permissions, restaurant/menu/address/cart/order/payment models, basic CRUD and live admin/role pages. It also contained disconnected legacy screens. This pass added the shared design system, rebuilt the principal journeys, added server-side Gemini recommendations and conditional Razorpay checkout, and added integration/regression tests. Older unused pages are preserved but no longer routed where replacements exist.

## Comparison against the supplied scope

See [FEATURE_MATRIX.md](FEATURE_MATRIX.md) for all 300 numbered entries, including duplicates: **145 implemented within the recorded scope, 76 partial, 5 provider-gated, 74 missing**. “Implemented” is not a commercial-readiness certification. Dashboard/support/tracking release `28a191e` is deployed; the historical checkpoints below are not a claim of completing the remaining backlog.

## People, branded loading and food-conversation correction

- People has server-backed summary cards, role tabs, access/search filters, avatars, compact actions, confirmed/audited access changes and responsive account cards. No sample statistics were added.
- Route/auth loading and shared data-loading states use the original RuchiGo logo with rotating rings. The logo stays stationary; reduced-motion is respected. No artificial delay/progress is introduced, and conversation typing remains distinct.
- Strict non-veg filtering fixes the reported pizza conversation. Bounded follow-ups retain the last dish/diet/budget; named foods and ingredient combinations are constrained before provider ranking. A saved vegetarian-profile conflict is explained, never silently overwritten. No-match responses explain real availability and budget rather than inserting unrelated dishes.
- Actual local Gemini/browser checks returned only a non-vegetarian pizza for both reported messages, and no items under ₹200. Model IDs/debug status remain outside the customer UI. Provider failures still use explicitly menu-based fallback/clarification; this is not a provider-uptime guarantee.

## Coupon discovery and basket savings

- Cart and checkout expose searchable, paginated available/unavailable coupons with current saving, expiry, minimum spend and eligibility reasons. First-order, restaurant, account/global use limits and inactive campaigns are enforced server-side. Listing, applying and checkout share calculation rules.
- Spend-to-unlock cards use current food/add-on totals and configured coupon thresholds. Delivery progress uses the checkout address/zone rules, including overlapping-zone minimums. Missing/unserviceable addresses or no free-delivery policy never produce a fabricated free-delivery promise.
- A short confetti/checkmark confirmation appears only after successful coupon validation; reduced-motion disables the burst. Invalid codes do not celebrate. Coupons replace rather than stack, revalidate after bag changes and are removed when no longer eligible. Redemptions are consumed only at checkout.
- No new production coupon, merchant, order, fee policy or delivery zone is created by this increment. ₹80/₹150 campaign examples in browser evidence are explicitly isolated local fixtures, cleaned after testing. Existing sample commercial data still requires business review.

## Dashboard and delivery-conversation increment

- Admin People is now a consistent workspace with server-side search, role/access filters, pagination and matching total counts. Changes are audited without storing password/profile values in audit metadata. Ordinary admins cannot modify other admin accounts. Active-work blocking and role-history checks prevent unsafe account changes; production SQL race testing is still outstanding.
- Admin orders and admin/restaurant payment ledgers use paginated API queues, date/status filters and server aggregates. Order cards expose only the next kitchen step, with explicit confirmation and a stale-stage guard; courier assignment/pickup are not fabricated by a dropdown. Refund review is available directly in the Finance workspace, with explicit original-method submission still provider-gated.
- Restaurant/admin reports use SQL aggregation without the former 10,000-row truncation. Up to 90 selected days, previous-period comparison, order-growth figures, gross-value chart, exact daily table and CSV export are available. All-time platform totals are separately labelled. Gross order value is not a payout, tax statement or net revenue.
- Superuser-only Team access assigns 11 operational scopes. New admins created/promoted through the API start without workspace permissions. Existing admins retain their legacy full access until reviewed. Permissions are checked on subsequent API requests, including support/finance separation and historical notifications after revocation; sidebar controls are not the security boundary. Catalog and promotion access are separate; merchant selection uses a minimal searchable lookup.
- Customers and assigned couriers have private, persisted delivery conversations with retry-safe messages, read receipts, history and notification deep links. A replacement courier cannot read the previous courier's messages. Conversations are read-only after delivery/cancellation; no fake presence, automatic reply or background-delivery guarantee is shown.
- Local and production schemas are through **0022** (delivery messages, admin grants and reporting indexes). Production was migrated for `28a191e` with pre-existing rows preserved. No financial policy activation or provider refund occurred. See [DASHBOARD_RUNBOOK.md](DASHBOARD_RUNBOOK.md) for operation and tests.

## Checkout, ratings and support increment

- Restaurant menu categories now exclude unrelated/empty platform categories. Five directly clickable stars are available for delivered meals in tracking and the restaurant reviews section; low ratings offer a food-quality help link.
- Order-linked complaint conversation: affected dishes → problem description → explicit refund-review/support choice → confirmation. Spoiled-food English/Hinglish prompts link to this flow. No complaint/refund is submitted merely by asking the assistant a question.
- Persisted refund requests and admin reviews, original-payment Razorpay refund submission, verified partial/full refund ledger, signed callbacks and uncertain-result reconciliation. Eligible self-cancellation has a separately admin-authorized automatic full-refund policy with durable recovery. Staff cancellation now explicitly approves a full original-method obligation before separate provider submission. Cash payouts, broader eligibility rules and live provider verification remain outstanding. The local payment provider/webhook are not configured; no real money was moved.
- Cancellation is available in history and tracking with explicit reasons/confirmation, live eligibility refresh and server-side order locks. No self-cancellation once cooking starts. The unchanged default closes at acceptance; admins may configure pre-preparation cancellation and prepaid refunds for future orders. Checkout saves the policy revision, so later changes do not rewrite old rights. Refund status and order-linked help stay visible; stock/coupon release is one-time.
- Resolved support conversations offer sad/neutral/happy face feedback and optional comments, stored separately from meal ratings. Only the conversation owner can submit them.
- The screenshot's passive ticket form is replaced by one persisted conversational thread: factual assistance after each owned message, real-request typing, linked order/refund facts, retry-safe message IDs, bounded Gemini intent classification and explicit team handoff. A later staff reply suppresses a redundant automated answer; a queued review no longer silences new customer text. Food complaints on undelivered/cancelled records ask about a status mismatch rather than assuming delivery. Active-thread notifications stay in the inbox without overlaying the composer.
- Restaurant fulfilment issue → customer-visible hold → explicit admin resume/cancel decision is wired through the four roles. Held orders cannot progress or be assigned/picked up/delivered. Staff cancellation uses current-stage validation and explicit full online-refund approval; cooked food is not restocked. Policy, cash and live-provider boundaries remain explicit.
- Delivery-area admin workspace, opt-in circular-zone enforcement and server-signed address-specific bill. Cross-city checkout is always rejected. New zone prices are not enabled automatically; baseline same-city pricing is preserved until an admin changes policy.
- Fifteen-minute unpaid reservation expiry, one-time stock/coupon release, and late-capture reconciliation without reviving cancelled orders. Production scheduling is still required; lazy customer-order/checkout expiry is also present.

See [CHECKOUT_SUPPORT_RUNBOOK.md](CHECKOUT_SUPPORT_RUNBOOK.md) for configuration, production boundaries and tests.

| Area | Available in the active implementation | Still needed for full scope |
| --- | --- | --- |
| Account/profile | Email/password auth, email-OTP recovery/verification, profile/settings/photo, addresses, saved dishes/restaurants, history/reorder, recent restaurant visits and delivered dishes, persistent food preferences and history-personalisation opt-out | Mobile/SMS OTP, Google login, saved payment methods, production avatar storage |
| Discovery | Restaurant-first menu navigation; combinable city, cuisine, veg, budget, 4+ rating, max preparation, restaurant offers and bestseller filters; rating/price/prep sorting; opt-in radius/nearest sorting for mapped kitchens; pagination | Geographic serviceability, accurate merchant coordinates, personalized collections, genuine popular/new cohorts, dedicated gourmet/healthy taxonomy |
| Restaurant details | Profile/menu, weekly opening schedule/customer hours, preparation time, price/veg/calories/tags, required size/choice groups, priced extras, stock/closed availability and verified-order reviews | Hygiene/licence verification, authoritative nutrition, multiple daily service intervals, stock per variant |
| Cart/ordering | Single-restaurant cart; required/optional groups; stock checks/locks; server-signed address quote, immutable snapshots, coupons, instructions, contactless, idempotency, COD cancellation and reorder; unpaid reservation expiry | Scheduled/bulk orders, tips, wallets/loyalty redemption, tax rules and production expiry scheduling |
| Payments | COD; conditional Razorpay checkout; capture/signature checks; deadline/late-capture handling; admin-reviewed original-method refunds, callback verification, partial/full ledger, reconciliation, opt-in self-cancellation refunds and explicit staff cancellation/full-refund approval | Live provider certification, broader automatic refund eligibility, cash payouts, settlements, saved cards, split payments, tax invoices |
| Tracking | Persisted order events, separate assignment/pickup, polling status, opt-in browser GPS, map, delivery code, directions and private customer–courier messaging | Background/mobile GPS/chat, route optimization, trained ETA model, masked calls |
| Restaurant workspace | Registration/login, profile/hours, menu CRUD, tags/photos, stock quantities, required choice groups, kitchen queue, offers, payment ledger and scoped peak-hour/bestseller analytics | Document KYC, external inventory synchronization, stock by variant, settlements/commissions and paid-order expiry/reconciliation |
| Delivery workspace | Registration/approval, online/offline, ready requests, assignment/pickup, directions, opt-in location sharing, OTP confirmation, delivery history, server-aggregated overview and account profile | Aadhaar/licence/vehicle verification, service-area dispatch, real earnings/incentives and payouts |
| Admin | Paginated account/order/payment workspaces, partner approval, categories/offers/coupons, date-filtered analytics, support/refund review, delivery zones/order policies, review moderation, activity log and superuser-managed granular workspace access | KYC tooling, net accounting/payouts, more complete configuration and audit coverage, legacy access review and production provider certification |
| Offers/loyalty | Active offer display and management; customer coupon feed; monetary/percentage coupons with dates, minimum spend, global/per-customer limits, optional restaurant scope, first-order eligibility and maximum saving; fixed free-delivery threshold | Offer-to-discount rule linkage, BOGO, referrals, loyalty, cashback, membership |
| AI | Server-only grounded ranking; follow-up food conversation; city/budget/veg and explicit vegan/Jain tagging; browser voice-to-text; history/preferences-based restaurant and coupon feed; on-demand AI review sentiment; support guidance and owned-order status; historical demand/sales/arrival baselines and admin-only rule-based risk review | Quality evaluation at scale; real-device speech testing; full multilingual conversation, multi-item meal planning, autonomous support, trained forecasting/ETA/fraud models; no claim that statistical baselines are trained AI |
| Grocery/quick commerce | Not implemented | Separate catalog, inventory/fulfillment/cart rules and operations |
| Dining/bookings | Not implemented | Tables, slots, reservations, dining payments and partner tools |
| Location/pricing | City selector/IPinfo suggestion, browser pins, external Google directions, OSM map, same-city checkout and admin-configured circular zones with distance-based fees/minimums/free threshold | Approved zones/prices/pins, trusted proxies, Google Maps SDK, geocoding/autocomplete, road-distance/traffic/surge pricing, optimized routing |
| Analytics | Role-scoped SQL summaries, selectable up-to-90-day trends/table/CSV, previous-period growth, AOV, cancellation, repeat/returning counts, cities, best sellers, peak hours and labelled historical baseline | Cohort retention, trained prediction, true payout accounting, production high-volume load validation |
| Notifications | Shared header bell/unread summary for all four roles, mark all read, account-scoped inbox, automatic checkout/kitchen/courier/payment/signup/security/review/support events, transactional deduplication, foreground activity toasts and deep links; existing email auth messages | Background/browser push, SMS, WhatsApp, promotional consent, large-scale queue/fanout and external delivery/retry infrastructure |
| Support | Owned conversational complaints/affected dishes, optional refund review and tracked decisions, replies/notifications, resolve/reopen, conversation-face feedback, grounded assistant handoff | Staffed operations/SLA, private attachments, synchronous human chat/presence, autonomous resolution, live payment certification, privacy export/deletion |
| Advanced platform | Multi-restaurant catalog, shared four-role navigation, lazy routes, responsive UI | Multilingual, subscriptions, corporate/group/catering orders, split bills, ads, advanced BI and fraud controls |

## Important boundaries

- Discovery budget is per dish; fast preparation does **not** imply a delivery ETA. Nearby uses approximate straight-line distance and excludes restaurants without coordinates. Checkout separately checks same-city delivery and, when enabled, configured delivery zones. Offer filters mean current restaurant offer records, not a guaranteed coupon discount.
- Food imagery is illustrative stock, not verified photographs of these merchants’ exact dishes. The current 12-dish preview catalog has matching assets, including cold coffee and veg thali; unknown future dishes should receive an uploaded photo. Restaurant images and dish images have separate fallback rules.
- Options are configured under Restaurant → Your menu → Edit dish. Add a choice group (for example one required size), then assign options to it. Options without a group remain optional extras. Guests can inspect prices and retain selections/quantity through sign-in. Removed/unavailable choices or changed requirements block checkout. Discovery minimum prices/budget eligibility include required options. Stock is shared per dish, not per size.
- Restaurant reviews have a dedicated responsive grid and separate loading, failure/retry and empty states. Seven confirmed local test reviews were archived from the preview's public feed, with moderation audit entries and the records retained. Product browser tests now use uniquely marked temporary reviews with exact-record cleanup, not realistic testimonials; forced termination/API downtime can still interrupt cleanup.
- Profile photos accept JPG/PNG/WebP up to 5 MB and 4096px per side. The API produces a 512px centre-cropped WebP without EXIF and removes replaced/deleted avatar files after successful commit. Local `/media` requests are proxied to Django; configure production media storage/serving separately.
- Activity notifications are generated within successful operation transactions. The visible app polls every 15 seconds, refreshes after relevant local changes, and groups new activity without replaying old inbox history on login. Courier availability alerts use the existing online-partner pool; geographical dispatch is still pending. Cart clicks and every GPS point intentionally do not create inbox records.
- “For you” is available at `/for-you` in desktop/mobile navigation. It uses the existing server-side Gemini integration when configured; otherwise results are explicitly labelled current-menu picks.

- Gemini now defaults to `gemini-3.5-flash-lite`, verified against Google's available-model list after the older 2.5 model rejected new-user requests. Live browser tests returned different eligible vegetarian, pizza and coffee picks. A ₹50 pizza request correctly returned no matches. Customer UI omits model IDs and debug explanations; source/model remain available in developer test evidence. Fallback picks remain explicitly menu-based.
- Gemini receives menu data, preference text and prior-order boolean signals, not account names, email, phone or delivery addresses. User-entered free text may itself contain personal information; publish an appropriate disclosure before production.
- Razorpay is disabled when keys are missing. Tests mock the provider and cover invalid signatures, captured amounts, duplicate notifications and the paid/unpaid kitchen boundary. They do not prove real UPI/card settlement. Verify with provider test credentials before enabling live keys.
- Captured prepaid self-cancellation is authorized only by the order's snapshotted opt-in policy, with a durable full-refund obligation and original-method submission. The policy remains disabled locally. Generic status cancellation of captured payments stays blocked; the dedicated admin support action requires a fresh stage, note, confirmation and exact full-refund approval. Requested/approved/processing/processed remain separate financial states; cash payouts and real provider acceptance remain launch work.
- Courier acceptance now creates an `assigned` event without recording pickup. Only the assigned courier can confirm pickup; the order then becomes `out_for_delivery`. Repeated pickup calls do not duplicate events, and delivery confirmation is rejected before pickup.
- Location sharing works only while the courier page is open and permission remains granted; it is not native background tracking. No invented ETA or moving marker is shown.
- Location alone is not a service promise. Admin-enabled zones enforce radius and maximum kitchen-to-door distance using pins; default mode only enforces same-city delivery. Configure and approve zones before geographic expansion.
- Restaurant calories/tags are owner-entered, not medical/nutritional verification. Veg filtering selects vegetarian dishes; it does not certify a pure-vegetarian kitchen.
- Offers are descriptive records; coupon calculations are separate. Preview promotions/ratings are seeded examples, not verified commercial claims.
- The print view is an order receipt, not a GST invoice. Restaurant payment totals are gross order value, not net earnings. Delivery payouts are explicitly unconfigured.
- Customer/kitchen lists plus the active People, order and payment workspaces are paginated. Analytics aggregate in SQL with reporting indexes. Some partner directory/delivery-history pages still load all records; further scale work and production load testing remain.
- Privacy and Terms now have readable sections, anchor navigation and print styles, but are explicitly **drafts**. Legal entity/address, designated grievance contact, retention and approved commercial policies remain unconfirmed. See `LEGAL_RELEASE_CHECKLIST.md`. A privacy support ticket does not automatically delete or export data. Registration acceptance is not yet recorded as a server-side policy-version receipt.
- Customer profile has grouped account navigation, inline editing, photo-based recent orders, reorder and saved-address preview. Restaurant profile includes a listing preview; courier/admin account pages expose real account details and relevant controls. The original RuchiGo logo is unchanged.
- Partner order-contact payloads omit customer email and account-status fields. The new Leaflet map loads tiles only after a customer chooses to show it. Its custom RuchiGo scooter interpolates only real received GPS points, with dedicated server timestamps and stale/missing states. Google directions remain external links. See `TRACKING_DESIGN_NOTES.md` for official references and public map-provider configuration.
- Release `28a191e` superseded `2a8ebb8` on the live alias, with migrations through 0022. A Git push alone is not a deployment because the Vercel Git integration currently points at a different repository; see `DATA_STORAGE.md`.
- Optional tracked stock deducts at checkout, including awaiting-payment orders. Failed gateway-order creation rolls back. Fifteen-minute unpaid expiry restores stock/coupon use exactly once; delayed capture opens reconciliation rather than reviving the order. Schedule the expiry command in production. Supported pre-preparation cancellation restores stock; cooking food is not restocked. SQLite tests do not prove PostgreSQL/MySQL contention behavior.

## Intelligence and retention increment

- `/for-you?tab=chat`: bounded follow-up food conversation. The provider interprets intent; catalog eligibility and factual explanations remain server-controlled. Order placement, cancellation, payment and refunds always remain explicit existing flows.
- Inline icon-only voice input in home/search/recommendation/chat fields. No separate Speak/Start/Stop controls, listening popup or native hover tooltip. Browser support/permission is required; transcription never submits the home search or assistant automatically. Search-page transcription follows its existing debounced filtering behavior. The browser's voice locale is used (Hindi or English); this is not full app localization.
- `/for-you?tab=taste`: vegetarian, merchant-labelled vegan/Jain, per-dish budget, category preferences, order-history opt-out and reset. `/for-you?tab=picks`: personalized kitchens, saved kitchens, recent visits/dishes and eligible coupons. Home uses the compact personalized feed for customers.
- Restaurant menus expose save/unsave. Recent visits are account-scoped and limited to 20; only visits within 90 days are displayed. Saved/restored test preferences never affect production.
- Restaurant/admin analytics include on-demand review sentiment (up to 30 recent public comments), scoped aggregates and a seven-day same-weekday baseline only after at least 14 observed days/20 completed orders. This is **not a trained demand/sales model**. Gross order value is not merchant net income.
- Tracking only offers a historical arrival range after at least 10 recent completed deliveries from the kitchen. It does not use traffic/route/weather and abstains with insufficient history. Rule-based velocity/failed-payment signals appear only to admins and cannot auto-block anyone.
- Personalized API responses use private/no-store caching headers. Gemini/IPinfo credentials stay server-side; map tiles and browser speech use client-side providers with their disclosed privacy boundaries. Chat prompts omit account/addresses and filter previous support messages from food interpretation. Free text itself can still include personal information; the privacy disclosure explains this.
- Desktop-first `/for-you` now has a real-menu photo feed beside its conversational composer; budget meal cards form a desktop grid. The home hero auto-slides every 3.5 seconds, with tiny navigation dots and no visible play/pause or arrow toolbar. Login/register feature a matching automatic food-photo crossfade without resetting form state. Interaction, hidden pages and reduced-motion preferences stop autoplay. Mobile adapts responsively rather than determining the desktop layout.
- Delivered-order ratings are available directly in tracking, through an editable history action and a dismissible home reminder. Optional feedback, validation errors and saved values persist. Reviews cannot be moved to another order; average-rating updates are serialized by restaurant.
- `/support?order=ID` supplies the owned order to the RuchiGo assistant, with pending typing state and an explicit staff-ticket handoff. Gemini classifies unfamiliar support topics without order records; only bounded factual guidance is returned. Chat never claims a refund/payment/cancellation action was performed.

## Verification

Use the commands in README. Backend tests cover existing API behavior and new checkout ownership/idempotency, address snapshots, cancellation/reorder, approval authorization, blocked restaurants, delivery-code throttling, coordinate validation, unassigned-courier privacy, support ownership/replies, discovery filters, review ratings, Gemini output/fallback and Razorpay verification/webhook behavior.

`scripts/product-e2e.mjs` exercises real local customer login, discovery, COD checkout/coupon, kitchen transitions, courier delivery, review, support, saved dishes, address editing, notification reads and responsive customer/partner routes. It creates local preview records and must not run against a shared production dataset. `scripts/product-preview.mjs` produces desktop/mobile screenshots. Chrome is required.

Latest consolidated backend verification: **292 tests pass on isolated PostgreSQL**, including reporting with 10,001 orders, account safety/audit, granular administrator delegation, filtered queues, private delivery conversations, deployment storage gates, strict food constraints and 19 coupon/savings tests. Coupon browser checks passed twice without order/redemption writes, and the full product browser journey passed again on retained local order 37. The prior People/loading and actual-provider food conversation checks also passed, including real Gemini on the live alias. Desktop and 320/390px checks passed; People also checks 768/1024px and the full journey checks 360px. User order **16** remains cancelled with only pending → cancelled events and no assignment; no test reopened or advanced it. Migrations through 0022 and lint/build checks pass. These checks do not certify live provider settlement, native background tracking/chat, production SQL contention or completion of all 300 entries. See `VERIFICATION_REPORT.md` for scope and retained local fixtures.

## Recommended next release order

Local preview addition: `/demo/delivery` lets a reviewer watch the complete
50-second simulated delivery without operating kitchen/courier accounts. It is
not automatic production dispatch or proof of live background GPS. The demo is
excluded from production bundles, makes no server writes, and keeps real pending
orders unchanged. Map controls now include fullscreen/touch zoom; missing pins
show stage-specific guidance. Google Maps integration remains provider-gated and
unimplemented; the current map is OpenStreetMap. See tracking notes and README.

1. Launch correctness: serviceability and fees/taxes, paid cancellation/refund/reconciliation, abandoned payments, merchant documents/approval policy, final legal policies and versioned acceptance records.
2. Provider configuration: rotate development-shared credentials and provision production Gemini/IPinfo projects/quotas; verify trusted proxies; Razorpay test-mode checkout/webhook/refund; transactional email; object storage/CDN; shared cache; production database and backup/restore.
3. Production hardening: PostgreSQL/MySQL concurrency tests, payment race/replay tests, authorization/privacy audit, monitoring, load tests, accessibility audit, reliable notification jobs and staff support procedures.
4. Retention: referrals/loyalty/membership, recommendations experiments and opt-in promotional notifications.
5. Expansion: inventory synchronization, grocery, dining, corporate/catering and forecasting as separate product releases.
