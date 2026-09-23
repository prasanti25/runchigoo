import { useState } from "react";
import { MapPin, Plus, Settings2 } from "lucide-react";
import toast from "react-hot-toast";
import { WorkspaceFrame } from "../../components/product/Workspace.jsx";
import { ErrorNotice, Modal, Skeleton } from "../../components/product/UI.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { money, useRemote } from "../../lib/product.js";
import DeliveryPricing, {
  ServiceCities,
} from "../../components/product/DeliveryPricing.jsx";
import WorkspaceTabs from "../../components/product/WorkspaceTabs.jsx";

const blank = {
  name: "",
  city: "",
  latitude: "",
  longitude: "",
  radius_km: "",
  max_delivery_km: "",
  base_fee: "",
  included_km: "0",
  per_km_fee: "0",
  minimum_order: "0",
  free_delivery_above: "",
  is_active: false,
};
const fields = [
  ["name", "Zone name", "text"],
  ["city", "City", "text"],
  ["latitude", "Centre latitude", "number", -90, 90, "0.000001"],
  ["longitude", "Centre longitude", "number", -180, 180, "0.000001"],
  ["radius_km", "Zone radius (km)", "number", 0.1, 100],
  ["max_delivery_km", "Max kitchen-to-door distance (km)", "number", 0.1, 100],
  ["base_fee", "Base delivery fee (₹)", "number", 0, 10000],
  ["included_km", "Distance included in base fee (km)", "number", 0, 100],
  ["per_km_fee", "Fee per additional km (₹)", "number", 0, 1000],
  ["minimum_order", "Minimum food subtotal (₹)", "number", 0, 9999999],
  [
    "free_delivery_above",
    "Free delivery at subtotal (₹, optional)",
    "number",
    0,
    9999999,
  ],
];

export default function DeliveryZones() {
  const { token } = useAuth();
  const [section, setSection] = useState("zones");
  const [page, setPage] = useState(1);
  const zones = useRemote(`/delivery-zones/?page=${page}`, token);
  const policy = useRemote("/delivery-policy/", token);
  const [editing, setEditing] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = Object.fromEntries(
        Object.keys(blank).map((key) => [
          key,
          key === "free_delivery_above" && editing[key] === ""
            ? null
            : editing[key],
        ]),
      );
      await apiRequest(
        editing.id ? `/delivery-zones/${editing.id}/` : "/delivery-zones/",
        { token, method: editing.id ? "PATCH" : "POST", body },
      );
      setEditing(null);
      zones.reload();
      toast.success("Delivery zone saved");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const configure = async () => {
    setBusy(true);
    setError("");
    try {
      await apiRequest("/delivery-policy/configure/", {
        token,
        method: "POST",
        body: { enabled: !policy.data.enabled, revision: policy.data.revision },
      });
      setConfirming(false);
      policy.reload();
      toast.success("Delivery policy updated");
    } catch (err) {
      setError(err.message);
      policy.reload();
    } finally {
      setBusy(false);
    }
  };
  return (
    <WorkspaceFrame
      type="admin"
      title="Delivery areas & pricing"
      description="Decide where each kitchen can deliver and show customers the exact fee before checkout."
      action={
        <button
          className="btn primary"
          onClick={() => {
            setError("");
            setEditing({ ...blank });
          }}
        >
          <Plus size={17} />
          Add zone
        </button>
      }
    >
      <WorkspaceTabs
        label="Delivery settings sections"
        tabs={[
          ["zones", "Delivery zones"],
          ["cities", "Service cities"],
          ["pricing", "Pricing rules"],
        ]}
        value={section}
        onChange={setSection}
      >
        <div>
          <ErrorNotice
            error={zones.error || policy.error}
            onRetry={() => {
              zones.reload();
              policy.reload();
            }}
          />
          <section className="panel zone-policy-panel">
            <div>
              <span className="eyebrow">CHECKOUT POLICY</span>
              <h2>
                {policy.data?.enabled
                  ? "Configured zones are enforced"
                  : "Standard same-city delivery"}
              </h2>
              <p className="muted">
                {policy.data?.enabled
                  ? "Only active zones can receive orders. Overlapping zones use the lowest eligible delivery fee."
                  : "Current fee: ₹40 below ₹500 food subtotal, otherwise free. Cross-city orders are blocked. Your draft zones do not change checkout until enabled."}
              </p>
            </div>
            <button
              className="btn secondary"
              disabled={!policy.data}
              onClick={() => {
                setError("");
                setConfirming(true);
              }}
            >
              <Settings2 size={16} />
              {policy.data?.enabled
                ? "Use standard policy"
                : "Enable zone policy"}
            </button>
          </section>
          <p className="form-help">
            Distances use straight-line measurements, not road routes. Customers
            need an address pin when zones are enabled. New rates affect new
            checkout quotes only; existing orders keep their original bill.
          </p>
          {zones.loading ? (
            <Skeleton count={2} />
          ) : (
            <div className="zone-grid">
              {zones.data?.results.map((zone) => (
                <article className="panel zone-card" key={zone.id}>
                  <div className="flex-row between">
                    <MapPin size={22} />
                    <span
                      className={`status-pill ${zone.is_active ? "" : "cancelled"}`}
                    >
                      {zone.is_active ? "Active" : "Draft / disabled"}
                    </span>
                  </div>
                  <h2>{zone.name}</h2>
                  <p className="muted">
                    {zone.city} · {zone.radius_km} km coverage radius
                  </p>
                  <dl>
                    <div>
                      <dt>Base delivery</dt>
                      <dd>{money(zone.base_fee)}</dd>
                    </div>
                    <div>
                      <dt>Additional distance</dt>
                      <dd>
                        {money(zone.per_km_fee)} / km after {zone.included_km}{" "}
                        km
                      </dd>
                    </div>
                    <div>
                      <dt>Maximum trip</dt>
                      <dd>{zone.max_delivery_km} km</dd>
                    </div>
                    <div>
                      <dt>Free delivery</dt>
                      <dd>
                        {zone.free_delivery_above === null
                          ? "Not configured"
                          : `From ${money(zone.free_delivery_above)}`}
                      </dd>
                    </div>
                  </dl>
                  <button
                    className="btn secondary w-full"
                    onClick={() => {
                      setError("");
                      setEditing({
                        ...zone,
                        free_delivery_above: zone.free_delivery_above ?? "",
                      });
                    }}
                  >
                    Edit zone
                  </button>
                </article>
              ))}
            </div>
          )}
          {!zones.loading && zones.data?.count === 0 && (
            <section className="panel">
              <h2>No delivery zones yet</h2>
              <p className="muted">
                Add your approved service areas, review their prices, then
                enable the policy when ready.
              </p>
            </section>
          )}
          {zones.data?.count > 20 && (
            <div className="pagination">
              <button
                className="btn secondary"
                disabled={!zones.data.previous}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span>Page {page}</span>
              <button
                className="btn secondary"
                disabled={!zones.data.next}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          )}
        </div>
        <ServiceCities token={token} />
        <DeliveryPricing token={token} />
      </WorkspaceTabs>
      {editing && (
        <Modal
          title={editing.id ? "Edit delivery zone" : "Add delivery zone"}
          onClose={() => {
            if (!busy) setEditing(null);
          }}
        >
          <form className="form-stack" onSubmit={save}>
            <div className="form-grid">
              {fields.map(([key, label, type, min, max, step]) => (
                <label className="field" key={key}>
                  <span>{label}</span>
                  <input
                    required={key !== "free_delivery_above"}
                    type={type}
                    min={min}
                    max={max}
                    step={type === "number" ? step || "0.01" : undefined}
                    maxLength={100}
                    value={editing[key]}
                    onChange={(event) =>
                      setEditing({ ...editing, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <label className="check-label">
              <input
                type="checkbox"
                checked={editing.is_active}
                onChange={(event) =>
                  setEditing({ ...editing, is_active: event.target.checked })
                }
              />
              Active zone
            </label>
            <p className="form-help">
              When zone policy is enabled, saving an active zone updates
              checkout availability and pricing immediately.
            </p>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Save zone"}
            </button>
          </form>
        </Modal>
      )}
      {confirming && (
        <Modal
          title="Change checkout delivery policy?"
          onClose={() => {
            if (!busy) setConfirming(false);
          }}
        >
          <p className="muted mt-4">
            {policy.data?.enabled
              ? "New checkout quotes will use the standard same-city fee. Configured zone boundaries will no longer apply."
              : "New orders will be restricted to your active zones. Review your approved areas, prices and kitchen pins before continuing."}
          </p>
          <ErrorNotice error={error} />
          <button
            className="btn primary mt-5"
            disabled={busy}
            onClick={configure}
          >
            {busy ? "Updating…" : "Confirm policy change"}
          </button>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
