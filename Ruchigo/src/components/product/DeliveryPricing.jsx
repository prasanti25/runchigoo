import { useState } from "react";
import { Clock3, MapPin, Plus } from "lucide-react";
import { apiRequest } from "../../lib/api.js";
import { dateTime, money, useRemote } from "../../lib/product.js";
import { ErrorNotice, Modal, Skeleton } from "./UI.jsx";
import "./DeliveryPricing.css";

function Pages({ remote, page, setPage }) {
  if (!remote.data || (!remote.data.next && !remote.data.previous)) return null;
  return (
    <div className="flex-row between mt-4">
      <button
        className="btn secondary"
        disabled={!remote.data.previous}
        onClick={() => setPage(page - 1)}
      >
        Previous
      </button>
      <span>Page {page}</span>
      <button
        className="btn secondary"
        disabled={!remote.data.next}
        onClick={() => setPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export function ServiceCities({ token }) {
  const [page, setPage] = useState(1);
  const cities = useRemote(`/service-cities/?page=${page}`, token);
  const [form, setForm] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <section className="panel mt-6">
      <div className="flex-row between wrap">
        <div>
          <p className="eyebrow">MARKET AVAILABILITY</p>
          <h2>Cities, on your terms</h2>
        </div>
        <button
          className="btn secondary"
          onClick={() => {
            setError("");
            setForm({ name: "", is_active: true, reason: "" });
          }}
        >
          <Plus size={16} /> Manage a city
        </button>
      </div>
      <p className="muted mt-3">
        Pause new orders across a city without interrupting active deliveries.
        Cities not listed here keep their existing availability; an open city
        still needs an approved kitchen and valid delivery area.
      </p>
      <ErrorNotice error={cities.error} onRetry={cities.reload} />
      {cities.loading ? (
        <Skeleton count={1} />
      ) : (
        <div className="city-availability-list">
          {cities.data?.results.map((city) => (
            <article key={city.id}>
              <MapPin size={19} />
              <div>
                <strong>{city.name}</strong>
                <small>
                  {city.is_active
                    ? "Open for eligible new orders"
                    : "New orders paused"}
                </small>
              </div>
              <button
                className="btn secondary"
                onClick={() => {
                  setError("");
                  setForm({
                    ...city,
                    is_active: !city.is_active,
                    expected_revision: city.revision,
                    reason: "",
                  });
                }}
              >
                {city.is_active ? "Pause city" : "Reopen city"}
              </button>
            </article>
          ))}
        </div>
      )}
      {!cities.loading && cities.data?.count === 0 && (
        <p className="form-help mt-4">
          No city-wide overrides. Your existing restaurant and zone settings are
          unchanged.
        </p>
      )}
      <Pages remote={cities} page={page} setPage={setPage} />
      {form && (
        <Modal
          title={
            form.id
              ? `${form.is_active ? "Reopen" : "Pause"} ${form.name}`
              : "Manage city availability"
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
                await apiRequest(
                  form.id ? `/service-cities/${form.id}/` : "/service-cities/",
                  { token, method: form.id ? "PATCH" : "POST", body: form },
                );
                setForm(null);
                cities.reload();
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              <span>City name</span>
              <input
                required
                maxLength={100}
                readOnly={Boolean(form.id)}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm({ ...form, is_active: event.target.checked })
                }
              />{" "}
              Allow new orders in this city
            </label>
            <p className="form-help">
              Applies to discovery and checkout, including supported city
              aliases. Existing orders can still be prepared and delivered.
              Saved addresses and restaurant records are not deleted.
            </p>
            <label className="field">
              <span>Operational reason</span>
              <textarea
                required
                minLength={10}
                maxLength={500}
                value={form.reason}
                onChange={(event) =>
                  setForm({ ...form, reason: event.target.value })
                }
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Confirm city availability"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
function localInput(value) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

export default function DeliveryPricing({ token }) {
  const [page, setPage] = useState(1),
    [zoneSearch, setZoneSearch] = useState("");
  const rules = useRemote(`/delivery-pricing/?page=${page}`, token);
  const zones = useRemote(
    `/delivery-zones/?search=${encodeURIComponent(zoneSearch)}`,
    token,
  );
  const [form, setForm] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <section className="panel mt-6">
      <div className="flex-row between wrap">
        <div>
          <p className="eyebrow">CLEAR PRICES, BEFORE CHECKOUT</p>
          <h2>Peak & temporary delivery fees</h2>
        </div>
        <button
          className="btn secondary"
          onClick={() => {
            setError("");
            setForm({
              name: "",
              zone: "",
              kind: "peak",
              additional_fee: "",
              starts_at: "",
              ends_at: "",
              weekdays: [],
              start_time: "",
              end_time: "",
              is_active: false,
              reason: "",
            });
          }}
        >
          <Plus size={16} /> Add pricing rule
        </button>
      </div>
      <p className="muted mt-3">
        Rules only apply under the enabled zone policy. Only the highest
        matching fee in a zone is used—never stacked. The customer gets the
        cheapest eligible zone after adjustments. Free-delivery thresholds and
        fee-waiver coupons still waive the entire fee.
      </p>
      <ErrorNotice error={rules.error} onRetry={rules.reload} />
      {rules.loading ? (
        <Skeleton count={1} />
      ) : (
        <div className="delivery-pricing-list">
          {rules.data?.results.map((rule) => (
            <article key={rule.id}>
              <div className="flex-row between">
                <Clock3 size={20} />
                <span className="status-pill">
                  {!rule.is_active
                    ? "Disabled / draft"
                    : new Date(rule.ends_at) <= new Date()
                      ? "Expired"
                      : "Enabled window"}
                </span>
              </div>
              <h3>{rule.name}</h3>
              <p>
                {rule.city} · {rule.zone_name}
              </p>
              <strong>
                +{money(rule.additional_fee)}{" "}
                {rule.kind === "peak" ? "at peak times" : "temporary fee"}
              </strong>
              <p className="form-help">
                {dateTime(rule.starts_at)} – {dateTime(rule.ends_at)}
              </p>
              {rule.kind === "peak" && (
                <p className="form-help">
                  {rule.weekdays.map((day) => dayNames[day]).join(", ")} ·{" "}
                  {rule.start_time.slice(0, 5)}–{rule.end_time.slice(0, 5)}{" "}
                  India time
                </p>
              )}
              <button
                className="btn secondary"
                onClick={() => {
                  setError("");
                  setForm({
                    ...rule,
                    starts_at: localInput(rule.starts_at),
                    ends_at: localInput(rule.ends_at),
                    start_time: rule.start_time?.slice(0, 5) || "",
                    end_time: rule.end_time?.slice(0, 5) || "",
                    expected_revision: rule.revision,
                    reason: "",
                  });
                }}
              >
                Review rule
              </button>
            </article>
          ))}
        </div>
      )}
      {!rules.loading && rules.data?.count === 0 && (
        <p className="form-help mt-4">
          No additional fees configured. New rules start as drafts.
        </p>
      )}
      <Pages remote={rules} page={page} setPage={setPage} />
      {form && (
        <Modal
          title={form.id ? "Review delivery pricing" : "Add delivery pricing"}
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
                const body = {
                  ...form,
                  starts_at: new Date(form.starts_at).toISOString(),
                  ends_at: new Date(form.ends_at).toISOString(),
                  start_time: form.kind === "peak" ? form.start_time : null,
                  end_time: form.kind === "peak" ? form.end_time : null,
                };
                await apiRequest(
                  form.id
                    ? `/delivery-pricing/${form.id}/`
                    : "/delivery-pricing/",
                  { token, method: form.id ? "PATCH" : "POST", body },
                );
                setForm(null);
                rules.reload();
              } catch (err) {
                setError(err.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <label className="field">
              <span>Customer-facing fee name</span>
              <input
                required
                maxLength={80}
                value={form.name}
                onChange={(event) =>
                  setForm({ ...form, name: event.target.value })
                }
              />
            </label>
            <label className="field">
              <span>Find a delivery zone</span>
              <input
                value={zoneSearch}
                onChange={(event) => setZoneSearch(event.target.value)}
                placeholder="Search by city or zone"
              />
            </label>
            <ErrorNotice error={zones.error} onRetry={zones.reload} />
            <label className="field">
              <span>Delivery zone</span>
              <select
                required
                aria-label="Delivery zone"
                value={form.zone}
                onChange={(event) =>
                  setForm({ ...form, zone: event.target.value })
                }
              >
                <option value="">Choose a zone</option>
                {form.id &&
                  !zones.data?.results.some(
                    (zone) => zone.id === Number(form.zone),
                  ) && (
                    <option value={form.zone}>
                      {form.city} · {form.zone_name}
                    </option>
                  )}
                {zones.data?.results.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.city} · {zone.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="form-help">
              Showing up to 20 matches. Search to find another zone.
            </p>
            <div className="delivery-rule-grid">
              <label className="field">
                <span>Fee type</span>
                <select
                  value={form.kind}
                  onChange={(event) =>
                    setForm({ ...form, kind: event.target.value })
                  }
                >
                  <option value="peak">Scheduled peak fee</option>
                  <option value="surge">Temporary demand fee</option>
                </select>
              </label>
              <label className="field">
                <span>Additional delivery fee (₹)</span>
                <input
                  type="number"
                  required
                  min="0.01"
                  max="500"
                  step="0.01"
                  value={form.additional_fee}
                  onChange={(event) =>
                    setForm({ ...form, additional_fee: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Window starts (your local time)</span>
                <input
                  type="datetime-local"
                  required
                  value={form.starts_at}
                  onChange={(event) =>
                    setForm({ ...form, starts_at: event.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Window ends (your local time)</span>
                <input
                  type="datetime-local"
                  required
                  value={form.ends_at}
                  onChange={(event) =>
                    setForm({ ...form, ends_at: event.target.value })
                  }
                />
              </label>
            </div>
            {form.kind === "peak" && (
              <>
                <fieldset>
                  <legend>Peak weekdays · India time</legend>
                  <div className="delivery-weekdays">
                    {dayNames.map((day, index) => (
                      <label key={day}>
                        <input
                          type="checkbox"
                          checked={form.weekdays.includes(index)}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              weekdays: event.target.checked
                                ? [...form.weekdays, index]
                                : form.weekdays.filter(
                                    (value) => value !== index,
                                  ),
                            })
                          }
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="delivery-rule-grid">
                  <label className="field">
                    <span>Daily start · India time</span>
                    <input
                      type="time"
                      required
                      value={form.start_time}
                      onChange={(event) =>
                        setForm({ ...form, start_time: event.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Daily end · India time</span>
                    <input
                      type="time"
                      required
                      value={form.end_time}
                      onChange={(event) =>
                        setForm({ ...form, end_time: event.target.value })
                      }
                    />
                  </label>
                </div>
              </>
            )}
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) =>
                  setForm({ ...form, is_active: event.target.checked })
                }
              />{" "}
              Enable during the approved window
            </label>
            <p className="form-help">
              Temporary demand fees expire within 24 hours. Peak schedules
              expire within 90 days. Both require explicit approval, affect new
              quotes only and never change placed orders.
            </p>
            <label className="field">
              <span>Pricing approval reference / reason</span>
              <textarea
                required
                minLength={10}
                maxLength={500}
                value={form.reason}
                onChange={(event) =>
                  setForm({ ...form, reason: event.target.value })
                }
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Save approved pricing rule"}
            </button>
          </form>
        </Modal>
      )}
    </section>
  );
}
