import { useState } from "react";
import {
  ArrowDownLeft,
  Building2,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { apiRequest } from "../../lib/api.js";
import { dateTime, money, useRemote } from "../../lib/product.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { hasAdminScope } from "../../lib/adminAccess.js";
import LoadingScreen from "../common/LoadingScreen.jsx";
import { EmptyState, ErrorNotice, Modal } from "./UI.jsx";
import "./MerchantFinance.css";

const convention =
  "Restaurant coupons reduce restaurant sales. Platform food coupons and promotional rewards are funded by RuchiGo. Commission applies to food sales only, excluding delivery and tips. Confirmed refunds reduce every bill component proportionally. Figures exclude GST, TDS, gateway fees and rider compensation.";

function Pages({ data, page, setPage }) {
  return (
    <div className="finance-pagination">
      <button
        className="btn secondary"
        disabled={page === 1}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>
      <span>Page {page}</span>
      <button
        className="btn secondary"
        disabled={!data?.next}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

function CommissionSettings({ token, canEdit }) {
  const remote = useRemote("/commission-policy/", token);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <div className="finance-policy">
      <ShieldCheck size={22} />
      <div>
        <h3>Commission policy</h3>
        <p>
          {remote.data
            ? `${remote.data.enabled ? `${remote.data.percent}% on new orders` : "Not enabled"} · Revision ${remote.data.revision}`
            : "Loading policy…"}
        </p>
      </div>
      {canEdit && remote.data && (
        <button
          className="btn secondary"
          onClick={() => {
            setError("");
            setForm({ ...remote.data, reason: "", funding_approved: false });
          }}
        >
          Review policy
        </button>
      )}
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {form && (
        <Modal
          title="Commission & settlement policy"
          onClose={() => {
            if (!busy) setForm(null);
          }}
        >
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                await apiRequest("/commission-policy/configure/", {
                  token,
                  method: "POST",
                  body: form,
                });
                setForm(null);
                remote.reload();
                toast.success("Accounting policy saved");
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="finance-note">
              {convention} Existing orders keep their original snapshot. No
              historical backfill or bank transfers are made.
            </p>
            <label className="field">
              <span>Food commission (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                required
                value={form.percent}
                onChange={(e) => setForm({ ...form, percent: e.target.value })}
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm({ ...form, enabled: e.target.checked })
                }
              />
              Enable accounting for new orders
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.settlement_recording_enabled}
                onChange={(e) =>
                  setForm({
                    ...form,
                    settlement_recording_enabled: e.target.checked,
                  })
                }
              />
              Allow finance-confirmed external payment records
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                required={form.enabled || form.settlement_recording_enabled}
                checked={form.funding_approved}
                onChange={(e) =>
                  setForm({ ...form, funding_approved: e.target.checked })
                }
              />
              The funding, refund and pre-tax convention above has business
              approval
            </label>
            <label className="field">
              <span>Reason for change</span>
              <textarea
                required
                minLength={10}
                maxLength={500}
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Save accounting policy"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}

function AccountLedger({ restaurant, token, admin }) {
  const path = `/merchant-finance/${restaurant.id}`;
  const account = useRemote(`${path}/`, token, 15000);
  const [tab, setTab] = useState("history");
  const [page, setPage] = useState(1);
  const rows = useRemote(`${path}/${tab}/?page=${page}`, token, 15000);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const data = account.data;
  const refresh = () => {
    account.reload();
    rows.reload();
  };
  return (
    <div className="finance-account">
      <ErrorNotice error={account.error} onRetry={account.reload} />
      {account.loading && (
        <LoadingScreen inline message="Loading restaurant earnings…" />
      )}
      {data && (
        <>
          <div className="finance-balance">
            <div>
              <p>Outstanding restaurant payable</p>
              <strong>{money(data.balance)}</strong>
              <span>{restaurant.name} · Lifetime accounted activity</span>
            </div>
            <Building2 size={32} />
          </div>
          {Number(data.balance) < 0 && (
            <p className="finance-note">
              Refund adjustments exceed the remaining payable. This is an
              accounting balance, not an automatic bank debit.
            </p>
          )}
          <div className="finance-metrics">
            {[
              ["Food sales after refunds", "merchant_sales"],
              ["Commission after refunds", "commission"],
              ["Platform-funded promotions", "platform_promotion"],
            ].map(([label, key]) => (
              <div key={key}>
                <span>{label}</span>
                <strong>{money(data.totals[key])}</strong>
              </div>
            ))}
          </div>
          <p className="finance-note">
            {data.covered_orders} delivered orders accounted ·{" "}
            {data.unaccounted_orders} collected orders outside this ledger.
            Older orders and unresolved payments are not silently treated as
            zero earnings. Pre-tax figures, not bank statements.
          </p>
          {admin && (
            <button
              className="btn primary"
              disabled={
                !data.settlement_recording_enabled || Number(data.balance) <= 0
              }
              onClick={() => {
                setError("");
                setForm({
                  amount: "",
                  reference: "",
                  paid_at: "",
                  note: "",
                  revision: data.revision,
                  client_id: crypto.randomUUID(),
                  confirmed_external_payment: false,
                });
              }}
            >
              <ArrowDownLeft size={17} />
              Record external payment
            </button>
          )}
          {admin && !data.settlement_recording_enabled && (
            <p className="muted mt-3">
              External payment recording is disabled in the accounting policy.
            </p>
          )}
        </>
      )}
      <div
        className="finance-tabs"
        role="tablist"
        aria-label="Restaurant finance activity"
      >
        {[
          ["history", "Earnings ledger"],
          ["settlements", "Settlement records"],
        ].map(([value, label]) => (
          <button
            role="tab"
            aria-selected={tab === value}
            key={value}
            onClick={() => {
              setTab(value);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorNotice error={rows.error} onRetry={rows.reload} />
      {rows.loading && (
        <LoadingScreen inline message="Loading financial activity…" />
      )}
      {rows.data?.results.length === 0 && (
        <EmptyState
          title={
            tab === "history"
              ? "No accounted activity yet"
              : "No external payments recorded"
          }
          description={
            tab === "history"
              ? "Eligible orders appear after delivery and confirmed collection, using their approved commission snapshot."
              : "Finance-confirmed external payments will appear here. No payout has been initiated by this page."
          }
        />
      )}
      <div className="finance-entries">
        {rows.data?.results.map((row) => (
          <article className="finance-entry" key={row.id}>
            <div className="finance-entry-heading">
              <ReceiptText size={18} />
              <div>
                <strong>{tab === "history" ? row.note : row.reference}</strong>
                <p>
                  {dateTime(row.created_at)}
                  {row.order ? ` · Order #${row.order}` : ""}
                </p>
              </div>
              <b>{money(row.amount)}</b>
            </div>
            {tab === "history" && row.kind === "accrual" && (
              <details>
                <summary>View accounting breakdown</summary>
                <dl>
                  {[
                    ["Food sales", "merchant_sales"],
                    ["Commission", "commission"],
                    ["Platform contribution", "platform_promotion"],
                    ["Delivery collected", "delivery_collected"],
                    ["Tips collected", "tip_collected"],
                    ["Customer payment", "payment_collected"],
                    ["Rounding adjustment", "rounding_adjustment"],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <dt>{label}</dt>
                      <dd>{money(row[key])}</dd>
                    </div>
                  ))}
                </dl>
              </details>
            )}
            {tab === "settlements" && (
              <>
                <p className="muted">
                  Paid externally {dateTime(row.paid_at)} · {row.note}
                </p>
                {row.reversed_at ? (
                  <p className="finance-note">
                    Record corrected: {row.reversal_note}. No bank reversal was
                    made.
                  </p>
                ) : (
                  admin && (
                    <button
                      className="text-link"
                      disabled={!data}
                      onClick={() => {
                        setError("");
                        setForm({
                          settlement_id: row.id,
                          revision: data.revision,
                          note: "",
                        });
                      }}
                    >
                      Correct this record
                    </button>
                  )
                )}
              </>
            )}
          </article>
        ))}
      </div>
      {(rows.data?.count > 20 || page > 1) && (
        <Pages data={rows.data} page={page} setPage={setPage} />
      )}
      <details className="finance-definition">
        <summary>How these amounts are calculated</summary>
        <p>
          {convention} The outstanding balance equals restaurant food sales
          minus commission and recorded external payments, plus corrections.
          Recording a payment does not transfer money.
        </p>
      </details>
      {form && (
        <Modal
          title={
            form.settlement_id
              ? "Correct settlement record"
              : "Record an external payment"
          }
          onClose={() => {
            if (!busy) setForm(null);
          }}
        >
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              try {
                const body = form.settlement_id
                  ? form
                  : { ...form, paid_at: new Date(form.paid_at).toISOString() };
                await apiRequest(
                  `${path}/${form.settlement_id ? "correct-settlement" : "record-settlement"}/`,
                  { token, method: "POST", body },
                );
                setForm(null);
                refresh();
                toast.success("Financial record saved", {
                  id: "merchant-finance-save",
                });
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="finance-note">
              {form.settlement_id
                ? "This corrects the ledger entry only. It does not reverse any actual bank payment. The original record stays in the audit trail."
                : "Record only a payment already made and confirmed outside RuchiGo. This does not send money. Use the actual bank or payout reference."}
            </p>
            {!form.settlement_id && (
              <>
                <label className="field">
                  <span>Amount paid (₹)</span>
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={data?.balance}
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>External payment reference</span>
                  <input
                    required
                    minLength={4}
                    maxLength={120}
                    value={form.reference}
                    onChange={(e) =>
                      setForm({ ...form, reference: e.target.value })
                    }
                  />
                </label>
                <label className="field">
                  <span>Actual payment date & time</span>
                  <input
                    required
                    type="datetime-local"
                    value={form.paid_at}
                    onChange={(e) =>
                      setForm({ ...form, paid_at: e.target.value })
                    }
                  />
                </label>
                <label className="check-label">
                  <input
                    required
                    type="checkbox"
                    checked={form.confirmed_external_payment}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        confirmed_external_payment: e.target.checked,
                      })
                    }
                  />
                  I have verified that this external payment was made
                </label>
              </>
            )}
            <label className="field">
              <span>
                {form.settlement_id ? "Reason for correction" : "Finance note"}
              </span>
              <textarea
                required
                minLength={10}
                maxLength={500}
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy
                ? "Saving…"
                : form.settlement_id
                  ? "Confirm ledger correction"
                  : "Save external payment record"}
            </button>
            {error && (
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={() => {
                  setForm(null);
                  refresh();
                }}
              >
                Close & refresh balance
              </button>
            )}
          </form>
        </Modal>
      )}
    </div>
  );
}

export default function MerchantFinance() {
  const { token, role, user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const restaurants = useRemote(
    `/merchant-finance/?page=${page}&search=${encodeURIComponent(query)}`,
    token,
  );
  const [selected, setSelected] = useState(null);
  const current = selected || restaurants.data?.results[0];
  return (
    <section className="panel merchant-finance">
      <div className="section-title">
        <div>
          <p className="eyebrow">RESTAURANT FINANCE</p>
          <h2>Earnings & settlements</h2>
          <p className="muted">
            From completed meals to a traceable restaurant balance.
          </p>
        </div>
      </div>
      {role === "admin" && (
        <CommissionSettings
          token={token}
          canEdit={hasAdminScope(user, "policies")}
        />
      )}
      {(role === "admin" || restaurants.data?.count > 1 || query) && (
        <form
          className="finance-search"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(search);
            setPage(1);
            setSelected(null);
          }}
        >
          <label className="field">
            <span>Find a restaurant account</span>
            <input
              value={search}
              maxLength={100}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Restaurant name"
            />
          </label>
          <button className="btn secondary">Search accounts</button>
        </form>
      )}
      <ErrorNotice error={restaurants.error} onRetry={restaurants.reload} />
      {restaurants.loading && (
        <LoadingScreen inline message="Loading restaurant accounts…" />
      )}
      {restaurants.data?.results.length > 0 &&
        (role === "admin" || restaurants.data.count > 1) && (
          <label className="field">
            <span>Restaurant account</span>
            <select
              aria-label="Restaurant account"
              value={current?.id || ""}
              onChange={(e) =>
                setSelected(
                  restaurants.data.results.find(
                    (row) => row.id === Number(e.target.value),
                  ),
                )
              }
            >
              {restaurants.data.results.map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · {row.city}
                </option>
              ))}
            </select>
          </label>
        )}
      {restaurants.data?.results.length === 0 && (
        <EmptyState
          title="No restaurant accounts found"
          description="Try another restaurant name. Restaurant owners only see their own kitchens."
        />
      )}
      {(restaurants.data?.count > 25 || page > 1) && (
        <Pages
          data={restaurants.data}
          page={page}
          setPage={(value) => {
            setPage(value);
            setSelected(null);
          }}
        />
      )}
      {current && (
        <AccountLedger
          key={current.id}
          restaurant={current}
          token={token}
          admin={role === "admin"}
        />
      )}
    </section>
  );
}
