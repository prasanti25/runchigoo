# RuchiGo: numbered feature coverage

Updated 22 September 2026. This tracks **all 300 numbered entries** supplied by the user, including duplicates. Truncated labels have been normalized; #62 is explicitly inferred as UPI. These counts describe checklist coverage, **not 300 unique features, commercial readiness or Swiggy/Zomato parity**.

## Current implementation, including this local development pass

- Implemented: **145**
- Missing: **74**
- Partial: **76**
- Provider-gated: **5**

**155 entries are not fully implemented** (partial + provider-gated + missing). “Implemented” means an active scoped implementation, not proof of production operation at scale. This pass is local and not yet pushed/deployed; the previous Vercel release does not contain these new additions.

## Delivery priorities

1. Customer intelligence / retention: grounded conversation, inline voice, saved taste, restaurant personalization, eligible coupon selection, recent visits, role-scoped feedback analysis and honest baseline insights. Implemented or partial as recorded below.
2. Launch correctness: merchant hours, required choices, stock quantities, delivery serviceability / fees, scheduled-order rules, tips, payment refunds / reconciliation, KYC document storage and verification. Monetary and verification policies need business-approved rules/provider setup.
3. Retention: ledger-backed loyalty/referrals/wallet, memberships, opt-in notification campaigns and push/SMS/WhatsApp delivery.
4. Marketplace expansion: grocery inventory/fulfillment and dining slot/capacity management are separate working modules, not cosmetic navigation tabs.
5. Scale: load/permission/payment-concurrency tests, durable media, distributed jobs/cache, backups, observability and quality evaluation on real operational data.

## Full checklist

| # | Requested feature | Status | Scope / remaining gap |
| --- | --- | --- | --- |
| 1 | Sign up / login | Implemented | Active implementation; see product status and verification boundaries. |
| 2 | Mobile OTP authentication | Missing | Not implemented in the active product. |
| 3 | Google login | Missing | Not implemented in the active product. |
| 4 | Email login | Implemented | Active implementation; see product status and verification boundaries. |
| 5 | User profile | Implemented | Active implementation; see product status and verification boundaries. |
| 6 | Multiple delivery addresses | Implemented | Active implementation; see product status and verification boundaries. |
| 7 | Current-location detection | Implemented | Foreground browser permission / approximate city confirmation, not background tracking. |
| 8 | Saved addresses | Implemented | Active implementation; see product status and verification boundaries. |
| 9 | Manage payment methods | Missing | Not implemented in the active product. |
| 10 | Order history | Implemented | Active implementation; see product status and verification boundaries. |
| 11 | Reorder previous orders | Implemented | Active implementation; see product status and verification boundaries. |
| 12 | Favorites | Implemented | Saved dishes and restaurants. |
| 13 | Recently viewed restaurants | Implemented | Account-scoped visits; clearable; last 20, displayed for 90 days. |
| 14 | Recently ordered food | Implemented | Available dishes from delivered order history. |
| 15 | Search restaurants | Implemented | Active implementation; see product status and verification boundaries. |
| 16 | Search food items | Implemented | Active implementation; see product status and verification boundaries. |
| 17 | Search by cuisine | Implemented | Active implementation; see product status and verification boundaries. |
| 18 | Search by location | Implemented | Active implementation; see product status and verification boundaries. |
| 19 | Restaurant categories | Implemented | Active implementation; see product status and verification boundaries. |
| 20 | Popular restaurants | Partial | Historical popularity influences candidate ranking; no dedicated popular cohort. |
| 21 | New restaurants | Missing | Not implemented in the active product. |
| 22 | Top-rated restaurants | Implemented | Active implementation; see product status and verification boundaries. |
| 23 | Nearby restaurants | Partial | Requires merchant coordinates. Checkout separately enforces same-city delivery and configured active zones; zones require business approval before enabling. |
| 24 | Restaurant collections | Missing | Not implemented in the active product. |
| 25 | Veg-only mode | Implemented | Active implementation; see product status and verification boundaries. |
| 26 | Healthy-food options | Partial | Merchant tags and calories only; no curated healthy taxonomy. |
| 27 | Gourmet food | Missing | Not implemented in the active product. |
| 28 | Offers discovery | Implemented | Active implementation; see product status and verification boundaries. |
| 29 | Restaurant profile | Implemented | Active implementation; see product status and verification boundaries. |
| 30 | Restaurant photos | Partial | Single listing image; no merchant gallery. |
| 31 | Ratings | Implemented | Active implementation; see product status and verification boundaries. |
| 32 | Reviews | Implemented | Active implementation; see product status and verification boundaries. |
| 33 | Restaurant timings | Implemented | Weekly IST schedule, manual pause, customer hours display; enforced in discovery/cart/checkout. One interval per day; overnight service can be split across days. |
| 34 | Delivery distance | Partial | Straight-line distance for mapped restaurants, not driving distance. |
| 35 | Estimated delivery time | Partial | History-based estimate only after enough completed deliveries. |
| 36 | Delivery fee | Implemented | Server-quoted address-specific fee, locked order snapshot, explicit admin-enabled zone rates; standard same-city policy remains default. |
| 37 | Restaurant menu | Implemented | Active implementation; see product status and verification boundaries. |
| 38 | Food categories | Implemented | Restaurant menus list only categories with visible dishes in that restaurant, not empty platform-wide categories. |
| 39 | Food customization | Implemented | Required/optional groups with minimum/maximum selections, server-priced size choices and extras, immutable order snapshots. Minimum advertised price includes required choices. |
| 40 | Add-ons | Implemented | Active implementation; see product status and verification boundaries. |
| 41 | Special instructions | Implemented | Active implementation; see product status and verification boundaries. |
| 42 | Vegetarian / non-vegetarian indicators | Implemented | Active implementation; see product status and verification boundaries. |
| 43 | Bestseller labels | Implemented | Active implementation; see product status and verification boundaries. |
| 44 | Recommended items | Implemented | Active implementation; see product status and verification boundaries. |
| 45 | Nutritional information | Partial | Owner-entered calories / tags, not verified nutrition. |
| 46 | Restaurant hygiene information | Missing | Not implemented in the active product. |
| 47 | Add to cart | Implemented | Active implementation; see product status and verification boundaries. |
| 48 | Remove from cart | Implemented | Active implementation; see product status and verification boundaries. |
| 49 | Update quantity | Implemented | Active implementation; see product status and verification boundaries. |
| 50 | Food customization | Implemented | Required/optional groups, single-choice radio controls and priced extras. Selections are revalidated at checkout. |
| 51 | Apply coupon | Implemented | Active implementation; see product status and verification boundaries. |
| 52 | Apply restaurant offer | Partial | Offers displayed; coupon discount engine separate. |
| 53 | Loyalty points redemption | Missing | Not implemented in the active product. |
| 54 | Wallet balance | Missing | Not implemented in the active product. |
| 55 | Delivery instructions | Implemented | Active implementation; see product status and verification boundaries. |
| 56 | Schedule order | Missing | Not implemented in the active product. |
| 57 | Tip delivery partner | Missing | Not implemented in the active product. |
| 58 | Contactless delivery | Implemented | Active implementation; see product status and verification boundaries. |
| 59 | Order confirmation | Implemented | Active implementation; see product status and verification boundaries. |
| 60 | Order cancellation | Partial | History/tracking meal summary, explicit reason/confirmation, locked cooking cutoff, snapshotted policy and opt-in prepaid refunds. Kitchen issue/hold and separate admin cancellation/full-refund approval now work. Collected-cash exceptions, approved commercial policy and live provider certification remain required. |
| 61 | Refund management | Partial | Order-linked reviews, admin decisions, original-method Razorpay adapter, signed callbacks/reconciliation, policy-authorized self-cancellation refunds and explicit staff cancellation approval. Live certification and cash payouts remain outstanding. |
| 62 | UPI (inferred from truncated source) | Provider-gated | Hosted Razorpay integration exists; actual enabled methods and live capture/settlement require provider verification. |
| 63 | Credit / debit cards | Provider-gated | Hosted Razorpay integration exists; actual enabled methods and live capture/settlement require provider verification. |
| 64 | Net banking | Provider-gated | Hosted Razorpay integration exists; actual enabled methods and live capture/settlement require provider verification. |
| 65 | Payment wallets | Provider-gated | Hosted Razorpay integration exists; actual enabled methods and live capture/settlement require provider verification. |
| 66 | Cash on delivery | Implemented | Active implementation; see product status and verification boundaries. |
| 67 | Saved cards | Missing | Not implemented in the active product. |
| 68 | Payment gateway integration | Provider-gated | Hosted Razorpay integration exists; actual enabled methods and live capture/settlement require provider verification. |
| 69 | Payment status | Implemented | Active implementation; see product status and verification boundaries. |
| 70 | Failed-payment handling | Implemented | Active implementation; see product status and verification boundaries. |
| 71 | Automatic refund | Partial | Explicitly enabled, checkout-snapshotted prepaid self-cancellation policy creates a full original-method obligation and submits it; durable pending state/recovery and verified completion. Disabled by default. Provider certification, operations and other automatic eligibility policies remain outstanding. |
| 72 | Download invoice | Partial | Printable order receipt, not tax-compliant invoice. |
| 73 | Split payment | Missing | Not implemented in the active product. |
| 74 | Order accepted | Implemented | Active implementation; see product status and verification boundaries. |
| 75 | Restaurant preparing order | Implemented | Active implementation; see product status and verification boundaries. |
| 76 | Food ready | Implemented | Active implementation; see product status and verification boundaries. |
| 77 | Delivery partner assigned | Implemented | Active implementation; see product status and verification boundaries. |
| 78 | Delivery partner location | Partial | Opt-in location from open partner page. |
| 79 | Live GPS tracking | Partial | Foreground GPS with custom scooter marker, interpolation of received points and server-timestamp freshness; no background/native tracking. |
| 80 | Estimated arrival time | Partial | Historical estimate, no traffic / route model. |
| 81 | Route tracking | Partial | Map / navigation links, not a route-tracking engine. |
| 82 | Call delivery partner | Missing | Not implemented in the active product. |
| 83 | Chat with delivery partner | Implemented | Persisted customer/current-courier messages, retry-safe sending, unread/read receipts, pagination, notification deep links and terminal read-only history. Polling, not native background messaging. |
| 84 | Delivery OTP | Implemented | Active implementation; see product status and verification boundaries. |
| 85 | Order delivered confirmation | Implemented | Active implementation; see product status and verification boundaries. |
| 86 | Restaurant registration | Implemented | Active implementation; see product status and verification boundaries. |
| 87 | Restaurant login | Implemented | Active implementation; see product status and verification boundaries. |
| 88 | Restaurant verification | Partial | Account / restaurant approval, not document verification. |
| 89 | Restaurant license submission | Missing | Not implemented in the active product. |
| 90 | Food safety certificate submission | Missing | Not implemented in the active product. |
| 91 | Restaurant profile management | Implemented | Active implementation; see product status and verification boundaries. |
| 92 | Menu management | Implemented | Active implementation; see product status and verification boundaries. |
| 93 | Food-item management | Implemented | Active implementation; see product status and verification boundaries. |
| 94 | Category management | Partial | Assign existing categories; category-admin UI incomplete. |
| 95 | Pricing management | Implemented | Active implementation; see product status and verification boundaries. |
| 96 | Inventory management | Partial | Tracked portions, checkout locks, configuration checks, audited adjustments, one-time restock and 15-minute unpaid expiry. Production expiry scheduler, external sync and stock-by-variant remain outstanding. |
| 97 | Stock availability | Implemented | Active implementation; see product status and verification boundaries. |
| 98 | Accept / reject orders | Partial | Kitchen transitions; comprehensive rejection policy absent. |
| 99 | Order preparation status | Implemented | Active implementation; see product status and verification boundaries. |
| 100 | Estimated preparation time | Implemented | Active implementation; see product status and verification boundaries. |
| 101 | Offers management | Implemented | Active implementation; see product status and verification boundaries. |
| 102 | Coupon management | Partial | Admin coupon tools; complete restaurant coupon workspace absent. |
| 103 | Restaurant analytics | Implemented | Active implementation; see product status and verification boundaries. |
| 104 | Sales reports | Partial | 28-day reports; full export / accounting not implemented. |
| 105 | Customer reviews | Implemented | Active implementation; see product status and verification boundaries. |
| 106 | Rating management | Partial | Calculated verified-order ratings, not merchant-editable scores. |
| 107 | Restaurant earnings | Partial | Gross order/payment totals, not net earnings or payouts. |
| 108 | Settlement tracking | Missing | Not implemented in the active product. |
| 109 | Peak-hour analytics | Implemented | Active implementation; see product status and verification boundaries. |
| 110 | Best-selling food analytics | Implemented | Active implementation; see product status and verification boundaries. |
| 111 | Delivery partner registration | Implemented | Active implementation; see product status and verification boundaries. |
| 112 | Delivery partner login | Implemented | Active implementation; see product status and verification boundaries. |
| 113 | Aadhaar verification | Missing | Not implemented in the active product. |
| 114 | Driving licence verification | Missing | Not implemented in the active product. |
| 115 | Vehicle registration | Missing | Not implemented in the active product. |
| 116 | Vehicle insurance | Missing | Not implemented in the active product. |
| 117 | KYC verification | Missing | Not implemented in the active product. |
| 118 | Online / offline status | Implemented | Active implementation; see product status and verification boundaries. |
| 119 | New order notification | Implemented | Active implementation; see product status and verification boundaries. |
| 120 | Accept / reject delivery | Partial | Accept request; no persisted reject/dispatch cycle. |
| 121 | Pickup navigation | Partial | External navigation link. |
| 122 | Restaurant pickup confirmation | Implemented | Active implementation; see product status and verification boundaries. |
| 123 | Customer navigation | Partial | External navigation link. |
| 124 | Live GPS | Partial | Foreground only. |
| 125 | Delivery OTP | Implemented | Active implementation; see product status and verification boundaries. |
| 126 | Earnings dashboard | Partial | Delivery history / unavailable payout explanation; no real earnings. |
| 127 | Daily earnings | Missing | Not implemented in the active product. |
| 128 | Weekly earnings | Missing | Not implemented in the active product. |
| 129 | Monthly earnings | Missing | Not implemented in the active product. |
| 130 | Incentives | Missing | Not implemented in the active product. |
| 131 | Bonuses | Missing | Not implemented in the active product. |
| 132 | Delivery history | Implemented | Active implementation; see product status and verification boundaries. |
| 133 | Performance analytics | Partial | Basic completion history, no full performance model. |
| 134 | Customer rating of partner | Missing | Not implemented in the active product. |
| 135 | Partner support system | Implemented | Active implementation; see product status and verification boundaries. |
| 136 | Admin login | Implemented | Active implementation; see product status and verification boundaries. |
| 137 | Role-based admin access | Implemented | Superuser-managed workspace grants, API enforcement across routed viewsets, least-privilege new administrators, revision checks, audited changes and scoped inboxes. Existing admins retain legacy authority until reviewed. |
| 138 | Customer management | Implemented | Active implementation; see product status and verification boundaries. |
| 139 | Restaurant management | Implemented | Active implementation; see product status and verification boundaries. |
| 140 | Delivery partner management | Implemented | Active implementation; see product status and verification boundaries. |
| 141 | KYC verification | Missing | Not implemented in the active product. |
| 142 | Restaurant approval / rejection | Implemented | Active implementation; see product status and verification boundaries. |
| 143 | Delivery partner approval / rejection | Implemented | Active implementation; see product status and verification boundaries. |
| 144 | Food category management | Partial | Backend CRUD / category assignment; full admin category management UX absent. |
| 145 | City management | Partial | City-labelled delivery zones with normalized aliases; no separate city lifecycle/master administration. |
| 146 | Service-area management | Implemented | Audited admin creation/edit/activation of circular service areas; explicit policy enablement. |
| 147 | Delivery-zone management | Implemented | Admin workspace, radius/trip limits, base/per-km pricing, minimum subtotal and free-delivery threshold. No polygon or traffic-based zones. |
| 148 | Commission management | Missing | Not implemented in the active product. |
| 149 | Coupon management | Implemented | Active implementation; see product status and verification boundaries. |
| 150 | Offer management | Implemented | Active implementation; see product status and verification boundaries. |
| 151 | Order management | Implemented | Active implementation; see product status and verification boundaries. |
| 152 | Payment management | Partial | Payment ledger, refund review queue, partial/full refunds and pending-provider reconciliation. Settlement accounting and live provider acceptance remain outstanding. |
| 153 | Refund management | Partial | Admin review, capped approval, explicit provider submission, original-method processing, timeout reconciliation and signed refund callbacks. Live certification/cash payout policy outstanding. |
| 154 | Complaint management | Implemented | Active implementation; see product status and verification boundaries. |
| 155 | Review moderation | Implemented | Active implementation; see product status and verification boundaries. |
| 156 | User blocking / unblocking | Implemented | Active implementation; see product status and verification boundaries. |
| 157 | Restaurant blocking / unblocking | Implemented | Active implementation; see product status and verification boundaries. |
| 158 | Delivery partner blocking / unblocking | Implemented | Active implementation; see product status and verification boundaries. |
| 159 | Notifications | Implemented | Active implementation; see product status and verification boundaries. |
| 160 | System settings | Partial | Account settings and revision-checked delivery policy; broader platform policy administration outstanding. |
| 161 | Audit logs | Partial | Includes account changes and admin grants, fulfilment and financial events; comprehensive access/export/configuration audit coverage remains pending. |
| 162 | Promo codes | Implemented | Active implementation; see product status and verification boundaries. |
| 163 | Restaurant-specific coupons | Implemented | Active implementation; see product status and verification boundaries. |
| 164 | New-user offers | Partial | First-order eligibility; no separate new-user campaign segmentation. |
| 165 | First-order discount | Implemented | Active implementation; see product status and verification boundaries. |
| 166 | Festival offers | Partial | Scheduled dated offers; no festival campaign tooling. |
| 167 | Referral rewards | Missing | Not implemented in the active product. |
| 168 | Loyalty points | Missing | Not implemented in the active product. |
| 169 | Loyalty levels | Missing | Not implemented in the active product. |
| 170 | Reward redemption | Missing | Not implemented in the active product. |
| 171 | Cashback | Missing | Not implemented in the active product. |
| 172 | Free-delivery offers | Partial | Fixed free-delivery threshold, not configurable coupon campaign. |
| 173 | Buy-one-get-one offers | Missing | Not implemented in the active product. |
| 174 | Personalized offers | Implemented | Ranks eligible coupons using account history / saved kitchens; never creates discounts. |
| 175 | AI food recommendations | Implemented | Server-side live Gemini ranking restricted to real eligible menu IDs. |
| 176 | Personalized restaurant recommendations | Implemented | History, saved kitchens and category preferences; deterministic ranking, not a separate AI restaurant model. |
| 177 | Personalized offers | Implemented | Personalized eligible coupon feed; merchant pricing is unchanged. |
| 178 | AI chatbot | Partial | Food conversation + grounded support guidance, not autonomous support operations. |
| 179 | Voice-based food search | Partial | Inline microphone on supported browsers; recognised text is reviewed before submission. |
| 180 | AI meal recommendations | Partial | Single-dish suggestions; no multi-item meal / nutrition planner. |
| 181 | What should I eat assistant | Implemented | Follow-up food conversation, customer explicitly chooses and orders. |
| 182 | Recommendations from previous orders | Implemented | Up to 100 delivered-order item signals; opt-out available. |
| 183 | Recommendations by budget | Implemented | Per dish, before extras / delivery; not total-basket optimization. |
| 184 | Recommendations by location | Partial | City and optional discovery coordinates; no distance-aware AI ranking. |
| 185 | Recommendations by dietary preferences | Partial | Vegetarian and explicit merchant vegan/Jain tags; not medical/allergen validation. |
| 186 | AI review sentiment analysis | Implemented | On-demand server AI classification of up to 30 public reviews; human review, no auto moderation. |
| 187 | Demand prediction | Partial | Same-weekday historical baseline, not a trained demand model. |
| 188 | Restaurant sales prediction | Partial | Historical gross-order-value baseline, not a trained sales model. |
| 189 | Delivery-time prediction | Partial | 10+ recent kitchen deliveries required; no live traffic/route model. |
| 190 | Fraud detection | Partial | Admin-only velocity / payment-failure review signals; not ML fraud detection, never auto-blocks. |
| 191 | Grocery shopping | Missing | Not implemented in the active product. |
| 192 | Household products | Missing | Not implemented in the active product. |
| 193 | Personal-care products | Missing | Not implemented in the active product. |
| 194 | Search products | Missing | Not implemented in the active product. |
| 195 | Product categories | Missing | Not implemented in the active product. |
| 196 | Product inventory | Missing | Not implemented in the active product. |
| 197 | Quick delivery | Missing | Not implemented in the active product. |
| 198 | Grocery cart | Missing | Not implemented in the active product. |
| 199 | Grocery coupons | Missing | Not implemented in the active product. |
| 200 | Grocery order tracking | Missing | Not implemented in the active product. |
| 201 | Dining restaurant discovery | Partial | Existing food-delivery restaurant discovery, not a dining product. |
| 202 | Restaurant reservations | Missing | Not implemented in the active product. |
| 203 | Table booking | Missing | Not implemented in the active product. |
| 204 | Dining offers | Missing | Not implemented in the active product. |
| 205 | Dining restaurant photos | Partial | Existing restaurant listing photo only. |
| 206 | Dining restaurant reviews | Partial | Existing delivered-order reviews, not dining reviews. |
| 207 | Dining digital payment | Missing | Not implemented in the active product. |
| 208 | Event / dining discovery | Missing | Not implemented in the active product. |
| 209 | GPS location | Implemented | Foreground browser location permission. |
| 210 | Google Maps integration | Partial | External Google directions. In-app map now uses Leaflet/configurable OSM tiles, not Google Maps SDK / routing. |
| 211 | Address autocomplete | Missing | Not implemented in the active product. |
| 212 | Delivery radius | Implemented | Admin-set zone radius and maximum kitchen-to-customer distance checked against saved pins; straight-line basis. |
| 213 | Delivery zones | Implemented | Multiple active circular zones, cheapest eligible overlap, missing-pin/out-of-zone checkout rejection when explicitly enabled. |
| 214 | Distance calculation | Partial | Straight-line distance. |
| 215 | Delivery-fee calculation | Implemented | Server-authoritative base plus extra-distance fee, free threshold, minimum subtotal and signed 10-minute quotes; no silent stale-price acceptance. |
| 216 | Surge pricing | Missing | Not implemented in the active product. |
| 217 | Peak-hour pricing | Missing | Not implemented in the active product. |
| 218 | Route optimization | Missing | Not implemented in the active product. |
| 219 | Multiple service areas | Implemented | Multiple administrable circular zones across city-labelled service areas; baseline same-city check always enforced. |
| 220 | Location-based restaurant filtering | Implemented | City and mapped-restaurant discovery filters. |
| 221 | Customer total orders | Implemented | Active implementation; see product status and verification boundaries. |
| 222 | Customer total spending | Partial | Order totals are not audited customer spending/refund-adjusted accounting. |
| 223 | Favorite restaurants | Implemented | Active implementation; see product status and verification boundaries. |
| 224 | Favorite food | Implemented | Explicitly saved dishes. |
| 225 | Monthly spending | Missing | Not implemented in the active product. |
| 226 | Customer loyalty points | Missing | Not implemented in the active product. |
| 227 | Order frequency | Partial | Order history plus repeat counts, no complete customer frequency dashboard. |
| 228 | Restaurant total sales | Partial | Gross completed-order value, not reconciled restaurant revenue. |
| 229 | Restaurant total orders | Implemented | Active implementation; see product status and verification boundaries. |
| 230 | Average order value | Implemented | Active implementation; see product status and verification boundaries. |
| 231 | Best-selling items | Implemented | Active implementation; see product status and verification boundaries. |
| 232 | Customer retention | Partial | Repeat/returning customer counts, not cohort retention rates. |
| 233 | Cancellation rate | Implemented | Active implementation; see product status and verification boundaries. |
| 234 | Revenue trends | Partial | Date-filtered daily gross completed-order value chart, exact table and CSV. Not reconciled net restaurant revenue or settlement accounting. |
| 235 | Admin total users | Implemented | Active implementation; see product status and verification boundaries. |
| 236 | Admin total restaurants | Implemented | Active implementation; see product status and verification boundaries. |
| 237 | Admin total delivery partners | Implemented | Active implementation; see product status and verification boundaries. |
| 238 | Admin total orders | Implemented | Active implementation; see product status and verification boundaries. |
| 239 | Gross revenue | Partial | Order value, not recognized platform revenue. |
| 240 | Platform commission | Missing | Not implemented in the active product. |
| 241 | Delivery revenue | Partial | Fees stored per order; no dedicated delivery revenue reporting. |
| 242 | Cancellation rate | Implemented | Active implementation; see product status and verification boundaries. |
| 243 | Refund amount | Implemented | Admin API/UI sum verified processed refund amounts, including partial refunds, separately from requested/approved amounts. |
| 244 | Active users | Partial | Enabled user counts, not engagement-defined active users. |
| 245 | Order growth | Implemented | Selected date window versus equal preceding window, with absolute counts and growth percentage; no percentage invented when the preceding count is zero. |
| 246 | City-wise performance | Implemented | Completed-order count/value by city in role-scoped analytics. |
| 247 | Order confirmation notification | Implemented | Active implementation; see product status and verification boundaries. |
| 248 | Order accepted notification | Implemented | Active implementation; see product status and verification boundaries. |
| 249 | Food preparation notification | Implemented | Active implementation; see product status and verification boundaries. |
| 250 | Delivery-partner assignment notification | Implemented | Active implementation; see product status and verification boundaries. |
| 251 | Pickup notification | Implemented | Active implementation; see product status and verification boundaries. |
| 252 | Out-for-delivery notification | Implemented | Active implementation; see product status and verification boundaries. |
| 253 | Delivery notification | Implemented | Active implementation; see product status and verification boundaries. |
| 254 | Coupon notification | Partial | Selected coupon administration events, not full campaign delivery. |
| 255 | Offer notification | Partial | Selected offer administration events, not opt-in marketing system. |
| 256 | Payment notification | Implemented | Active implementation; see product status and verification boundaries. |
| 257 | Refund notification | Implemented | Transactional review/approval/submission/processed/failed in-app updates with order/ticket links; no external messaging claim. |
| 258 | Loyalty notification | Missing | Not implemented in the active product. |
| 259 | Promotional notifications | Partial | No consented marketing campaign pipeline. |
| 260 | Push notifications | Missing | Not implemented in the active product. |
| 261 | SMS | Missing | Not implemented in the active product. |
| 262 | Email | Partial | Authentication emails only; provider configuration required for production delivery. |
| 263 | WhatsApp notifications | Missing | Not implemented in the active product. |
| 264 | Help center | Implemented | Active implementation; see product status and verification boundaries. |
| 265 | FAQ | Implemented | Active implementation; see product status and verification boundaries. |
| 266 | Live chat | Partial | One persisted thread for assistance, actual team replies, explicit handoff, refund status and face feedback. Real-request typing and polling; no staffed synchronous presence guarantee. |
| 267 | AI chatbot | Partial | Gemini topic classification with persisted factual owned-order replies, status mismatch clarification, message deduplication and team handoff. No autonomous financial resolution. |
| 268 | Raise complaint | Implemented | Active implementation; see product status and verification boundaries. |
| 269 | Order-related complaint | Implemented | Active implementation; see product status and verification boundaries. |
| 270 | Missing-item complaint | Implemented | Active implementation; see product status and verification boundaries. |
| 271 | Wrong-item complaint | Implemented | Active implementation; see product status and verification boundaries. |
| 272 | Refund request | Implemented | Explicit chat confirmation, affected-dish snapshot, persistent review status and admin decision. Approval and provider-confirmed processing remain distinct. |
| 273 | Delivery complaint | Implemented | Active implementation; see product status and verification boundaries. |
| 274 | Restaurant complaint | Implemented | Active implementation; see product status and verification boundaries. |
| 275 | Support ticket tracking | Implemented | Active implementation; see product status and verification boundaries. |
| 276 | Multi-vendor marketplace | Implemented | Many restaurant catalog, one restaurant per cart. |
| 277 | AI food recommendation engine | Implemented | Active implementation; see product status and verification boundaries. |
| 278 | Referral program | Missing | Not implemented in the active product. |
| 279 | Loyalty wallet | Missing | Not implemented in the active product. |
| 280 | Dynamic delivery pricing | Partial | Configurable distance-based zone pricing; demand/surge/peak multipliers are not implemented or automatically enabled. |
| 281 | Real-time delivery tracking | Partial | Polling statuses and foreground partner GPS. |
| 282 | Restaurant inventory synchronization | Missing | Not implemented in the active product. |
| 283 | AI customer support | Partial | Persisted ticket assistance, bounded Gemini classification, actual order/refund facts, request-bound typing, team handoff and safe reply retries. Team involvement stops automation; no autonomous refunds/cancellation. |
| 284 | Voice ordering | Partial | Voice-to-text, not hands-free ordering/checkout. |
| 285 | Multi-language support | Partial | Hindi/Hinglish food intent and browser voice locale; no complete app localization. |
| 286 | Subscription / membership | Missing | Not implemented in the active product. |
| 287 | Corporate food ordering | Missing | Not implemented in the active product. |
| 288 | Group ordering | Missing | Not implemented in the active product. |
| 289 | Split bills | Missing | Not implemented in the active product. |
| 290 | Scheduled bulk orders | Missing | Not implemented in the active product. |
| 291 | Party / catering orders | Missing | Not implemented in the active product. |
| 292 | Food subscription plans | Missing | Not implemented in the active product. |
| 293 | Restaurant advertising platform | Missing | Not implemented in the active product. |
| 294 | Delivery-partner incentives | Missing | Not implemented in the active product. |
| 295 | Fraud detection | Partial | Rule-based review signals only. |
| 296 | Advanced admin audit logs | Partial | Selected scoped audit logs, not comprehensive immutable audit infrastructure. |
| 297 | Business intelligence dashboard | Partial | Scoped historical reports, not enterprise BI. |
| 298 | Demand forecasting | Partial | Historical baseline only. |
| 299 | Automated restaurant recommendations | Implemented | Preference-based restaurant ranking; no separate AI restaurant model. |
| 300 | Personalized home screen | Implemented | Authenticated home feed based on saved taste/history. |

## Evidence

- Core ordering and operational capabilities: `PRODUCT_STATUS.md`, `backend/api/test_product.py`.
- This pass: `backend/api/test_intelligence.py`, `backend/api/intelligence.py`, `backend/api/insights.py`.
- Client: `FoodAssistant.jsx`, `PersonalizedFeed.jsx`, `BusinessInsights.jsx`, `VoiceInput.jsx` under `src/components/product/`.
- Do not count preserved, disconnected legacy mock dashboards as implemented AI, payouts, KYC or analytics.
