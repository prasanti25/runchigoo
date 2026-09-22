# RuchiGo

React 19 + Vite frontend, Django REST backend. Modern customer discovery/ordering and restaurant, delivery and admin workspaces. Recommendations use server-side Gemini Flash-Lite when configured, with a catalog fallback.

Read [PRODUCT_STATUS.md](PRODUCT_STATUS.md) for the feature comparison, launch limitations and next-release priorities. This is a tested local product foundation, not a finished 300-feature platform.

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

## Approximate IP city suggestions

Set `IPINFO_TOKEN` in the **backend** environment. The location modal offers GPS, manual city selection and an explicit optional network-city lookup. `GET /api/v1/location/approximate/` returns a city suggestion, never a token, raw IP or GPS coordinates. The user confirms an available service city before it is saved. Results are cached for 15 minutes; unavailable locations/providers keep manual selection available.

In local development, a loopback request is clearly labelled as the development server's public-network estimate. In production, only globally routable verified client addresses are used. If deploying behind a reverse proxy, configure `IPINFO_TRUSTED_PROXY_CIDRS` with **only your actual trusted proxy ranges** and verify forwarding; arbitrary forwarded headers are ignored. Do not configure all internet addresses as trusted. Never put provider secrets in `VITE_*` variables. Rotate keys shared in chat before production.

## Payments

COD works without external credentials. Online checkout is offered only when `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are present. Start with Razorpay **test** keys. Set `RAZORPAY_WEBHOOK_SECRET` and configure the provider's `payment.captured` webhook to:

```text
https://your-api-host/api/v1/online-payments/webhook/
```

Payment amounts come from the backend. Online orders stay `awaiting_payment` and outside the kitchen queue until capture is verified. A customer can retry a dismissed checkout from tracking. Browser signatures, provider capture, webhook signatures and duplicate delivery are handled server-side.

Automated refunds, abandoned-payment expiry and full financial reconciliation are not implemented. Paid order cancellations currently require a refund workflow that must be completed before public online-payment launch. A support ticket is not an executed refund. Live provider behavior remains unverified without credentials.

## Validation

```sh
npm run check
cd backend
../.venv/bin/python manage.py test api.tests api.test_product --noinput
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
```

Browser scripts target only `127.0.0.1:5173`, use the documented local fixture password, and create preview orders/tickets. Product-test reviews carry a unique automated-test marker and are deleted immediately after assertions, with a `finally` cleanup on failure; forced process termination or API downtime can still prevent cleanup. Never treat test data as customer testimonials. Change the script fixture password if you choose a different seed password. Do not point them at production. Screenshots are written to `/private/tmp/ruchigo-product-*.png`.

Run the browser suites sequentially: they share local fixture accounts and normal API rate limits. Rapidly running all suites back-to-back may require waiting for the configured rate-limit window; do not disable production throttling to make tests pass.

New flows: `/search` combines price/rating/preparation/veg/cuisine/offer filters and opt-in nearby filtering; `/for-you` exposes recommendations; `/profile` → Change photo uploads/removes a persistent avatar. Restaurant → Your menu → Edit configures optional add-ons. Home/discovery dishes open the restaurant menu before ordering. Selected extras are carried through server pricing, cart, order history and the kitchen ticket. Automatic activity appears in the shared bell, modern toast and `/notifications` inbox.

Validation on 22 September 2026: **89 backend tests passed**, frontend lint/production build passed and migration drift check was clean. Live Gemini, nonsensical-input clarification, IPinfo, customer/kitchen/courier/admin flows, public/legal pages, profile-photo upload/removal, notifications, toasts, images, footer links, combined discovery filters and safe read retries are documented in [VERIFICATION_REPORT.md](VERIFICATION_REPORT.md). These are functional checks, not load tests, accessibility certification or proof of production readiness.

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

No deployment was performed. Before launch, complete the blockers in [PRODUCT_STATUS.md](PRODUCT_STATUS.md), configure a persistent database, shared cache, real transactional email, private secrets, HTTPS and image storage, validate backup/restore, and run concurrency/load/security checks. Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) as a historical checklist; this README and product-status document describe the new implementation and its current limitations.
