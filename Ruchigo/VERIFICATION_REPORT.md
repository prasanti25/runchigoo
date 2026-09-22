# Local product verification — 22 September 2026

Preview: http://localhost:5173. API: http://127.0.0.1:8000.
Isolated fixture database: `/private/tmp/ruchigo-product-preview.sqlite3`.

## Real provider checks

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

## Automated checks

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
