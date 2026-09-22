# Checkout, support and refunds

Local implementation, 22 September 2026. The payment provider and refund webhook
are **not configured in this preview**. No real refund has been sent by these tests.

## Customer journey

- Restaurant menu categories are scoped to visible dishes from that restaurant.
- Delivered orders show five clickable stars in tracking and on the restaurant's
  review section. Existing reviews can be edited; ownership and delivered status
  are checked by the API.
- Tracking → **Food spoiled or poor quality** opens an order-linked conversation.
  Select affected dishes, describe the issue, choose refund review or support,
  then explicitly confirm submission. The assistant can link to the same flow
  for English/Hinglish spoiled-food messages without claiming to issue money.
- Support → conversation shows requested/reviewing/approved/processing/processed,
  rejected or failed status. All events and replies persist. Resolve/reopen does
  not change financial status.
- A resolved conversation offers sad/neutral/happy face feedback, saved with an
  optional comment. Only the conversation owner can rate it. Meal and support
  ratings are separate.

## One persistent support conversation

`/support?ticket=ID` now contains one conversation, not an independent assistant
above a passive ticket form. Customer messages persist first; `/respond/` creates
one assistance reply for the latest owned message. The typing indicator follows
that real request. Provider/network failure has a factual fallback or a retry
action; replies are not fabricated as coming from a connected human agent.

Known questions use order/payment/refund facts. Unfamiliar English/Hinglish text
can use Gemini topic classification; only bounded, redacted free text is sent,
not account/order/address records. Generated URLs or financial claims from the
model are never accepted. Asking to cancel or refund performs no such mutation.
Pre-delivery food complaints ask whether delivery status is wrong instead of
assuming food has arrived. Default pre-delivery help offers status/payment topics.

Customer reply keys prevent duplicate sends. An explicit **Talk to the team**
handoff or a staff reply stops automated assistance; the queue state is visible,
without fake human presence or promised response times. Staff replies, refund
status, resolve/reopen and face feedback remain in the same thread. Notifications
still persist; the active conversation does not produce repeated overlay toasts.

## Delivery policy

Admin → **Delivery areas** (`/admin-delivery-zones`) creates draft/active circular
zones, city, centre, radius, maximum straight-line kitchen-to-door distance,
base fee, included distance, per-km fee, minimum food subtotal and optional
free-delivery threshold. Lowest eligible fee wins if zones overlap.

Default remains same-city delivery at ₹40 below ₹500 food subtotal, otherwise
free. New zone policy is **off** until an admin explicitly enables it. No new
commercial rates or service cities were activated during implementation/tests.
Approved merchant/customer pins and business-reviewed rates are prerequisites.
City aliases normalize New Delhi/Delhi and Gurgaon/Gurugram. This is not road
distance, address autocomplete, polygon serviceability or Google Maps integration.

Checkout obtains `/cart/quote/` for the chosen owned address. A signed quote is
valid for ten minutes and binds account, address version, cart configuration,
prices, coupon and policy/zone revisions. Checkout recomputes all values and
rejects changed/tampered quotes. A quote does not reserve stock. The cart page
does not present an unverified delivery fee as final.

## Unpaid reservations

New online orders reserve stock for 15 minutes. Migration 0015 grants pre-existing
awaiting-payment orders a full 15-minute grace window at migration time; it does
not change pending COD orders. Failed creation of a provider order still rolls
back checkout. Captured orders never expire.

Schedule this management command **every minute** in the production worker/cron
environment after applying migrations and taking a database backup:

```sh
.venv/bin/python backend/manage.py expire_unpaid_orders --apply
```

Without `--apply`, the command only prints the eligible count. Order reads by the
customer and checkout also perform bounded lazy expiry. A periodic worker is
still required for timely release without customer traffic; none was installed
in production by this development pass.

Expiry locks order then payment, releases only reserved stock once, restores the
coupon reservation and cancels the unsent order. A late capture **never revives**
the order or reuses released stock. It records the actual capture, flags payment
reconciliation and opens one customer/admin refund-review conversation.

## Cancellation window and recovery

**Your orders → Cancel order** or **Track order → Cancel order** opens a reason
and confirmation dialog. Keeping the order makes no change. Eligibility refreshes
while the dialog is open, and the API locks/rechecks the order before changing it.
Cancellation is unavailable during preparing, ready, assigned, in transit or
delivered stages. The page explains why and links to help for that exact order.

Admin → **Order policy** (`/admin-order-policy`) supports two explicit cutoffs:
before acceptance (unchanged default) or before preparation. Prepaid automatic
full refunds are a separate opt-in, disabled by default. Neither setting was
enabled/changed during this development pass. New orders retain the policy shown
in their signed checkout quote; future admin changes do not rewrite old rights.
Orders predating migration 0017 keep the original acceptance/support-review rules.

- Eligible unpaid/COD cancellation releases reserved stock and coupon use once.
  Repeated cancellation cannot duplicate these changes. Kitchen rejection also
  releases the coupon; already cooking food is never restocked.
- Authorized prepaid cancellation atomically saves cancellation and a full
  approved refund obligation before attempting original-method submission.
  Provider downtime leaves the obligation approved and visible; timeout leaves
  it processing. Neither silently reopens the order or means money was returned.
- Late capture after unpaid cancellation creates a reconciliation review, not
  a new kitchen order. Existing payment/refund complications require support.
- Cancellation reasons, policy revision, events and in-app customer/kitchen
  notifications persist. Support replies use owned-order eligibility but never
  execute a cancellation from free text.
- Staff cannot rewind progress to reopen a cancellation window. Completed and
  cancelled orders cannot be reopened; those admin controls are disabled too.

After business approval, provider test-mode certification and policy opt-in,
schedule a recovery worker for approved **automatic cancellation** obligations:

```sh
.venv/bin/python backend/manage.py process_cancellation_refunds --apply
```

Without `--apply` this is read-only. It submits at most 100 approved requests per
run; it never resubmits uncertain processing/failed requests. Reconcile those via
Admin → Payments instead. No recovery worker was installed in production.
Captured prepaid cancellation remains blocked through the generic status
endpoint; use the separately authorized support workflow below. Cash payouts
and cancellation charges are not invented.

## Restaurant fulfilment issues and staff decisions

1. Kitchen → order → **Report a fulfilment issue** requires a customer-visible
   note and the current stage. It opens an owned customer/support conversation
   and pauses fulfilment; it does not cancel or refund anything.
2. Held orders are excluded from available rider requests. Preparation, direct
   assignment, pickup, delivery and self-cancellation are rejected server-side.
   Tracking and role pages show the hold, not a progressing ETA. A held
   conversation cannot be closed until support decides the order outcome.
3. Admin → conversation or Orders → **Order actions** can resume with a note,
   keeping the existing stage, or explicitly confirm a support cancellation.
   Stale stage submissions are rejected. Customer/restaurant cannot invoke the
   admin cancellation or resume action.
4. Captured online cancellation requires explicit approval of the exact full
   payment to its original method. Cancellation plus approved refund obligation
   are atomic. An existing unsubmitted review in that conversation can be used;
   conflicting/submitted/partial approvals cannot be silently expanded/replayed.
5. Approval does **not** submit money. Staff separately use **Process approved
   refund** under the existing provider confirmation/reconciliation workflow.
   Automatic-cancellation recovery does not submit these staff approvals.
6. Uncooked stock/coupon reservation is released once. Cooked food is not
   restocked. Collected cash requires an approved offline process and is blocked
   here. Delivered complaints use refund review rather than reopening delivery.

## Original-method online refunds

1. Configure backend `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and
   `RAZORPAY_WEBHOOK_SECRET` in the intended environment, using test mode first.
2. Configure `payment.captured`, `refund.processed` and `refund.failed` webhooks
   at `/api/v1/online-payments/webhook/`. Signature, original payment ID, approved
   amount and provider refund reference are checked.
3. In Admin → Payments → Refund reviews, open the linked conversation. Review
   the evidence and enter a customer-visible decision note and approved amount.
   Server caps approval against requested and unrefunded/unreserved paid value.
4. **Process approved refund** requires another explicit confirmation. It only
   handles a captured Razorpay payment on a delivered/cancelled order. The
   request is sent to that original payment's `/refund` endpoint. No destination
   account, card, wallet, OTP or UPI PIN is accepted from the customer.
5. A durable processing state is written before contacting the provider, with
   a stable `X-Refund-Idempotency` key on the provider submission. A timeout is
   an unknown result, not a failed payment reversal: use **Check
   provider status**, which reads provider refunds and reconciles the unique
   request receipt. It does not issue a second refund.
6. Only a verified processed response/callback marks the refund complete. Partial
   amounts live in the refund ledger; the whole payment becomes refunded only
   when processed amounts cover its captured value. Duplicate callbacks do not
   create duplicate notifications or reverse already-refunded payment status.

Missing/ambiguous provider confirmations and confirmed failures stay visible
for staff investigation; there is no unsafe blind retry button. Bank posting
time is not invented. Cash payments cannot be reversed through Razorpay and
require a separately approved offline payout procedure. No automatic
refund-eligibility policy, compensation rate or promised refund SLA was invented.
Prepaid self-cancellation uses only the separately authorized snapshotted policy
above. It remains support-gated by default; provider setup is still required.

## Verification

Provider contract cross-checked against official documentation on 22 September
2026: [normal refund with idempotency](https://razorpay.com/docs/api/refunds/normal-refunds-idempotent/),
[refunds for an original payment](https://razorpay.com/docs/api/refunds/fetch-multiple-refund-payment/)
and [fetch a refund](https://razorpay.com/docs/api/refunds/fetch-with-id/). The
documented ₹1 minimum, request header, receipt and INR response fields are
enforced. Documentation review is not live provider certification.

```sh
.venv/bin/python backend/manage.py test api.test_checkout_support api.test_cancellations api.test_support_operations --noinput
npm run test:checkout-support
npm run test:cancellations
npm run test:support-conversation
```

The backend suite covers scopes, signed quotes, zones, stock expiry, delayed
capture, partial/full original-payment refunds, replay prevention, signed
webhooks, uncertain-outcome reconciliation and conversation feedback. Provider
calls in this suite are mocked; provider test-mode certification remains required.

The browser suite uses only localhost and named preview accounts. It exercises
real API/database writes for stars, complaints, admin review and feedback at
320/390/1440px, then removes only its uniquely marked temporary review/cart item.
Clearly marked resolved QA conversations are retained locally. It never
processes a provider refund, changes live zone policy or advances user order #16.
The cancellation browser suite creates two uniquely marked COD fixture orders,
checks history/tracking confirmation and cooking-time invalidation, and closes
only those fixtures through authorized kitchen actions. Screenshots are saved
as `/private/tmp/ruchigo-cancel-*.png`. Run shared-fixture suites sequentially.
