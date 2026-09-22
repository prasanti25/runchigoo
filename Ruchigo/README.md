# RuchiGo

React 19 + Vite frontend, Django REST backend. Modern customer discovery/ordering and restaurant, delivery and admin workspaces. Recommendations use server-side Gemini Flash-Lite when configured, with a catalog fallback.

Read [PRODUCT_STATUS.md](PRODUCT_STATUS.md) for the feature comparison, launch limitations and next-release priorities. This is a tested product foundation, not a finished 300-feature platform.

See [DATA_STORAGE.md](DATA_STORAGE.md) for the live Neon PostgreSQL data model,
sample-catalog disclosure, deployment migrations and production upload limits.

See [DASHBOARD_RUNBOOK.md](DASHBOARD_RUNBOOK.md) for granular administrator access,
paginated People/orders/payment queues, date-filtered analytics/CSV, finance
refund review and private customer–courier conversations. Local and production
migrations are through 0022; live financial-provider certification remains open.

## Setup

Run from this directory. Use Node 20.19+ or 22.12+ and Python 3.11+.

```sh
npm ci
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
```

Create `backend/.env` using `backend/.env.example`. On Windows, use `.venv\Scripts\python.exe` and `.venv\Scripts\pip.exe`. Keep development files and secrets out of version control.

```sh
.venv/bin/python backend/manage.py migrate
npm run dev:all
```

Frontend: http://localhost:5173. API: http://127.0.0.1:8000/api/v1/. API docs: http://127.0.0.1:8000/api/docs/.

The frontend defaults to `/api/v1`; Vite proxies requests to Django. An optional frontend `.env` can override `VITE_API_BASE_URL`. Gemini/Razorpay secrets belong only in the backend environment, never in `VITE_*` variables.

Use Django migrations as the schema source of truth. The older SQL export in `database/` does not include the new product migrations. Back up existing databases before applying migrations to shared environments.

## Isolated demonstration database

Use a separate SQLite file. Ensure neither `DATABASE_URL` nor `POSTGRES_URL` is set; they take precedence over SQLite. This command is development-only and refuses other database engines.

```sh
export DJANGO_DEBUG=True
export DJANGO_SQLITE_PATH=/private/tmp/ruchigo-product-preview.sqlite3
export RUCHIGO_SEED_PASSWORD='choose-a-local-preview-password'
.venv/bin/python backend/manage.py migrate
.venv/bin/python backend/manage.py seed_preview
npm run dev:all
```

On other operating systems, choose a writable temporary path. Seeding creates four sample restaurants and demonstration accounts:

| Role | Email |
| --- | --- |
| Customer | `preview.customer@ruchigo.test` |
| Restaurant | `owner.spice@ruchigo.online` |
| Delivery | `preview.delivery@ruchigo.test` |
| Admin | `preview.admin@ruchigo.test` |

All use the value of `RUCHIGO_SEED_PASSWORD`. Never use preview accounts, seeded ratings or illustrative offers in production. The current local demonstration was seeded with `RuchiGo-preview-2026`; that password is intentionally for local fixtures only.

## Gemini recommendations

Configure in the backend environment and restart Django:

```dotenv
GEMINI_API_KEY=your-google-api-key
GEMINI_MODEL=gemini-3.5-flash-lite
```

`POST /api/v1/discovery/recommendations/` accepts `q`, `city`, `vegetarian`, `budget` and `max_prep` (plus the shared discovery filters). Open/approved restaurant availability, explicit food-type exclusions, diet and per-dish budgets are enforced before Gemini ranks known IDs. Common English phrases such as “veg pizza under 250” are recognised; the controls remain important for precise preferences. Explanations are generated from menu facts, not unchecked model claims. Responses are deduplicated, cached for five minutes and limited to six recommendations. Timeouts/provider errors/missing keys return labelled menu matches. The endpoint is throttled. Three real browser scenarios passed against Gemini 3.5 Flash-Lite on 22 September 2026; 2.5 Flash-Lite rejected new-user requests on this Google project. Model names/diagnostics remain in the API and test report, not the customer UI.

## Location selection (no IP-based delivery guesses)

The customer selector no longer offers or calls approximate network location.
It uses device GPS/map pins, owned saved addresses or full manual address entry
(also available to guests). Manual city selection is labelled browsing only,
not a delivery address. The legacy optional IPinfo API remains for compatibility
but is not part of the current customer location flow. Provider secrets must
stay server-side; rotate credentials shared in chat.

## Delivery address map and autofill

The header and shared address form support opt-in device GPS, a movable map pin,
zoom/expand, and explicit address confirmation. A customer then reviews flat,
floor/landmark and postal details before saving through the existing address API.
Saved selection is shared between the header and checkout; signing out clears
precise address details from browser selection. Editing addresses does not alter
past order snapshots. IPinfo is only a city hint, not a street-address lookup.

### Optional Google address lookup

The Google address renderer and server-side Geocoding adapter are implemented,
but require **two different keys** in the backend environment:

- `GOOGLE_MAPS_SERVER_API_KEY`: restrict to Geocoding API and Routes API; never expose it to
  browser code. Apply server/network restrictions appropriate to your hosting.
- `GOOGLE_MAPS_BROWSER_API_KEY`: restrict to Maps JavaScript API and your website
  referrers (`http://localhost:5173/*`, `http://127.0.0.1:5173/*`, and your deployed
  HTTPS origin). This public browser key is intentionally returned to the client.

Enable billing and set quotas in the Google Cloud project. Budget alerts alone
do not cap spending. Restart Django after updating local environment variables.
Both keys must be present and different before the address map/lookup switches
to Google. Without that pair, the existing LocationIQ/OpenStreetMap flow remains.
The rider map also switches to Google. Owned-order road routing uses Routes API
with the server key. Google results are never drawn on the fallback OSM map.
The reverse endpoint does not cache Google suggestions. Suggested house numbers
require a non-partial rooftop-level result and remain editable; interpolated
numbers, missing flats and floors are not invented. Google map branding and the
manual form's attribution are retained. No Places autocomplete is implemented
by this increment, even if Places API is enabled in your project.

`npm run test:address-google` uses mocked Google interfaces/results for UI and
error handling. `npm run test:address-location:live` exercises the configured
real provider and renderer at a public landmark. A real Google browser-key test
is still required before claiming the Google map works on your deployed origin.

For reverse geocoding, provision **server-side** `LOCATIONIQ_API_KEY` and optional
`LOCATIONIQ_REGION=us1` (`eu1` is also supported). On Vercel, add the credential to
Production environment settings and redeploy; locally set it in ignored
`backend/.env` and restart Django. Do not send a real key in chat, put it in
`VITE_*`, or reuse Gemini/IPinfo credentials. Verify quota, permitted origins/IPs
and provider terms for the selected plan before production activation.

`POST /api/v1/location/reverse/` accepts six-decimal `latitude`, `longitude` and
`consent: true`. It returns normalized street/locality fields without provider
centroids or credentials. It does not save an address. Lookups have an eight-second
provider timeout, ten-per-minute application throttle and 24-hour coordinate-hash
cache. Dragging does not call the provider; explicitly choose **Find address for
this pin**. There is no automatic public Nominatim or fabricated-address fallback.
Missing configuration/provider failures keep pin confirmation and manual entry
available. GPS cannot reliably identify a house entrance, flat or floor.

LocationIQ is now configured server-side locally and in Vercel Production.
`npm run test:address-location:live` passed against the local app using the real
provider at a controlled public-landmark GPS point, including address autofill,
flat editing, database save and reload. The same suite passed against the
production alias in public-only mode: real lookup, desktop/mobile map,
confirmation and browser persistence, without production business writes.
The separate `npm run test:address-location` suite
uses controlled provider fixtures for failure/race/permission scenarios. Neither
suite claims that GPS can identify a flat or that every address is serviceable.

If GPS returns permission denied, check both this site's browser permission and
the device's Location Services. On macOS, Google Chrome needs its own Location
Services toggle in addition to the browser's Allow setting. The picker offers
a short error, retry and manual entry, without OS-specific troubleshooting steps
or assuming which permission failed. Websites cannot bypass an OS denial. Guest manual addresses
persist across reload without needing GPS, and account addresses are cleared from
browser selection on sign-out.

Device acquisition uses a first-fix `watchPosition`, cleared on completion,
cancellation or timeout, with a 15-second application deadline even if a browser
extension never calls back. This avoids a broken one-shot wrapper found in Urban
VPN without disabling privacy controls. `npm run test:location-device` checks
these paths. All users confirm a pin then review editable delivery details;
unmapped streets and flat numbers are never guessed.

New-address forms require a separate house/flat/building entry and provide an
optional floor field. These are stored in the existing address lines together
with street/area and landmark, preserving API/order-snapshot compatibility.
Rider directions use saved pin coordinates when available, falling back to the
complete address only for legacy records without a pin. The custom vector marker
stays anchored at the map centre and honours reduced-motion preferences.

## Live rider location

An opted-in rider sends fresh device GPS at most once per second while the active
delivery page remains open. The customer map separately polls the owned-order
`GET /orders/{id}/live-location/` endpoint every second while visible. This is a
small authenticated read with no geocoding calls or full order history. Smooth
animation interpolates only between received fixes; it never predicts movement.
Pickup/completion/pause changes also trigger the main order view to refresh.

`GET /orders/{id}/rider-place/` separately uses LocationIQ to label the nearby
street/locality, with a 30-second cache/lookup cadence. Old or distant labels
are hidden. Provider failures never block the GPS channel. A fix older than
15 seconds is labelled last-shared, and ended/paused deliveries stop revealing
current coordinates. Guests and unrelated customers/couriers cannot access
either endpoint. Serverless workers need a shared cache/streaming architecture
and capacity testing before claiming large-scale realtime guarantees.

`npm run test:rider-location` exercises real local browser GPS writes, customer
polling, real provider street lookup, stale/stopped/finished cases and responsive
maps using an exact temporary fixture at public-landmark coordinates. It does not
track a real person or create production orders. Millisecond GPS/network accuracy
is not possible; actual update speed depends on hardware, connection and hosting.

## Payments

COD works without external credentials. Online checkout is offered only when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are present. Start with Razorpay **test** keys. Set `RAZORPAY_WEBHOOK_SECRET` and configure the provider's `payment.captured` webhook to:

```text
https://your-api-host/api/v1/online-payments/webhook/
```

Payment amounts come from the backend. Online orders stay `awaiting_payment` and outside the kitchen queue until capture is verified. A customer can retry a dismissed checkout from tracking. Browser signatures, provider capture, webhook signatures and duplicate delivery are handled server-side.

Online orders expire after 15 unpaid minutes and release reserved inventory. Late captures open reconciliation rather than restarting cancelled orders. Admin-reviewed Razorpay refunds target the original payment, with verified partial/full completion and timeout reconciliation. Configure `refund.processed` and `refund.failed` on the same signed webhook endpoint. A support conversation/refund approval is not an executed refund. History/tracking expose status-checked cancellation with explicit reasons. Admin → Order policy controls the checkout-snapshotted cutoff and opt-in automatic prepaid refunds; the default remains before acceptance with prepaid support review. Cooking and later stages always block self-cancellation. Kitchen issues can pause fulfilment; a separate admin action resumes or cancels with an explicit full original-method refund approval, followed by separate provider submission. Cash payouts and live provider certification remain outstanding. See [CHECKOUT_SUPPORT_RUNBOOK.md](CHECKOUT_SUPPORT_RUNBOOK.md).

## Validation

```sh
npm run check
cd backend
../.venv/bin/python manage.py test api.tests api.test_product api.test_intelligence api.test_menu_operations api.test_tracking_feedback api.test_assistant_recovery api.test_checkout_support api.test_cancellations api.test_support_operations api.test_dashboards api.test_delivery_chat api.test_admin_access --noinput
../.venv/bin/python manage.py makemigrations --check --dry-run
```

Run tests from `backend/` as shown: the top-level serverless `api/` folder can otherwise shadow the Django test module and find zero tests.

With the isolated preview services running and Chrome installed:

```sh
npm run test:product
npm run test:visual
npm run test:experience
npm run test:notifications
npm run test:updates
npm run test:menu
npm run test:ai:live
npm run test:api-retry
npm run test:checkout-support
npm run test:cancellations
npm run test:support-conversation
npm run test:dashboard-chat
npm run test:admin-access
npm run test:dashboard-queues
```

Browser scripts target only `127.0.0.1:5173`, use the documented local fixture password, and create preview orders/tickets. Product-test reviews carry a unique automated-test marker and are deleted immediately after assertions, with a `finally` cleanup on failure; forced process termination or API downtime can still prevent cleanup. Never treat test data as customer testimonials. Change the script fixture password if you choose a different seed password. Do not point them at production. Screenshots are written to `/private/tmp/ruchigo-product-*.png`.

Run the browser suites sequentially: they share local fixture accounts and normal API rate limits. Rapidly running all suites back-to-back may require waiting for the configured rate-limit window; do not disable production throttling to make tests pass.

New flows: `/search` combines price/rating/preparation/veg/cuisine/offer filters and opt-in nearby filtering; `/for-you` exposes recommendations; `/profile` → Change photo uploads/removes a persistent avatar. Restaurant → Your menu → Edit configures optional add-ons. Home/discovery dishes open the restaurant menu before ordering. Selected extras are carried through server pricing, cart, order history and the kitchen ticket. Automatic activity appears in the shared bell, modern toast and `/notifications` inbox.

Validation on 22 September 2026: **137 backend tests passed**, frontend lint/production build passed and migration drift check was clean. The expanded checks cover preferences/privacy, chat, groups, stock, hours, owned GPS timestamps and editable reviews. Earlier public/legal, avatar, notification, image and retry suites plus new live-AI/customer/kitchen/courier/admin checks are documented in [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md). These are functional checks, not load tests, accessibility certification or proof of production readiness.

Privacy and Terms are explicitly preview drafts until operator details and policies are confirmed. Read [LEGAL_RELEASE_CHECKLIST.md](LEGAL_RELEASE_CHECKLIST.md) before publication. The activity log and review moderation are at `/admin-activity` and `/admin-reviews`; moderation requires a reason and recalculates the public rating. Customer, restaurant and partner account pages preserve the original RuchiGo branding.

## Source map

- `src/product.css`, `src/components/product/`: shared visual system and interaction primitives.
- `src/pages/Home.jsx`, `Search.jsx`, `CatalogPages.jsx`, `CheckoutPages.jsx`, `OrderPages.jsx`, `AccountPages.jsx`: active customer journeys.
- `RestaurantWorkspace.jsx`, `DeliveryWorkspace.jsx`, `PromotionWorkspace.jsx`, `admin/LiveAdminPages.jsx`: operations.
- `backend/api/product_views.py`, `recommendations.py`, `payments.py`: discovery, support, recommendations and payments.
- `backend/api/migrations/0004_*`, `0005_*`: product schema additions.
- `backend/api/test_product.py`, `scripts/product-e2e.mjs`: product regression checks.

Old unused screens remain in source to preserve existing work. `src/App.jsx` defines the active routes. There is an older project copy outside this directory; use this directory as the hosting root, not the outer copy.

## Images and performance

Routes are lazy-loaded. The main product uses 720px-or-smaller local WebP imagery, lazy image loading, debounced discovery queries and visibility-aware polling. Regenerate local WebP assets with `.venv/bin/python scripts/optimize-images.py`.

Fallback imagery is illustrative; restaurant-uploaded photos should replace it. Added stock sources:

- Pizza: https://images.unsplash.com/photo-1513104890138-7c749659a591
- Burger: https://images.unsplash.com/photo-1568901346375-23c9450c58cd
- Curry: https://images.unsplash.com/photo-1631452180519-c014fe946bc7
- Rice: https://images.unsplash.com/photo-1512058564366-18510be2db19
- Biryani: https://images.unsplash.com/photo-1589302168068-964664d93dc0
- Iced coffee: https://images.unsplash.com/photo-1461023058943-07fcbe16d735
- Veg thali: https://images.unsplash.com/photo-1546833999-b9f581a1996d

The category rail uses matching real food photos instead of emojis. Its seven 320px WebP crops are generated into `public/categories/` by the same optimization script.

Other optimized photos derive from the existing local preview assets. Review all asset rights and real-menu accuracy before launch.

## Production

### Delivery preview and Google rider tracking

Open **/demo/delivery** locally or on the deployed site and select **Watch delivery**. The
50-second replay automatically accepts, prepares, assigns, picks up and delivers
a sample meal. No login or manual role switching is needed. It never creates or
changes an order, payment, rating or delivery assignment. Real orders remain
dependent on real kitchen/courier activity.

The preview fetches two real Google road legs between fixed public example pins:
partner acceptance location → kitchen, then kitchen → sample doorstep. No real
order or device location is involved. Route geometry, distances and travel
durations are fetched for each page session, not hardcoded. The 50-second timeline
is intentionally accelerated; its displayed estimates exclude live traffic.
If routing fails, the preview shows retry rather than inventing a road path.

Actual orders use `/orders/:id/live-location/` for one-second GPS reads and a
separate owned `/orders/:id/road-route/` request every 30 seconds while GPS is
fresh. Pickup routing targets the restaurant; delivery routing uses the order's
address snapshot. No route is requested for stale, inactive or paused deliveries.
The scooter interpolates only received fresh GPS samples, matching to the shown
road within 25 metres; off-route GPS is not pulled across buildings. GPS accuracy
is device-dependent. Estimates are driving-road estimates without live traffic,
not two-wheeler optimization, exact arrival promises, or recorded travel history.
Google route results are not stored in the application cache/database. Native
map attribution, expand/recenter, zoom and reduced-motion support are retained.

Run `npm run test:delivery-google` for actual Google desktop/mobile demo acceptance
and `npm run test:rider-location` for local opt-in courier writes, owned GPS reads,
route estimates, stale state and completion. `test:delivery-demo` retains the OSM
fallback checks with explicit fixtures. See [tracking notes](TRACKING_DESIGN_NOTES.md).

Release `8220e3e` (People, logo loading and non-veg conversation) followed `28a191e` on `prasanti25/runchigoo` main and was manually deployed at https://runchigoo.vercel.app. Its actual-provider production chat test passed. Vercel's Git link remains connected to a different repository; align it before relying on automatic deployments. Production migrations through 0022 were applied after an isolated backup/restore rehearsal, preserving existing users/orders and other pre-existing application rows.

Coupon/savings release `e7ae89c` is now deployed on the same alias, with live read-only checks and the real-Gemini regression passing. The People-directory, logo loading, food-conversation and coupon fixes require no new migration. Never point local fixture scripts at production. Before a public paid launch, complete the blockers in [PRODUCT_STATUS.md](PRODUCT_STATUS.md), configure durable media, shared cache, transactional email and production payment/refund/reconciliation operations, then verify backups and concurrency/load/security behavior.

## Feature coverage

All 300 requested entries, including partial/missing/provider-dependent work, are tracked in [FEATURE_MATRIX.md](FEATURE_MATRIX.md). Do not count unused legacy mock dashboards as implemented features.

## Coupons and spend-to-unlock savings

Cart and checkout have a searchable coupon drawer, available/unavailable cards,
minimum-spend guidance, clear restrictions and a confirmation-only celebration.
`GET /api/v1/cart/savings/` is customer-only, paginated and private/no-store.
Discovery, application and checkout share coupon eligibility and rounded amounts.
Bag changes revalidate a selected coupon; dropping below its minimum removes it.
Replacement coupons never stack. Applying does not reserve a redemption.

Delivery progress uses the checkout serviceability rules for an owned address.
The cart's default-address result is labelled an estimate; checkout uses the
selected address. Overlapping zones account for their own minimum orders and
free-delivery thresholds. No configured free-delivery threshold means no invented
unlock promise. The existing fallback remains ₹40 below ₹500; this release does
not approve new fees or create ₹80/₹150 production campaigns.

Manage campaigns in Admin → Offers & coupons, and delivery thresholds in enabled
delivery zones. These values remain database-backed; selected coupon UI state is
temporary and checkout is always authoritative. `npm run test:coupon-savings`
uses an isolated local customer/cart and exact temporary coupons, checks
desktop/mobile, expiry, replacement, live revalidation and reduced-motion, then
deletes those fixtures. It never places an order or consumes a coupon redemption.

## Intelligence and personalisation details

- `/for-you?tab=chat`: follow-up food assistant, grounded support guidance and explicit restaurant-menu handoff.
- Non-vegetarian requests and follow-up corrections retain the dish, diet and budget; unavailable food is not replaced by unrelated items. Known constraints are enforced before Gemini ranks eligible menu IDs. `npm run test:food-constraints:live` exercises the actual provider without business writes; set `RUCHIGO_SMOKE_URL=https://runchigoo.vercel.app` only for the explicitly allowlisted anonymous production smoke.
- `npm run test:people-loading` verifies local account-directory actions, 320–1440px layouts, original-logo loading on genuinely pending requests/chunks and reduced-motion support. It is local-only and removes its exact temporary account; audit entries remain.
- Empty assistant shortlists explain city/price/menu limitations. Browsing another city's menu requires an explicit action and never changes the delivery address. Named dishes such as butter chicken are not substituted with unrelated chicken dishes. `npm run test:assistant-recovery` replays the reported Delhi/pizza scenario on desktop/mobile against the actual catalog/provider.
- `/for-you`: desktop photo-led feed with a side-by-side conversational composer; `/for-you?tab=quick` keeps detailed recommendation filters.
- Home: real-menu auto-sliding hero, small navigation dots (no playback toolbar), reduced-motion support and a dismissible delivered-meal review reminder.
- Login/register: four bundled food photos crossfade automatically. Auth and hero/feed imagery advance at 3.5 seconds; form fields stay intact.
- Tracking: lazy-loaded map with original RuchiGo scooter marker, real received GPS interpolation and accurate freshness; delivered-order rating/feedback create and edit.
- `/support?order=ID`: own-order help; `/support?order=ID&compose=1` opens issue intake. `/support?ticket=ID` is one persistent conversation with factual assistance, real-request typing, team handoff, staff replies, refund status and feedback. It does not perform financial/order actions from free text.
- `npm run test:desktop`: desktop layout/carousel/chat and responsive/reduced-motion checks. See [tracking research and configuration](TRACKING_DESIGN_NOTES.md) for public map settings and limitations.
- `/for-you?tab=taste`: saved food preferences and order-history opt-out.
- `/for-you?tab=picks`: personalized restaurants/coupons, saved kitchens, recent visits and previously ordered dishes.
- Home, search, quick picks and chat: integrated microphone icon where browser speech is supported. No listening popup; voice never places an order.
- Restaurant/admin analytics: real scoped metrics, public-review sentiment, historical forecast baselines and admin-only risk-review signals. Baselines/rules are not trained AI forecasts or proof of fraud.

Verify locally:

```sh
DJANGO_SQLITE_PATH=/private/tmp/ruchigo-product-preview.sqlite3 .venv/bin/python backend/manage.py migrate --noinput
DJANGO_SQLITE_PATH=/private/tmp/ruchigo-product-preview.sqlite3 .venv/bin/python backend/manage.py test api.tests api.test_product api.test_intelligence api.test_menu_operations --noinput
npm run test:intelligence
npm run test:menu-operations
```

The intelligence browser suite uses real local APIs and configured Gemini. It simulates Web Speech events to test microphone UI and text handling; actual recognition quality needs a supported browser/device/microphone. It restores fixture preferences/saved-state, creates no orders/reviews, and may update fixture browsing history. Restart a backend launched with `--noreload` after Python changes.
