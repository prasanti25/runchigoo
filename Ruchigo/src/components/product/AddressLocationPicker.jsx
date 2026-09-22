import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  LocateFixed,
  MapPin,
  Navigation,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { apiRequest } from "../../lib/api.js";
import {
  currentPosition,
  locationPoint,
  pointKey,
} from "../../lib/addressLocation.js";
import { useRemote } from "../../lib/product.js";
import LoadingScreen from "../common/LoadingScreen.jsx";
import { ErrorNotice, Modal } from "./UI.jsx";
import AddressMap from "./AddressMap.jsx";
import "./AddressLocationPicker.css";

export default function AddressLocationPicker({
  initial,
  autoLocate = true,
  onConfirm,
  onClose,
  onManual = onClose,
  manualLabel = "Enter address manually",
}) {
  const [point, setPoint] = useState(() => locationPoint(initial));
  const [result, setResult] = useState(null);
  const [locating, setLocating] = useState(autoLocate);
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState("");
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const request = useRef(null),
    gpsRequest = useRef(null),
    mounted = useRef(true),
    gpsVersion = useRef({ value: 0 });
  const mapConfig = useRemote(point ? "/location/map-config/" : null);
  const lookup = useCallback(async (next) => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = window.setTimeout(() => {
      if (
        !mounted.current ||
        request.current !== controller ||
        controller.signal.aborted
      )
        return;
      controller.abort();
      setResolving(false);
      setLookupError(
        "Address lookup took too long. Try again or enter your address manually.",
      );
    }, 12000);
    setResolving(true);
    setLookupError("");
    setResult(null);
    try {
      const response = await apiRequest("/location/reverse/", {
        method: "POST",
        signal: controller.signal,
        body: {
          latitude: Number(next.latitude).toFixed(6),
          longitude: Number(next.longitude).toFixed(6),
          consent: true,
        },
      });
      if (mounted.current && !controller.signal.aborted)
        setResult({ key: pointKey(next), address: response.address });
    } catch (err) {
      if (mounted.current && !controller.signal.aborted)
        setLookupError(err.message);
    } finally {
      window.clearTimeout(timeout);
      if (mounted.current && !controller.signal.aborted) setResolving(false);
    }
  }, []);
  const receiveGPS = useCallback(async () => {
    const version = ++gpsVersion.current.value;
    gpsRequest.current?.abort();
    const controller = new AbortController();
    gpsRequest.current = controller;
    setLocating(true);
    setError("");
    try {
      const next = await currentPosition({ signal: controller.signal });
      if (!mounted.current || version !== gpsVersion.current.value) return;
      setPoint(next);
      setError("");
      setPermissionDenied(false);
      setLocating(false);
      void lookup(next);
    } catch (err) {
      if (mounted.current && version === gpsVersion.current.value) {
        setError(err.message);
        setPermissionDenied(err.geolocationCode === 1);
        setLocating(false);
      }
    }
  }, [lookup]);
  useEffect(() => {
    mounted.current = true;
    const gps = gpsVersion.current;
    const timer = autoLocate
      ? window.setTimeout(() => void receiveGPS(), 0)
      : null;
    return () => {
      window.clearTimeout(timer);
      mounted.current = false;
      gps.value++;
      gpsRequest.current?.abort();
      request.current?.abort();
    };
  }, [autoLocate, receiveGPS]);
  useEffect(() => {
    if (!permissionDenied || !navigator.permissions) return;
    let permission,
      active = true;
    const changed = () => {
      if (active && permission?.state === "granted") {
        void receiveGPS();
      }
    };
    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (!active) return;
        permission = status;
        permission.addEventListener("change", changed);
      })
      .catch(() => {});
    return () => {
      active = false;
      permission?.removeEventListener("change", changed);
    };
  }, [permissionDenied, receiveGPS]);
  const address = result?.key === pointKey(point) ? result.address : null;
  const missingAddressFields = address
    ? [
        ["line1", "street or locality"],
        ["city", "city"],
        ["state", "state"],
        ["postal_code", "postal code"],
      ]
        .filter(([key]) => !address[key]?.trim())
        .map(([, label]) => label)
    : [];
  const pendingPin = point && !address && !resolving;
  const confirm = () => {
    if (!point || resolving || locating) return;
    onConfirm({
      ...(address || {
        label: "Selected map location",
        city: "",
        line1: "",
        line2: "",
        state: "",
        postal_code: "",
        formatted_address: "",
      }),
      latitude: Number(point.latitude).toFixed(6),
      longitude: Number(point.longitude).toFixed(6),
      accuracy_meters: point.accuracy || null,
      source: point.source || "map",
      confirmed: true,
    });
  };
  return (
    <Modal
      title="Set your delivery location"
      className="address-location-modal"
      onClose={onClose}
    >
      <p className="address-picker-intro">
        A good meal starts at the right doorstep.
      </p>
      <div className="address-picker-layout">
        <div className="address-picker-map-column">
          {!point ? (
            <div className="address-picker-start">
              {locating ? (
                <LoadingScreen inline message="Finding your location…" />
              ) : (
                <>
                  <span>
                    <Navigation size={32} />
                  </span>
                  <h3>Let’s find your doorstep</h3>
                  <p>Allow device location to see your area on the map.</p>
                </>
              )}
            </div>
          ) : mapConfig.loading ? (
            <LoadingScreen inline message="Opening your map…" />
          ) : mapConfig.error ? (
            <ErrorNotice
              error="The map couldn’t load. You can still confirm the pin or retry."
              onRetry={mapConfig.reload}
            />
          ) : (
            <AddressMap
              point={point}
              config={mapConfig.data}
              onChange={(next) => {
                if (pointKey(next) === pointKey(point)) return;
                gpsVersion.current.value++;
                gpsRequest.current?.abort();
                setLocating(false);
                request.current?.abort();
                setResolving(false);
                setLookupError("");
                setResult(null);
                setPoint(next);
              }}
            />
          )}
          <button
            className="address-gps-button"
            type="button"
            disabled={locating}
            onClick={() => void receiveGPS()}
          >
            <LocateFixed size={17} />
            {locating
              ? "Locating…"
              : error
                ? "Try again"
                : "Use current location"}
          </button>
        </div>
        <div className="address-picker-details">
          <p className="eyebrow">DELIVERING TO</p>
          <div className="address-detected" aria-live="polite">
            <MapPin size={22} />
            <div>
              <h3>
                {resolving
                  ? "Finding the address…"
                  : address?.label ||
                    (point ? "Your selected pin" : "Your location")}
              </h3>
              <p>
                {address?.formatted_address ||
                  (point
                    ? "Place the pin at your building entrance, then look up the address."
                    : "Your address will appear here after you allow location.")}
              </p>
            </div>
          </div>
          {point?.source === "gps" && Number(point.accuracy) > 100 && (
            <p className="address-accuracy-warning">
              Your device estimates a radius of about{" "}
              {Math.round(point.accuracy)} m. Please move the pin to your
              entrance.
            </p>
          )}
          {missingAddressFields.length > 0 && (
            <p className="address-details-hint">
              Add your {missingAddressFields.join(", ")} with your delivery
              details.
            </p>
          )}
          <ErrorNotice error={error || lookupError} />
          {pendingPin && (
            <button
              type="button"
              className="btn secondary w-full"
              onClick={() => lookup(point)}
            >
              <SearchPinIcon />
              {lookupError
                ? "Retry address lookup"
                : "Find address for this pin"}
            </button>
          )}
          <div className="address-picker-note">
            <ShieldCheck size={17} />
            <p>
              GPS finds the area, not your flat or floor. Check the pin and add
              any delivery details before saving.
            </p>
          </div>
          <button
            type="button"
            className="btn primary w-full"
            disabled={!point || resolving || locating}
            onClick={confirm}
          >
            Add delivery details
            <ArrowRight size={17} />
          </button>
          <button
            type="button"
            className="address-manual-button"
            onClick={onManual}
          >
            <Pencil size={14} />
            {manualLabel}
          </button>
          <p className="address-picker-privacy">
            This action shares your pin with our address-lookup service and
            opens map tiles.{" "}
            <Link to="/privacy#location" onClick={onClose}>
              Location privacy
            </Link>
          </p>
          {address?.attribution && (
            <a
              className="address-lookup-attribution"
              href="https://locationiq.com/"
              target="_blank"
              rel="noreferrer"
            >
              {address.attribution}
            </a>
          )}
        </div>
      </div>
    </Modal>
  );
}

function SearchPinIcon() {
  return <MapPin size={16} />;
}
