import { useEffect, useRef, useState } from "react";
import { MapPin, Maximize2, Minimize2 } from "lucide-react";
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
    map.on("moveend", () => {
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
      <div className="address-map-center-pin" aria-hidden="true">
        <span>Deliver here</span>
        <MapPin size={46} fill="#f46a2b" stroke="#fff" strokeWidth={1.6} />
        <i />
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
