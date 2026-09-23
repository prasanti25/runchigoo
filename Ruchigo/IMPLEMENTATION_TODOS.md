# RuchiGo delivery and commerce implementation todos

Requested 23 September 2026. This is the active execution checklist for the six sections in the latest request. Checked entries are implemented within the stated scope, covered by the backend regression and linked UI evidence. Unchanged screens retain prior browser evidence; this increment does not re-certify every page or commercial operation. Partial/provider-gated/missing entries remain open. No claim of Swiggy/Zomato parity.

## Execution batches

### Partner dashboard UI follow-up

- [x] Consistent desktop rail, role-scoped command search and mobile navigation.
- [x] All seven restaurant routes and all five delivery routes redesigned.
- [x] Settings, notifications and partner support covered for both roles.
- [x] Forms/dialogs, add-ons, coupons, payment filters and delivery-state checks.
- [x] Responsive partner/admin regression, shared mobile navigation, 100 targeted
  backend tests and isolated merchant/rider/finance workflow verification.

Scope and page-by-page evidence: [PARTNER_WORKSPACES.md](PARTNER_WORKSPACES.md).
The earlier commercial-feature tasks below remain independently tracked.

### Earlier commerce batches

- [x] A. Location-aware discovery: selected doorstep shared by home/search/recommendations; nearby radius and sorting; discovery/checkout zone parity; honest unknown-location states; cross-city and multi-zone regression.
- [ ] B. Analytics: customer spending/favourites/monthly frequency; restaurant retention/sales/cancellations; admin delivery collections/refunds/active customers/cities; explicit metric definitions, role isolation and date filters.
- [ ] C. Cart and fulfilment: scheduling with merchant hours, inventory reservation/release, kitchen due queue and durable dispatch; explicit rider tips in signed totals; existing cancellation/refund regressions.
- [x] D. Offers: restaurant coupon ownership, campaign types, applied-offer linkage, free-delivery/BOGO engine, eligibility and concurrent redemption.
- [x] E. Promotional loyalty: locked account balances, append-only service ledger, earn/reverse/redeem, tiers, referrals, cashback, anti-self-referral/cycle/duplicate rewards; disabled until business-approved rules. Stored-money wallets remain out of scope and #54 stays partial.
- [ ] F. Partner/admin operations: private document submission/review/expiry, city/service-area configuration, commission snapshots, settlement ledger/reconciliation and operational audit coverage.
- [x] G. Regression for this increment: complete backend suite, relevant local customer/restaurant/admin/rider journeys, 320/390/desktop, migration rehearsal, credentials scan, documented local-only release state. Re-run after each remaining batch.

## Policy/provider boundaries

Build configuration and safe workflows now. Do not invent or activate live commission percentages, cashback/points conversion, surge multipliers, payout schedules, refund eligibility or KYC approval rules. No real transfer, identity verification or payment success is simulated. Gateway credentials/certification, private durable document storage, scheduled workers and business approvals are explicit activation prerequisites. Existing live customer records and policies must be preserved.

## Feature-by-feature work queue

The current-status column is synchronized with FEATURE_MATRIX.md. A checked box means scoped implementation, not launch approval, load certification or provider operation.

| Task | ID | Feature | Current status | Acceptance / remaining work |
| --- | --- | --- | --- | --- |
| [x] | 47 | Add to cart | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 48 | Remove from cart | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 49 | Update quantity | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 50 | Food customization | Implemented | Required/optional groups, single-choice radio controls and priced extras. Selections are revalidated at checkout. |
| [x] | 51 | Apply coupon | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 52 | Apply restaurant offer | Implemented | Restaurant offer banners link to an owned redeemable coupon, matching scope/date window; checkout applies the actual rule and snapshots it. |
| [x] | 53 | Loyalty points redemption | Implemented | Signed checkout redemption from a locked account ledger; food-only cap after coupons, no fees/tips; cancellation/confirmed-refund restoration and replay protection. |
| [ ] | 54 | Wallet balance | Partial | Database-backed promotional credit balance and history. Not a stored-money wallet: deposits, withdrawals, transfers and bank-wallet provider integration are not implemented. |
| [x] | 55 | Delivery instructions | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 56 | Schedule order | Partial | Merchant-opt-in scheduled preparation start, explicit hours/notice/horizon, signed quote, stock reservation, due-state kitchen guard and cancellation release. Arrival slots, capacity and durable reminder workers remain pending. |
| [ ] | 57 | Tip delivery partner | Partial | Admin-opt-in cash-on-delivery tips in signed totals and rider collection details. Disabled by default; online tip payout/earnings ledger is not implemented. |
| [x] | 58 | Contactless delivery | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 59 | Order confirmation | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 60 | Order cancellation | Partial | History/tracking meal summary, explicit reason/confirmation, locked cooking cutoff, snapshotted policy and opt-in prepaid refunds. Kitchen issue/hold and separate admin cancellation/full-refund approval now work. Collected-cash exceptions, approved commercial policy and live provider certification remain required. |
| [ ] | 61 | Refund management | Partial | Order-linked reviews, admin decisions, original-method Razorpay adapter, signed callbacks/reconciliation, policy-authorized self-cancellation refunds and explicit staff cancellation approval. Live certification and cash payouts remain outstanding. |
| [x] | 86 | Restaurant registration | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 87 | Restaurant login | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 88 | Restaurant verification | Partial | Account / restaurant approval, not document verification. |
| [ ] | 89 | Restaurant license submission | Missing | Not implemented in the active product. |
| [ ] | 90 | Food safety certificate submission | Missing | Not implemented in the active product. |
| [x] | 91 | Restaurant profile management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 92 | Menu management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 93 | Food-item management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 94 | Category management | Implemented | Restaurants assign existing categories; full category creation/edit/activation is in the scoped admin catalog workspace. |
| [x] | 95 | Pricing management | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 96 | Inventory management | Partial | Tracked portions, checkout locks, configuration checks, audited adjustments, one-time restock and 15-minute unpaid expiry. Production expiry scheduler, external sync and stock-by-variant remain outstanding. |
| [x] | 97 | Stock availability | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 98 | Accept / reject orders | Partial | Kitchen transitions; comprehensive rejection policy absent. |
| [x] | 99 | Order preparation status | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 100 | Estimated preparation time | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 101 | Offers management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 102 | Coupon management | Implemented | Approved restaurants create/edit/deactivate their own coupons; admin manages platform campaigns. Ownership, audits and history-protected deletion. |
| [x] | 103 | Restaurant analytics | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 104 | Sales reports | Partial | Date-filtered reports, exact daily table and CSV; not settlement or bank accounting. |
| [x] | 105 | Customer reviews | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 106 | Rating management | Partial | Calculated verified-order ratings, not merchant-editable scores. |
| [x] | 107 | Restaurant earnings | Implemented | Owner-scoped pre-tax food earnings less snapshotted commission, confirmed-refund adjustments and external settlement records. Legacy coverage is explicit; not bank statements or automated payouts. |
| [x] | 108 | Settlement tracking | Implemented | Finance-confirmed external payment records, normalized unique references, idempotency/revision checks, balance locking and append-only corrections. Recording does not transfer money. |
| [x] | 109 | Peak-hour analytics | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 110 | Best-selling food analytics | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 136 | Admin login | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 137 | Role-based admin access | Implemented | Superuser-managed workspace grants, API enforcement across routed viewsets, least-privilege new administrators, revision checks, audited changes and scoped inboxes. Existing admins retain legacy authority until reviewed. |
| [x] | 138 | Customer management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 139 | Restaurant management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 140 | Delivery partner management | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 141 | KYC verification | Missing | Not implemented in the active product. |
| [x] | 142 | Restaurant approval / rejection | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 143 | Delivery partner approval / rejection | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 144 | Food category management | Implemented | Scoped admin catalog editor for category creation/edit/activation; restaurant menu category assignment. |
| [x] | 145 | City management | Implemented | Audited city pause/reopen with normalized aliases, revision checks, catalog/discovery/checkout enforcement and preserved active orders. No destructive city renaming or migration of existing addresses. |
| [x] | 146 | Service-area management | Implemented | Audited admin creation/edit/activation of circular service areas; explicit policy enablement. |
| [x] | 147 | Delivery-zone management | Implemented | Admin workspace, radius/trip limits, base/per-km pricing, minimum subtotal and free-delivery threshold. No polygon or traffic-based zones. |
| [x] | 148 | Commission management | Implemented | Disabled-by-default, revisioned food-only rate; finance and policy scopes, reason and explicit funding-convention approval. New-order snapshots only; no silent backfill. |
| [x] | 149 | Coupon management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 150 | Offer management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 151 | Order management | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 152 | Payment management | Partial | Payment ledger, refund review queue, partial/full refunds and pending-provider reconciliation. Settlement accounting and live provider acceptance remain outstanding. |
| [ ] | 153 | Refund management | Partial | Admin review, capped approval, explicit provider submission, original-method processing, timeout reconciliation and signed refund callbacks. Live certification/cash payout policy outstanding. |
| [x] | 154 | Complaint management | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 155 | Review moderation | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 156 | User blocking / unblocking | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 157 | Restaurant blocking / unblocking | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 158 | Delivery partner blocking / unblocking | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 159 | Notifications | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 160 | System settings | Partial | Account settings and revision-checked delivery policy; broader platform policy administration outstanding. |
| [ ] | 161 | Audit logs | Partial | Includes account changes and admin grants, fulfilment and financial events; comprehensive access/export/configuration audit coverage remains pending. |
| [x] | 162 | Promo codes | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 163 | Restaurant-specific coupons | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 164 | New-user offers | Implemented | Explicit first-order campaign type enforces first non-cancelled order eligibility. No separate signup-age segmentation. |
| [x] | 165 | First-order discount | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 166 | Festival offers | Implemented | Named festival campaigns with dated validity, usage controls and actual coupon benefits; no automatically invented festival discounts. |
| [x] | 167 | Referral rewards | Implemented | Referral binding before first order; no self-referral/cycles; one qualifying delivered/paid order rewards both accounts, with refund reversals and concurrent qualification protection. Policy disabled by default. |
| [x] | 168 | Loyalty points | Implemented | Order-snapshotted earn rules, locked balances, append-only service ledger, delivered/collected-payment eligibility, refund adjustments and idempotent reconciliation. |
| [x] | 169 | Loyalty levels | Implemented | Admin-configured level names and increasing net-earned-point thresholds; customer progress display. Recognition only, not unconfigured tier perks. |
| [x] | 170 | Reward redemption | Implemented | Points and promotional credits share an explicit food-only redemption cap; server-signed bill, locked checkout debit, cancellation return and proportional confirmed-refund adjustments. |
| [x] | 171 | Cashback | Implemented | Capped cashback as promotional RuchiGo credits after paid delivery, recalculated on confirmed refunds. No cash transfer or withdrawal; approved policy required. |
| [x] | 172 | Free-delivery offers | Implemented | Platform-managed free-delivery coupon waives only the quoted serviceable delivery fee. Already-free orders cannot waste redemption; UI hides contradictory spend-more prompts. |
| [x] | 173 | Buy-one-get-one offers | Implemented | Restaurant-owned single-dish BOGO; both portions must be in the cart, configurable free-portion cap, base price only, extras charged, stock and concurrent redemption checked. |
| [x] | 174 | Personalized offers | Implemented | Ranks eligible coupons using account history / saved kitchens; never creates discounts. |
| [x] | 209 | GPS location | Implemented | Foreground browser location permission. |
| [x] | 210 | Google Maps integration | Implemented | Configured Google Maps SDK for address selection and live rider display; actual provider road routes, user controls and attribution. Not a guarantee of GPS accuracy or exact ETA. |
| [x] | 211 | Address autocomplete | Implemented | Debounced Google forward address suggestions with keyboard selection, map pin and address autofill. Uses Geocoding, not Places Autocomplete; flat/floor remain user-confirmed. |
| [x] | 212 | Delivery radius | Implemented | Admin-set zone radius and maximum kitchen-to-customer distance checked against saved pins; straight-line basis. |
| [x] | 213 | Delivery zones | Implemented | Multiple active circular zones, cheapest eligible overlap, missing-pin/out-of-zone checkout rejection when explicitly enabled. |
| [ ] | 214 | Distance calculation | Partial | Straight-line discovery/fee distance plus configured provider road-route display. No traffic-aware fee basis or multi-stop optimizer. |
| [x] | 215 | Delivery-fee calculation | Implemented | Server-authoritative base plus extra-distance fee, free threshold, minimum subtotal and signed 10-minute quotes; no silent stale-price acceptance. |
| [ ] | 216 | Surge pricing | Partial | Audited fixed temporary demand-fee windows, expiring within 24 hours; no stacking, cheapest final eligible zone, signed quotes and preserved free-delivery benefits. Automatic demand-triggered surge is not implemented. |
| [x] | 217 | Peak-hour pricing | Implemented | Opt-in weekday/India-time peak-fee schedules within finite date windows; explicit checkout disclosure, revision checks, no stacking and original order snapshots preserved. |
| [ ] | 218 | Route optimization | Missing | Not implemented in the active product. |
| [x] | 219 | Multiple service areas | Implemented | Multiple administrable circular zones across city-labelled service areas; baseline same-city check always enforced. |
| [x] | 220 | Location-based restaurant filtering | Implemented | Selected city/pin drives home, search, feed and recommendations; default 5 km browsing, 2/5/10 km controls, nearest sorting and checkout-zone parity before pagination. |
| [x] | 221 | Customer total orders | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 222 | Customer total spending | Implemented | Owner-scoped collected payments minus confirmed refunds; excludes unpaid orders, supports legacy full refunds. Grouped by order date, not a bank statement. |
| [x] | 223 | Favorite restaurants | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 224 | Favorite food | Implemented | Explicitly saved dishes. |
| [x] | 225 | Monthly spending | Implemented | Twelve calendar-month spending/order rows including zero months, with selected-period and lifetime profile summaries. |
| [x] | 226 | Customer loyalty points | Implemented | Customer profile/rewards pages read owned ledger-backed points, credit balance, levels and paginated activity; no invented balance. |
| [x] | 227 | Order frequency | Implemented | Owner-scoped period counts and orders/week; month, 30-day and 90-day UI controls and validated date windows. |
| [x] | 228 | Restaurant total sales | Implemented | Ledger-backed merchant food sales for delivered/collected snapshotted orders, net of merchant discounts and proportional confirmed refunds. Pre-tax; legacy/unreconciled coverage shown separately. |
| [x] | 229 | Restaurant total orders | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 230 | Average order value | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 231 | Best-selling items | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 232 | Customer retention | Implemented | Previous equal-period completed-order cohort retention with numerator/denominator, zero-cohort handling and restaurant scope isolation. |
| [x] | 233 | Cancellation rate | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 234 | Revenue trends | Partial | Date-filtered daily gross completed-order value chart, exact table and CSV. Not reconciled net restaurant revenue or settlement accounting. |
| [x] | 235 | Admin total users | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 236 | Admin total restaurants | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 237 | Admin total delivery partners | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 238 | Admin total orders | Implemented | Active implementation; see product status and verification boundaries. |
| [ ] | 239 | Gross revenue | Partial | Order value, not recognized platform revenue. |
| [x] | 240 | Platform commission | Implemented | Actual ledger commission in reports and finance UI, net of confirmed refunds, with explicit accounted-order coverage. Excludes delivery/tips; not profit or tax accounting. |
| [ ] | 241 | Delivery revenue | Partial | Explicit gross collected delivery fees on completed orders, separate from collected/refunded/net payments. Refund allocation, rider payouts and recognized delivery revenue remain pending. |
| [x] | 242 | Cancellation rate | Implemented | Active implementation; see product status and verification boundaries. |
| [x] | 243 | Refund amount | Implemented | Admin API/UI sum verified processed refund amounts, including partial refunds, separately from requested/approved amounts. |
| [ ] | 244 | Active users | Partial | Enabled accounts clearly labelled; separate distinct ordering customers over 30 days. Not general session/engagement-based active users. |
| [x] | 245 | Order growth | Implemented | Selected date window versus equal preceding window, with absolute counts and growth percentage; no percentage invented when the preceding count is zero. |
| [x] | 246 | City-wise performance | Implemented | Completed-order count/value by city in role-scoped analytics. |

## Current scope summary

- Implemented: **93** requested entries.
- Missing: **4** requested entries.
- Partial: **20** requested entries.

Implemented this increment: shared location/zone discovery, forward address suggestions, customer and expanded business analytics, merchant coupon management, linked offer campaigns, BOGO, fee-waiver coupons, scheduled preparation and optional cash tips. The latter two remain partial because arrival-capacity scheduling/workers and online tip payout accounting are not implemented.

Follow-up implemented: promotional rewards/credits, referral binding and one-time qualification, configured levels, capped cashback, signed redemption and lifecycle reconciliation; audited city pause/reopen; scheduled peak fees and explicit short-lived manual demand fees. Monetary wallets and automatically demand-triggered surge remain partial rather than being counted as complete.

Merchant finance follow-up: approved commission snapshots, refund-adjusted food earnings, an append-only merchant ledger and finance-confirmed external settlement tracking now connect the restaurant and admin UI. No bank transfers, tax/withholding accounting or historical backfill are performed. Accounting and settlement recording remain off in the shared preview.

Admin personal shopping now has real checkout, owned history/cancellation/reviews/chat/ETA and personal notifications, without inheriting kitchen/courier authority or exposing the operations queue. Desktop/mobile overview, finance tabs, payment cards and scoped mobile navigation were also refined.

**Still open:** private KYC/license/FSSAI submission and review; automated provider payouts/tax accounting; automatic surge, route optimization; arrival capacity/durable scheduling and inventory workers; online tips, broader audit, true activity metrics and live provider/operations approval. These are missing implementation or validation, not just missing API keys. All remaining 24 partial/missing entries are still tracked above; the request is not complete.

## Verification log

- Latest merchant-finance/admin-shopping/UI increment: **469 PostgreSQL tests pass** (888.9s, ten real threaded races), plus 39 targeted permission/intelligence tests and final successful `test:merchant-finance` / `test:dashboard-queues` browser runs. Admin overview, mobile navigation, collapsed filters, payments, restaurant earnings, settlement correction and personal admin checkout/cancellation verified at 1440/390/320px, with no browser/API errors in the isolated suite. Shared orders 16/37 unchanged, migration 0027 rehearsed against historical data, policies off. Runtime `a2ffa26` is now committed and pushed to main; production migration/deployment remain pending. See VERIFICATION_REPORT.md for boundaries and prior failures corrected.
- Planning baseline: clean worktree at `94b08fb`. Prior support release is live; this checklist does not change its deployment.
- Local verification: 416 tests pass on isolated UTF-8 PostgreSQL, including three actual checkout races. Earlier 411-test SQLite suite passed. Lint/build, migration drift and whitespace checks pass.
- Browser suites pass: location-analytics (including scheduled checkout, BOGO and fee waiver), coupon-savings, dashboard-queues, checkout-city and rider-location. Three viewport widths, actual configured Google providers and no browser errors in final runs.
- Migrations 0023–0024 applied locally and rehearsed against an isolated PostgreSQL historical fixture. Existing amounts/stock/address/coupon usage preserved; policies default off. No production business writes or deployment.
- Detailed scope, failures corrected and remaining activation requirements: VERIFICATION_REPORT.md. This is not completion of batches B/C/F or the whole 117-feature request.
- Final follow-up: **445 PostgreSQL tests passed**, 472.2s, including six real commerce/reward races and the per-response city-query batching check. An additional 74-test pricing/rewards/checkout/location run passed. `npm run test:rewards` passes isolated real-backend UI flows at desktop/390/320px, including surcharge configuration and city pause/reopen. No browser errors. Final lint/build, migration-drift and whitespace checks pass.
- Migration 0025 (rewards) and 0026 (city/pricing) applied locally and rehearsed on the retained PostgreSQL historical fixture. Original amounts, status, address snapshots and stock were unchanged. New rewards policy and fee rules remain inactive on the shared preview.
- Local login repair: the requested support admin email did not exist in the local preview database. A local-only, non-superuser admin account was created with explicit full application access; actual login to `/admin-dashboard` passed. No production account or password was changed. Credentials are not recorded in this file.
