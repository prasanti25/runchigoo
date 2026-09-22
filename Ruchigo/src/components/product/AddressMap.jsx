import { useEffect, useId, useRef, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pointKey } from "../../lib/addressLocation.js";

export default function AddressMap({ point, config, onChange }) {
  const node = useRef(null),
    instance = useRef(null),
    change = useRef(onChange),
    selection = useRef(point),
    start = useRef(point);
  const [expanded, setExpanded] = useState(false);
  const [tileError, setTileError] = useState(false);
  const [moving, setMoving] = useState(false);
  const pinId = useId();
  useEffect(() => {
    change.current = onChange;
  }, [onChange]);
  useEffect(() => {
    selection.current = point;
  }, [point]);
  useEffect(() => {
    const initial = start.current;
    const map = L.map(node.current, {
      center: [initial.latitude, initial.longitude],
      zoom: 17,
      zoomControl: true,
      scrollWheelZoom: true,
      keyboard: true,
      // ResizeObserver is the single resize owner. A delayed Leaflet resize or
      // zoom transition must not move a confirmed doorstep during expansion.
      trackResize: false,
      zoomAnimation: false,
    });
    instance.current = map;
    L.tileLayer(config.tile_url, { maxZoom: 19, attribution: "" })
      .on("tileerror", () => setTileError(true))
      .on("tileload", () => setTileError(false))
      .addTo(map);
    const attribution = L.control({ position: "bottomright" });
    attribution.onAdd = () => {
      const element = L.DomUtil.create("div", "leaflet-control-attribution");
      const link = document.createElement("a");
      link.href = config.attribution_url;
      link.textContent = config.attribution;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      element.appendChild(link);
      return element;
    };
    attribution.addTo(map);
    let resizing = false;
    map.on("movestart", () => {
      if (!resizing) setMoving(true);
    });
    map.on("moveend", () => {
      setMoving(false);
      if (resizing) return;
      const center = map.getCenter();
      // Leaflet rounds projected pixels at different zoom levels. Ignore the
      // sub-metre jitter instead of clearing a confirmed address on zoom.
      if (
        map.distance(center, [
          selection.current.latitude,
          selection.current.longitude,
        ]) < 1
      )
        return;
      change.current({
        latitude: Math.max(-90, Math.min(90, center.lat)),
        longitude: ((((center.lng + 180) % 360) + 360) % 360) - 180,
        source: "map",
      });
    });
    map.on("click", ({ latlng }) => map.panTo(latlng, { animate: false }));
    const resize = new ResizeObserver(() => {
      const center = map.getCenter();
      resizing = true;
      map.invalidateSize({ pan: true, animate: false });
      map.setView(center, map.getZoom(), { animate: false });
      resizing = false;
    });
    resize.observe(node.current);
    return () => {
      resize.disconnect();
      instance.current = null;
      map.remove();
    };
  }, [config]);
  useEffect(() => {
    const map = instance.current;
    if (!map) return;
    const center = map.getCenter();
    if (
      pointKey({ latitude: center.lat, longitude: center.lng }) !==
      pointKey(point)
    )
      map.setView([point.latitude, point.longitude], map.getZoom(), {
        animate: false,
      });
  }, [point]);
  return (
    <div className={`address-map-stage ${expanded ? "is-expanded" : ""}`}>
      <div
        className="address-map-canvas"
        ref={node}
        role="region"
        aria-label="Choose your delivery pin on the map"
      />
      <div
        className={`address-map-center-pin${moving ? " is-moving" : ""}`}
        aria-hidden="true"
      >
        <span className="address-pin-label">
          <i />
          {moving ? "Place at your entrance" : "Deliver here"}
        </span>
        <span className="address-pin-ground" />
        <span className="address-pin-shadow" />
        <svg
          className="address-pin-artwork"
          width="48"
          height="64"
          viewBox="0 0 48 64"
          fill="none"
        >
          <defs>
            <linearGradient
              id={`${pinId}-fill`}
              x1="10"
              y1="4"
              x2="36"
              y2="59"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FF884F" />
              <stop offset="1" stopColor="#E94B1B" />
            </linearGradient>
          </defs>
          <path
            d="M24 61C21.6 57.6 4 38.8 4 24.5a20 20 0 0 1 40 0C44 38.8 26.4 57.6 24 61Z"
            fill={`url(#${pinId}-fill)`}
            stroke="white"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M10 23a14 14 0 0 1 12-13"
            stroke="white"
            strokeOpacity=".32"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="24" cy="25" r="11.5" fill="white" />
          <path
            d="m17.5 24.5 6.5-5 6.5 5M19.5 23.5v7h9v-7M22.5 30.5v-4h3v4"
            stroke="#E95A27"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <button
        type="button"
        className="address-map-expand"
        aria-label={expanded ? "Collapse address map" : "Expand address map"}
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
      {tileError && (
        <div className="address-map-tile-error" role="status">
          Map imagery couldn’t load. Your selected pin is still available.
        </div>
      )}
      <div className="address-map-hint">
        Move the map or tap to place the pin at your entrance.
      </div>
    </div>
  );
}
