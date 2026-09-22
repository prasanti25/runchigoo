import { lazy, Suspense, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import {
  addressDraft,
  deliveryLocationFromAddress,
  locationPoint,
} from "../../lib/addressLocation.js";
import {
  saveDeliveryLocation,
  useDeliveryLocation,
} from "../../lib/product.js";
import LoadingScreen from "../common/LoadingScreen.jsx";
import { ErrorNotice, Modal } from "./UI.jsx";

const AddressLocationPicker = lazy(() => import("./AddressLocationPicker.jsx"));

export default function AddressForm({
  onSaved,
  onClose,
  initial,
  prefill,
  localOnly = false,
}) {
  const { token } = useAuth();
  const selectedLocation = useDeliveryLocation();
  const [form, setForm] = useState(
    () => initial || addressDraft(prefill || selectedLocation),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pinUpdated, setPinUpdated] = useState(false);
  // A map lookup must never silently discard a typed flat number or landmark.
  const editedFields = useRef(new Set(initial ? ["line1", "line2"] : []));
  const change = (key, value) => {
    editedFields.current.add(key);
    setForm((current) => ({ ...current, [key]: value }));
  };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const address = localOnly
        ? form
        : await apiRequest(
            initial?.id ? `/addresses/${initial.id}/` : "/addresses/",
            { token, method: initial?.id ? "PATCH" : "POST", body: form },
          );
      saveDeliveryLocation({
        ...deliveryLocationFromAddress(address),
        source: localOnly ? "manual" : "saved",
      });
      onSaved(address);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  if (pickerOpen)
    return (
      <Suspense
        fallback={
          <Modal
            title="Set your delivery location"
            onClose={() => setPickerOpen(false)}
          >
            <LoadingScreen inline message="Opening your map…" />
          </Modal>
        }
      >
        <AddressLocationPicker
          initial={form}
          autoLocate={!locationPoint(form)}
          onClose={() => setPickerOpen(false)}
          onConfirm={(location) => {
            const detected = addressDraft(location);
            setForm((current) => ({
              ...current,
              ...Object.fromEntries(
                Object.entries(detected).filter(
                  ([key]) => key !== "label" && !editedFields.current.has(key),
                ),
              ),
            }));
            setPinUpdated(true);
            setError("");
            setPickerOpen(false);
          }}
        />
      </Suspense>
    );
  return (
    <Modal title="Where should we bring your food?" onClose={onClose}>
      <form onSubmit={save} className="form-stack">
        <div className="address-pin-controls">
          <button
            type="button"
            className="btn secondary"
            onClick={() => setPickerOpen(true)}
          >
            <MapPin size={16} />
            {locationPoint(form)
              ? "Update location pin"
              : "Use my current location"}
          </button>
          <p className="form-help">
            {pinUpdated
              ? "Pin updated. Your typed details were kept — please check they match this location."
              : locationPoint(form)
                ? "Check your building pin, then add your flat, floor or landmark below."
                : "Find your address on the map. You can also enter it manually below."}
          </p>
          <p className="form-help">
            Using location shares your pin with our address-lookup service. GPS
            cannot reliably find a flat or floor number.
          </p>
        </div>
        <label className="field">
          <span>Save as</span>
          <select
            value={form.label}
            onChange={(event) => change("label", event.target.value)}
          >
            <option>Home</option>
            <option>Work</option>
            <option>Other</option>
            {!["Home", "Work", "Other"].includes(form.label) && (
              <option>{form.label}</option>
            )}
          </select>
        </label>
        {[
          ["line1", "House / flat number and street", true],
          ["line2", "Landmark or additional details", false],
        ].map(([key, label, required]) => (
          <label className="field" key={key}>
            <span>{label}</span>
            <input
              required={required}
              value={form[key]}
              maxLength={255}
              onChange={(event) => change(key, event.target.value)}
            />
          </label>
        ))}
        <div className="form-grid">
          {[
            ["city", "City"],
            ["state", "State"],
            ["postal_code", "Postal code"],
          ].map(([key, label]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                required
                value={form[key]}
                maxLength={key === "postal_code" ? 20 : 100}
                onChange={(event) => change(key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <ErrorNotice error={error} />
        <button className="btn primary" disabled={saving}>
          {saving
            ? "Saving address…"
            : localOnly
              ? "Use this address"
              : "Save delivery address"}
        </button>
        {localOnly && (
          <p className="form-help">
            Kept on this browser. Sign in at checkout to save this address to
            your account.
          </p>
        )}
      </form>
    </Modal>
  );
}
