# Operational dashboards and delivery conversations

Local preview: http://localhost:5173. This is not a claim of Swiggy/Zomato parity.

## Dashboard routes

| Workspace | Route | Scope |
| --- | --- | --- |
| Admin orders | `/admin-orders` | `orders` |
| Accounts | `/admin-users` | `people` |
| Restaurant / rider management | `/admin-restaurants`, `/admin-delivery-partners` | `partners` |
| Partner sign-in access | `/admin-partner-accounts` | `partners`, partner-only records |
| Payment ledger / refund review | `/admin-payments` | `finance` |
| Analytics | `/admin-reports` | `reports` |
| Food categories | `/admin-catalog` | `catalog` |
| Offers / coupons | `/admin-offers` | `promotions` |
| Customer support | `/support` | `support` |
| Review moderation | `/admin-reviews` | `moderation` |
| Zones / cancellation policy | `/admin-delivery-zones`, `/admin-order-policy` | `policies` |
| Activity history | `/admin-activity` | `audit` |
| Team permissions | `/admin-access` | Superuser only |
| Restaurant reporting | `/restaurant-analytics`, `/restaurant-earnings` | Own restaurant only |
| Delivery messaging | `/tracking/ORDER?chat=1`, `/delivery-navigation?order=ORDER&chat=1` | Customer/current assigned courier only |

## Access delegation

Apply migrations through 0022 before running the updated app. Existing
administrators without an access-grant row keep their prior full access and
appear as needing review. This is deliberate backwards compatibility, not a
recommendation to leave everyone unrestricted. Only an existing superuser may
review or grant permissions; this pass does not elevate the preview admin.

New administrator accounts and promotions created through the account API start
with no operational scopes. Account/profile and notification access remain
available. The grant editor requires a reason and expected revision. A stale
save is rejected. Superuser authority cannot be changed there. Grants are
enforced at the API for subsequent requests; an already-started request may
finish. Navigation is refreshed on session/profile reload.

Support alone cannot approve/process refunds or change orders. Staff exception
cancellation requires both orders and finance scopes. Finance operators can
review refund requests directly in the Finance workspace without being granted
all support conversations. Partner delegates can only list/approve/block/restore
partner accounts, not read customers or grant administrators. Some compound
workflows need multiple explicitly assigned scopes.

All routed business viewsets have an additional scope check. The access editor
has its own stricter superuser permission. New endpoints must be added to the
scope map deliberately: unknown endpoints fail closed for restricted admins.
Authenticated responses use private/no-store caching and vary by Authorization.
Historical operational inbox entries are filtered using current scopes as well
as restricting future recipients.

## Reports and queues

People, order and payment totals are calculated on the server, not from a single
page of data. Order/payment filters are shared by the list and summary APIs.
Reversed or malformed date ranges are rejected. User account changes are audited
with changed-field names, not passwords or profile-field values.

Analytics accept inclusive `start`/`end` dates up to 90 days. Dates use the server
reporting timezone. Comparison uses an equally long immediately preceding
window; zero previous totals yield no percentage baseline. Reports group by the
date the order was placed and its current state, not a historical daily snapshot.
Gross value means delivered-order total including delivery fees after discounts,
not merchant net revenue. CSV exports contain aggregate daily values only.
The coming-week historical baseline always uses the last 28 complete days,
independent of a selected historical report window. It is not a trained model.

Next-step order controls require confirmation and a current-stage match. Cooking
orders cannot be rewound. Staff cancellation is a separate audited decision;
prepaid refund approval and actual provider submission remain separate actions.
Merely opening or filtering a refund queue does not transfer funds.

## Customer–courier conversations

Messages open after assignment and before completion/cancellation. They are
saved first, displayed as sent, and marked read only after an explicit client
read acknowledgement. UUID retries cannot duplicate a message/notification or
reuse a reference for different text. Both sides can reload their conversation.
The feed fetches 50 messages at a time and offers earlier history. The recipient
partnership is snapshotted so reassignment does not expose old messages to a new
courier. The restaurant and ordinary admin APIs cannot read the thread.

Only a generic notification is stored in the inbox, without the message body.
Messages do not invoke an AI provider, execute instructions, cancel orders or
change money. Terminal orders keep read-only history. This is foreground web
polling, not websocket/native background chat or a staffed response promise.
Retention, legal disclosure review and operational incident procedures are still
launch requirements. Couriers should message only when safely stopped.

## Verification

```sh
DJANGO_SQLITE_PATH=/private/tmp/ruchigo-product-preview.sqlite3 .venv/bin/python backend/manage.py test api.test_dashboards api.test_delivery_chat api.test_admin_access --noinput
npm run test:dashboard-chat
npm run test:admin-access
npm run test:dashboard-queues
npm run test:cancellations
npm run test:support-conversation
npm run test:product
npm run check
```

Browser suites are local-only fixtures. `test:dashboard-chat` creates a clearly
marked COD order, completes it, tests two-way chat, and removes only its temporary
account. `test:admin-access` seeds two temporary accounts in the explicit isolated
SQLite database, exercises actual permission edits/revocation, then removes those
exact accounts while retaining audit entries. Never run these scripts against a
shared production database. `test:dashboard-queues` reads existing records without
business mutations. Test order 16 is preserved, not advanced or restored.

## Still required before commercial operation

Approved commission/payout/incentive/refund/tax rules; payment/refund provider
certification; KYC/document handling; legal operator, retention and versioned
acceptance; PostgreSQL concurrency/load checks; deployment migrations and backups;
reliable jobs, monitoring and support staffing. Grocery, dining, wallet, loyalty,
subscriptions and other entries in FEATURE_MATRIX.md are not completed here.
