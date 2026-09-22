import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChefHat,
  LocateFixed,
  MapPin,
  Maximize2,
  Minimize2,
  Navigation,
  Store,
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRemote } from "../../lib/product.js";
import {
  coordinates,
  deliveryStageMessage,
  locationFreshness,
  positionOnRoute,
  travelBearing,
} from "../../lib/tracking.js";
import riderArtwork from "../../../public/tracking/ruchigo-rider-map.svg?raw";

const riderIcon = L.divIcon({
  className: "ruchigo-rider-marker",
  // Trusted bundled SVG, never customer/provider HTML. Inline wheels rotate
  // only while the marker is moving between received positions.
  html: `<span class="rider-heading" role="img" aria-label="RuchiGo delivery partner on a scooter">${riderArtwork}</span>`,
  iconSize: [48, 72],
  // A top-down marker is centered ON the road, not above a pin-style anchor.
  iconAnchor: [24, 36],
});
const pinIcon = (kind) =>
  L.divIcon({
    className: `delivery-map-pin ${kind}`,
    html:
      kind === "kitchen"
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 10v10h16V10M3 10l2-6h14l2 6M8 20v-7h5v7M3 10h18"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8"/></svg>',
    iconSize: [34, 34],
    iconAnchor: [17, 34],
  });

export default function LiveDeliveryMap({
  order,
  initiallyEnabled = false,
  route = null,
  mapLabel = "Delivery map",
  arrival = null,
  statusTitle = null,
}) {
  const [enabled, setEnabled] = useState(initiallyEnabled);
  const [now, setNow] = useState(Date.now);
  const recenterRef = useRef(null);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 5000);
    return () => window.clearInterval(timer);
  }, []);
  const delivery = order.delivery;
  const rider = ["assigned", "out_for_delivery"].includes(order.status)
    ? coordinates(delivery?.current_latitude, delivery?.current_longitude)
    : null;
  const kitchen = coordinates(
    order.restaurant_detail?.latitude,
    order.restaurant_detail?.longitude,
  );
  const home = coordinates(
    order.delivery_address_detail?.latitude,
    order.delivery_address_detail?.longitude,
  );
  const freshness = locationFreshness(delivery?.location_updated_at, now);
  const hasPoints = rider || kitchen || home;
  const config = useRemote(
    enabled && hasPoints ? "/location/map-config/" : null,
  );
  const [stageTitle, stageDescription] = deliveryStageMessage(order.status);
  return (
    <section
      className={`live-delivery-card ${arrival ? "has-arrival" : ""}`}
      aria-label="Delivery map"
    >
      <div className={`delivery-map-heading ${arrival ? "with-arrival" : ""}`}>
        <div>
          <span
            className={`location-dot ${rider && freshness.fresh ? "fresh" : ""}`}
          />
          <strong>
            {statusTitle ||
              (rider && freshness.fresh
                ? order.status === "out_for_delivery"
                  ? "Your order is on the way"
                  : "Your delivery partner is assigned"
                : rider
                  ? "Last shared location"
                  : stageTitle)}
          </strong>
        </div>
        {arrival && (
          <div className="delivery-status-arrival" role="status">
            <strong>{arrival.headline}</strong>
            <small>{arrival.caption}</small>
          </div>
        )}
      </div>
      {!hasPoints ? (
        <div className="delivery-stage-empty" role="status">
          <span className="delivery-stage-icon">
            <ChefHat size={28} />
          </span>
          <div>
            <h3>{stageTitle}</h3>
            <p>{stageDescription}</p>
          </div>
        </div>
      ) : !enabled ? (
        <div className="delivery-map-consent">
          <img
            src="/tracking/ruchigo-rider.svg"
            width="112"
            height="96"
            alt="RuchiGo scooter rider"
          />
          <h3>From the kitchen to your door</h3>
          <p>{stageDescription}</p>
          <button
            className="btn dark"
            type="button"
            onClick={() => setEnabled(true)}
          >
            <Navigation size={16} />
            Show live map
          </button>
          <Link to="/privacy#location">Map & location privacy</Link>
        </div>
      ) : config.error ? (
        <div className="delivery-map-unavailable">
          <MapPin size={26} />
          <p>
            The map couldn’t load. Your order updates are still available below.
          </p>
          <button type="button" className="text-link" onClick={config.reload}>
            Try again
          </button>
        </div>
      ) : !config.data ? (
        <div className="delivery-map-unavailable" role="status">
          Opening your map…
        </div>
      ) : hasPoints ? (
        <MapCanvas
          key={order.id}
          config={config.data}
          kitchen={kitchen}
          home={home}
          rider={rider}
          timestamp={delivery?.location_updated_at}
          recenterRef={recenterRef}
          route={route}
          mapLabel={mapLabel}
          arrival={arrival}
        />
      ) : (
        <div className="delivery-map-unavailable">
          <MapPin size={26} />
          <h3>{stageTitle}</h3>
          <p>{stageDescription}</p>
        </div>
      )}
      {hasPoints && (
        <div className="delivery-map-footer">
          <div className="delivery-map-legend">
            {kitchen && (
              <span>
                <Store size={14} />
                Restaurant
              </span>
            )}
            {home && (
              <span>
                <MapPin size={14} />
                Your address
              </span>
            )}
          </div>
          <p role="status">
            {rider ? freshness.label : stageDescription}
            {rider && !freshness.fresh ? ". Waiting for a new GPS update." : ""}
          </p>
          {enabled && !home && (
            <small>
              Your saved address has no map pin. Address details are shown
              below.
            </small>
          )}
        </div>
      )}
    </section>
  );
}

function MapCanvas({
  config,
  kitchen,
  home,
  rider,
  timestamp,
  recenterRef,
  route,
  mapLabel,
  arrival,
}) {
  const container = useRef(null);
  const wrapper = useRef(null);
  const expandButton = useRef(null);
  const engine = useRef(null);
  const frame = useRef(null);
  const [tileError, setTileError] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    if (!expanded) return;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Keep the existing Leaflet instance and zoom. Inert surrounding content
    // while the map fills the screen, including on mobile browsers without
    // the Fullscreen API. Restore every original value on close/unmount.
    const siblings = [];
    let ancestor = wrapper.current;
    while (ancestor && ancestor !== document.body) {
      for (const sibling of ancestor.parentElement?.children || []) {
        if (sibling !== ancestor) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      }
      ancestor = ancestor.parentElement;
    }
    expandButton.current?.focus();
    const onKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...wrapper.current.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex="0"]',
        ),
      ].filter((element) => element.getClientRects().length);
      const first = focusable[0],
        last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      siblings.forEach(([element, wasInert]) => {
        element.inert = wasInert;
      });
      if (previousFocus?.isConnected)
        previousFocus.focus({ preventScroll: true });
    };
  }, [expanded]);
  useEffect(() => {
    const map = engine.current?.map;
    if (!map) return;
    if (expanded) map.scrollWheelZoom.enable();
    else map.scrollWheelZoom.disable();
  }, [expanded]);
  // Initialize once per order/provider. Location updates move existing layers;
  // they never recreate the map, reset the user's zoom, or fetch a fake route.
  useEffect(() => {
    const map = L.map(container.current, {
      scrollWheelZoom: false,
      zoomControl: false,
      touchZoom: true,
      dragging: true,
      doubleClickZoom: true,
      maxZoom: 19,
      minZoom: 3,
    }).setView([0, 0], 3);
    container.current.dataset.zoom = map.getZoom();
    map.on("zoomend", () => {
      if (container.current) container.current.dataset.zoom = map.getZoom();
    });
    L.control.zoom({ position: "bottomright" }).addTo(map);
    const credit = document.createElement("a");
    credit.href = config.attribution_url;
    credit.textContent = config.attribution;
    credit.target = "_blank";
    credit.rel = "noopener noreferrer";
    const layer = L.tileLayer(config.tile_url, {
      attribution: credit.outerHTML,
      maxZoom: 19,
      referrerPolicy: "strict-origin-when-cross-origin",
      keepBuffer: 1,
      updateWhenIdle: true,
      detectRetina: false,
    }).addTo(map);
    layer.on("tileerror", () => setTileError(true));
    layer.on("tileload", () => setTileError(false));
    engine.current = {
      map,
      markers: {},
      fitted: false,
      sampleTime: null,
      previousFresh: false,
    };
    const observer = new ResizeObserver(() =>
      map.invalidateSize({ pan: true, animate: false }),
    );
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
      recenterRef.current = null;
      map.remove();
      engine.current = null;
    };
  }, [config, recenterRef]);
  const kitchenLat = kitchen?.[0],
    kitchenLng = kitchen?.[1];
  const homeLat = home?.[0],
    homeLng = home?.[1];
  const riderLat = rider?.[0],
    riderLng = rider?.[1];
  const routePoints = route?.points;
  const routeProgress = route?.progress;
  useEffect(() => {
    const state = engine.current;
    if (!state || !routePoints?.length) return;
    const outline = L.polyline(routePoints, {
      color: "#fff",
      weight: 9,
      opacity: 0.95,
      interactive: false,
    }).addTo(state.map);
    const path = L.polyline(routePoints, {
      color: "#3975dd",
      weight: 5,
      opacity: 0.9,
      interactive: false,
    }).addTo(state.map);
    const travelled = L.polyline([], {
      color: "#a8bddb",
      weight: 5,
      interactive: false,
    }).addTo(state.map);
    state.travelled = travelled;
    return () => {
      outline.remove();
      path.remove();
      travelled.remove();
      state.travelled = null;
    };
  }, [config, routePoints]);
  useEffect(() => {
    const state = engine.current;
    if (!state) return;
    const { map, markers } = state;
    for (const [kind, lat, lng, label] of [
      ["kitchen", kitchenLat, kitchenLng, "Restaurant"],
      ["home", homeLat, homeLng, "Your delivery address"],
    ]) {
      if (lat != null && lng != null) {
        if (!markers[kind])
          markers[kind] = L.marker([lat, lng], {
            icon: pinIcon(kind),
            title: label,
          })
            .bindTooltip(label)
            .addTo(map);
        else markers[kind].setLatLng([lat, lng]);
      } else if (markers[kind]) {
        markers[kind].remove();
        delete markers[kind];
      }
    }
    cancelAnimationFrame(frame.current);
    const setMoving = (moving) =>
      markers.rider?.getElement()?.classList.toggle("is-moving", moving);
    const faceDirection = (bearing, immediate = false) => {
      if (!Number.isFinite(bearing)) return;
      const previous = state.heading ?? bearing;
      const delta = ((bearing - previous + 540) % 360) - 180;
      state.heading = immediate ? bearing : previous + delta * 0.22;
      const artwork = markers.rider
        ?.getElement()
        ?.querySelector(".rider-heading");
      if (artwork) artwork.style.transform = `rotate(${state.heading}deg)`;
    };
    setMoving(false);
    if (riderLat != null && riderLng != null) {
      const point = L.latLng(riderLat, riderLng);
      const fresh = locationFreshness(timestamp).fresh;
      const sampleTime = Date.parse(timestamp);
      if (!markers.rider) {
        markers.rider = L.marker(point, {
          icon: riderIcon,
          title: "Delivery partner",
          zIndexOffset: 1000,
        }).addTo(map);
        state.renderedProgress = routeProgress;
        if (routePoints)
          faceDirection(
            positionOnRoute(routePoints, routeProgress ?? 0).bearing,
            true,
          );
      } else if (
        !Number.isFinite(state.sampleTime) ||
        !Number.isFinite(sampleTime) ||
        sampleTime >= state.sampleTime
      ) {
        const marker = markers.rider;
        const from = marker.getLatLng();
        const distance = from.distanceTo(point);
        const reduced = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        const fromProgress = state.renderedProgress ?? routeProgress;
        // Interpolate fresh nearby RECEIVED points only. Reconnects, stale data,
        // large jumps and reduced-motion preferences snap to the known point.
        if (
          fresh &&
          state.previousFresh &&
          Date.now() - state.sampleTime <= 60000 &&
          distance > 1 &&
          distance < 500 &&
          !reduced
        ) {
          const start = performance.now();
          setMoving(true);
          const move = (time) => {
            const progress = Math.min(
              1,
              (time - start) / (routePoints ? 1000 : 1200),
            );
            if (routePoints && routeProgress != null && fromProgress != null) {
              state.renderedProgress =
                fromProgress + (routeProgress - fromProgress) * progress;
              const position = positionOnRoute(
                routePoints,
                state.renderedProgress,
              );
              marker.setLatLng(position.point);
              faceDirection(position.bearing);
              state.travelled?.setLatLngs(position.travelled);
            } else {
              const eased = progress * progress * (3 - 2 * progress);
              marker.setLatLng([
                from.lat + (point.lat - from.lat) * eased,
                from.lng + (point.lng - from.lng) * eased,
              ]);
              faceDirection(
                travelBearing([from.lat, from.lng], [point.lat, point.lng]),
              );
            }
            if (progress < 1) frame.current = requestAnimationFrame(move);
            else setMoving(false);
          };
          frame.current = requestAnimationFrame(move);
        } else {
          marker.setLatLng(point);
          state.renderedProgress = routeProgress;
          if (distance > 1)
            faceDirection(
              routePoints
                ? positionOnRoute(routePoints, routeProgress).bearing
                : travelBearing([from.lat, from.lng], [point.lat, point.lng]),
              true,
            );
          if (routePoints && routeProgress != null)
            state.travelled?.setLatLngs(
              positionOnRoute(routePoints, routeProgress).travelled,
            );
        }
      }
      if (
        !Number.isFinite(state.sampleTime) ||
        sampleTime >= state.sampleTime
      ) {
        state.sampleTime = sampleTime;
        state.previousFresh = fresh;
      }
      markers.rider.setOpacity(fresh ? 1 : 0.6);
      const element = markers.rider.getElement();
      if (element) {
        element.dataset.latitude = riderLat;
        element.dataset.longitude = riderLng;
      }
    } else if (markers.rider) {
      markers.rider.remove();
      delete markers.rider;
      state.sampleTime = null;
    }
    recenterRef.current = () => {
      const points = [
        ...Object.values(markers).map((marker) => marker.getLatLng()),
        ...(routePoints || []),
      ];
      if (points.length)
        map.fitBounds(L.latLngBounds(points), {
          padding: [52, 58],
          maxZoom: 16,
          animate: false,
        });
    };
    if (!state.fitted && Object.keys(markers).length) {
      recenterRef.current();
      state.fitted = true;
    }
  }, [
    kitchenLat,
    kitchenLng,
    homeLat,
    homeLng,
    riderLat,
    riderLng,
    timestamp,
    recenterRef,
    routePoints,
    routeProgress,
  ]);
  return (
    <div
      ref={wrapper}
      className={`delivery-map-wrap ${expanded ? "is-expanded" : ""}`}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded ? true : undefined}
      aria-label={expanded ? "Expanded delivery map" : undefined}
    >
      <div className="delivery-map-toolbar">
        <span>{mapLabel}</span>
        <div>
          <button
            type="button"
            className="icon-button"
            aria-label="Recenter delivery map"
            onClick={() => recenterRef.current?.()}
          >
            <LocateFixed size={19} />
          </button>
          <button
            ref={expandButton}
            type="button"
            className="icon-button"
            aria-label={
              expanded ? "Collapse delivery map" : "Expand delivery map"
            }
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
        </div>
      </div>
      <div
        ref={container}
        className="delivery-leaflet-map"
        role="region"
        aria-label="Map of restaurant, delivery address and shared rider location"
      />
      {arrival && (
        <div className="delivery-map-arrival" role="status">
          <strong>{arrival.headline}</strong>
          <span>{arrival.caption}</span>
        </div>
      )}
      {tileError && (
        <p className="map-tile-error" role="status">
          Some map details couldn’t load. Location updates remain available.
        </p>
      )}
    </div>
  );
}
