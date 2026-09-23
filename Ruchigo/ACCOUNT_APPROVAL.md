# Account approval — 23 September 2026

## Admin workflow

1. Use the **same environment** in which the person registered. Local preview
   accounts are not production accounts; the databases are separate.
2. Open `/admin-partner-accounts` (partner access) or `/admin-users` (People).
3. Choose **Pending approval**, search their email, and check the actual role.
4. Select the visible **Approve** button, review the details, give a reason and
   confirm **Approve account**.
5. The partner signs in using the **email/password they registered**, not a
   shared preview password. Their account role determines their dashboard.

`/admin-delivery-partners` offers the same rider approval and restore actions.
The directory and summary are API-backed and the People view refreshes every
20 seconds while visible; the refresh button is also available. No action in
this release automatically approves a production applicant.

## State and permissions

| Account state | Sign-in | Admin action |
| --- | --- | --- |
| New customer | Allowed immediately | Block, if needed |
| New restaurant/delivery applicant | Pending approval | Approve account |
| Active account | Allowed | Block, subject to active-order checks |
| Previously active/blocked account | Blocked, not labelled pending | Restore access |

- All three admin views use the same server-derived access status. Existing
  accounts are classified using `is_active`, prior access audit records, legacy
  approval/block notifications and login history; no destructive data backfill
  or schema migration is required. Legacy inactive partners with no evidence of
  prior access are presented for first approval.
- Customer/self-service accounts cannot approve themselves; delegated admin
  scopes and superuser protections remain enforced by the API.
- Approval/restoration cannot silently bypass one another, and direct partner
  activation through a profile PATCH is rejected. Repeated or stale decisions
  show an error instead of pretending they succeeded. Each change is audited.
- New, approved and restored riders start offline; their own availability
  control enables them to go online. Existing assignments are not rewritten.
- Account approval grants sign-in only. **Restaurant listing approval remains
  separate**, and account approval does not perform KYC/document verification.
- Pending screens preserve email/role on return to login, never a password.
  Blocked accounts receive a distinct blocked-access message.
- Mobile directory actions occupy their own row, so joining dates and approval
  buttons do not overlap. Original branding and desktop navigation are retained.

## Verification

- `api.test_account_approval`: both partner registration/approval/login cycles,
  customers, admin-created rider availability, block/restore, scoped admins,
  listing separation, legacy blocked records, patch bypass, pagination and
  atomic rollback. Uses isolated in-memory SQLite.
- The related dashboard, admin-access and API flow regression suite passes.
- `npm run test:account-approval`: actual browser registration forms with a
  newly created isolated database. Covers People, partner access and rider
  directory approval; persisted state after reload; original-password login;
  customer home; rider block/restore; mobile overlap and six viewport widths.
  No mocked account API responses or production mutations.
- For compiled-frontend verification: run Vite preview on local port 4175 and
  `RUCHIGO_APPROVAL_BASE=http://127.0.0.1:4175 npm run test:account-approval`.
- Admin 19-page/six-width regression and mobile-navigation regression run
  separately against the local retained accounts. Lint/build are checked.

Production asset verification is recorded in `VERIFICATION_REPORT.md` after
deployment. Local browser tests are not an authenticated production journey,
load certification, KYC certification or proof of email-provider delivery.
