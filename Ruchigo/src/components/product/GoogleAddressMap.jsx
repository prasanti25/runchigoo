import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { loadGoogleMaps } from "../../lib/googleMaps.js";
import { AddressPin } from "./AddressMap.jsx";
import LoadingScreen from "../common/LoadingScreen.jsx";

export default function GoogleAddressMap({ point, config, onChange }) {
  const node = useRef(null),
    instance = useRef(null),
    selection = useRef(point),
    change = useRef(onChange);
  const [expanded, setExpanded] = useState(false);
  const [moving, setMoving] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    change.current = onChange;
    selection.current = point;
    const map = instance.current;
    if (map) {
      const center = map.getCenter();
      if (
        Math.abs(center.lat() - point.latitude) > 0.000001 ||
        Math.abs(center.lng() - point.longitude) > 0.000001
      )
        map.setCenter({
          lat: Number(point.latitude),
          lng: Number(point.longitude),
        });
    }
  }, [point, onChange]);
  useEffect(() => {
    let active = true,
      observer,
      maps,
      map,
      tileDeadline,
      fatal = false;
    const canvas = node.current;
    const failed = () => {
      fatal = true;
      clearTimeout(tileDeadline);
      if (active) setError(true);
    };
    window.addEventListener("ruchigo-map-auth-failure", failed);
    loadGoogleMaps(config.browser_key)
      .then((library) => {
        if (!active) return;
        maps = library;
        const initial = selection.current;
        map = new maps.Map(canvas, {
          center: {
            lat: Number(initial.latitude),
            lng: Number(initial.longitude),
          },
          zoom: 18,
          maxZoom: 21,
          minZoom: 3,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "greedy",
          keyboardShortcuts: true,
        });
        instance.current = map;
        tileDeadline = setTimeout(() => {
          if (active) setError(true);
        }, 15000);
        map.addListener("tilesloaded", () => {
          if (!active || fatal) return;
          clearTimeout(tileDeadline);
          setLoaded(true);
          setError(false);
        });
        map.addListener("dragstart", () => setMoving(true));
        map.addListener("idle", () => {
          if (!active) return;
          setMoving(false);
          const center = map.getCenter(),
            current = selection.current;
          const metres = Math.hypot(
            (center.lat() - current.latitude) * 111195,
            (center.lng() - current.longitude) *
              111195 *
              Math.cos((center.lat() * Math.PI) / 180),
          );
          if (metres < 1) return;
          change.current({
            latitude: center.lat(),
            longitude: center.lng(),
            source: "map",
          });
        });
        map.addListener("click", (event) => {
          if (event.latLng) {
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
              map.setCenter(event.latLng);
            else map.panTo(event.latLng);
          }
        });
        observer = new ResizeObserver(() => {
          const center = map.getCenter();
          maps.event.trigger(map, "resize");
          map.setCenter(center);
        });
        observer.observe(canvas);
      })
      .catch(failed);
    return () => {
      active = false;
      clearTimeout(tileDeadline);
      observer?.disconnect();
      window.removeEventListener("ruchigo-map-auth-failure", failed);
      if (map) maps.event.clearInstanceListeners(map);
      instance.current = null;
      canvas.replaceChildren();
    };
  }, [config.browser_key]);
  return (
    <div
      className={`address-map-stage google-address-map${expanded ? " is-expanded" : ""}`}
      data-map-state={error ? "error" : loaded ? "ready" : "loading"}
    >
      <div
        className="address-map-canvas"
        ref={node}
        role="region"
        aria-label="Choose your delivery pin on the map"
        aria-busy={!loaded && !error}
      />
      {error ? (
        <div className="address-map-load-error" role="alert">
          The map couldn’t load. You can still add your address details below.
        </div>
      ) : loaded ? (
        <AddressPin moving={moving} />
      ) : (
        <div className="address-map-loading">
          <LoadingScreen inline message="Opening your map…" />
        </div>
      )}
      <button
        type="button"
        className="address-map-expand"
        aria-label={expanded ? "Collapse address map" : "Expand address map"}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
      {!error && loaded && (
        <div className="address-map-hint">
          Move the map or tap to place the pin at your entrance.
        </div>
      )}
    </div>
  );
}
