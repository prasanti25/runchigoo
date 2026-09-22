import { useEffect, useRef, useState } from "react";
import { LocateFixed, Maximize2, Minimize2 } from "lucide-react";
import { loadGoogleMaps } from "../../lib/googleMaps.js";
import {
  locationFreshness,
  positionOnRoute,
  projectOnRoute,
  travelBearing,
} from "../../lib/tracking.js";
import LoadingScreen from "../common/LoadingScreen.jsx";
import riderArtwork from "../../../public/tracking/ruchigo-rider-map.svg?raw";

const latLng = (p) => ({ lat: p[0], lng: p[1] });
const metres = (a, b) =>
  Math.hypot(a[0] - b[0], (a[1] - b[1]) * Math.cos((a[0] * Math.PI) / 180)) *
  111195;
const pinArtwork = (kind) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">${kind === "kitchen" ? '<path d="M4 10v10h16V10M3 10l2-6h14l2 6M8 20v-7h5v7M3 10h18"/>' : '<path d="m3 11 9-8 9 8M5 10v11h14V10M9 21v-8h6v8"/>'}</svg>`;

export default function GoogleDeliveryMap({
  config,
  kitchen,
  home,
  rider,
  timestamp,
  route,
  mapLabel,
  arrival,
}) {
  const canvas = useRef(null),
    wrapper = useRef(null),
    expandButton = useRef(null),
    engine = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [state, setState] = useState("loading");
  const latest = useRef({ kitchen, home, rider, timestamp, route });
  useEffect(() => {
    latest.current = { kitchen, home, rider, timestamp, route };
  }, [kitchen, home, rider, timestamp, route]);

  useEffect(() => {
    if (!expanded) return;
    const focus = document.activeElement,
      overflow = document.body.style.overflow,
      siblings = [];
    document.body.style.overflow = "hidden";
    let ancestor = wrapper.current;
    while (ancestor && ancestor !== document.body) {
      for (const sibling of ancestor.parentElement?.children || [])
        if (sibling !== ancestor) {
          siblings.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      ancestor = ancestor.parentElement;
    }
    expandButton.current?.focus();
    const key = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setExpanded(false);
      }
      if (event.key !== "Tab") return;
      const elements = [
        ...wrapper.current.querySelectorAll(
          'button:not([disabled]), a[href], [tabindex="0"]',
        ),
      ].filter((el) => el.getClientRects().length);
      if (event.shiftKey && document.activeElement === elements[0]) {
        event.preventDefault();
        elements.at(-1)?.focus();
      } else if (
        !event.shiftKey &&
        document.activeElement === elements.at(-1)
      ) {
        event.preventDefault();
        elements[0]?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = overflow;
      siblings.forEach(([el, inert]) => {
        el.inert = inert;
      });
      document.removeEventListener("keydown", key);
      if (focus?.isConnected) focus.focus({ preventScroll: true });
    };
  }, [expanded]);

  useEffect(() => {
    let active = true,
      deadline,
      observer,
      fatal = false;
    const node = canvas.current;
    const fail = () => {
      fatal = true;
      clearTimeout(deadline);
      if (active) setState("error");
    };
    window.addEventListener("ruchigo-map-auth-failure", fail);
    loadGoogleMaps(config.browser_key)
      .then((maps) => {
        if (!active) return;
        const initial = latest.current;
        const center = initial.rider || initial.kitchen || initial.home;
        const map = new maps.Map(node, {
          center: latLng(center),
          zoom: 15,
          maxZoom: 21,
          minZoom: 3,
          mapTypeId: "roadmap",
          renderingType: "RASTER",
          tilt: 0,
          heading: 0,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          clickableIcons: false,
          gestureHandling: "cooperative",
          styles: [
            { featureType: "poi.business", stylers: [{ visibility: "off" }] },
          ],
        });
        class Pin extends maps.OverlayView {
          constructor(kind, point) {
            super();
            this.point = point;
            this.kind = kind;
            this.element = document.createElement("div");
            this.element.className =
              kind === "rider"
                ? "ruchigo-rider-marker google-rider-marker"
                : `delivery-map-pin google-delivery-pin ${kind}`;
            this.element.setAttribute("role", "img");
            this.element.setAttribute(
              "aria-label",
              kind === "rider"
                ? "Delivery partner"
                : kind === "kitchen"
                  ? "Restaurant"
                  : "Your delivery address",
            );
            // Only trusted, bundled SVG artwork; no remote/user HTML.
            this.element.innerHTML =
              kind === "rider"
                ? `<span class="rider-heading">${riderArtwork}</span>`
                : pinArtwork(kind);
            this.setMap(map);
          }
          onAdd() {
            this.getPanes().overlayMouseTarget.appendChild(this.element);
          }
          draw() {
            const pixel = this.getProjection().fromLatLngToDivPixel(
              new maps.LatLng(...this.point),
            );
            this.element.style.left = `${pixel.x}px`;
            this.element.style.top = `${pixel.y}px`;
            this.element.dataset.latitude = this.point[0];
            this.element.dataset.longitude = this.point[1];
          }
          move(point) {
            this.point = point;
            if (this.getProjection()) this.draw();
          }
          onRemove() {
            this.element.remove();
          }
        }
        const line = (color, weight, zIndex) =>
          new maps.Polyline({
            map,
            strokeColor: color,
            strokeWeight: weight,
            strokeOpacity: 1,
            clickable: false,
            zIndex,
          });
        const model = {
          map,
          maps,
          Pin,
          markers: {},
          lines: [
            line("#ffffff", 9, 1),
            line("#377bea", 5, 2),
            line("#acc2df", 5, 3),
          ],
          fitted: false,
        };
        model.fit = () => {
          const values = latest.current;
          const points = [
            values.kitchen,
            values.home,
            values.rider,
            ...(values.route?.points || []),
          ].filter(Boolean);
          const bounds = new maps.LatLngBounds();
          points.forEach((p) => bounds.extend(latLng(p)));
          if (points.length) map.fitBounds(bounds, 58);
        };
        engine.current = model;
        map.addListener("zoom_changed", () => {
          node.dataset.zoom = map.getZoom();
        });
        deadline = setTimeout(fail, 15000);
        map.addListener("tilesloaded", () => {
          if (active && !fatal) {
            clearTimeout(deadline);
            setState("ready");
          }
        });
        observer = new ResizeObserver(() => {
          const center = map.getCenter();
          maps.event.trigger(map, "resize");
          map.setCenter(center);
        });
        observer.observe(node);
      })
      .catch(fail);
    return () => {
      active = false;
      clearTimeout(deadline);
      observer?.disconnect();
      window.removeEventListener("ruchigo-map-auth-failure", fail);
      const model = engine.current;
      if (model) {
        cancelAnimationFrame(model.frame);
        Object.values(model.markers).forEach((marker) => marker.setMap(null));
        model.lines.forEach((line) => line.setMap(null));
        model.maps.event.clearInstanceListeners(model.map);
      }
      engine.current = null;
      node.replaceChildren();
    };
  }, [config.browser_key]);

  useEffect(() => {
    engine.current?.map.setOptions({
      gestureHandling: expanded ? "greedy" : "cooperative",
    });
  }, [expanded, state]);

  const kitchenLat = kitchen?.[0],
    kitchenLng = kitchen?.[1],
    homeLat = home?.[0],
    homeLng = home?.[1];
  const riderLat = rider?.[0],
    riderLng = rider?.[1],
    points = route?.points,
    progress = route?.progress;
  const sampleFresh = locationFreshness(timestamp).fresh;
  useEffect(() => {
    const model = engine.current;
    if (!model || state !== "ready") return;
    const { markers, Pin, lines } = model;
    for (const [kind, lat, lng] of [
      ["kitchen", kitchenLat, kitchenLng],
      ["home", homeLat, homeLng],
    ]) {
      if (lat != null && lng != null) {
        if (!markers[kind]) markers[kind] = new Pin(kind, [lat, lng]);
        else markers[kind].move([lat, lng]);
      } else if (markers[kind]) {
        markers[kind].setMap(null);
        delete markers[kind];
      }
    }
    const changedRoute = model.points !== points;
    if (changedRoute) {
      model.points = points;
      model.progress = null;
      lines[0].setPath((points || []).map(latLng));
      lines[1].setPath((points || []).map(latLng));
      lines[2].setPath([]);
    }
    cancelAnimationFrame(model.frame);
    const moving = (value) =>
      markers.rider?.element.classList.toggle("is-moving", value);
    const heading = (angle) => {
      if (!Number.isFinite(angle)) return;
      const previous = model.heading ?? angle;
      model.heading = previous + ((angle - previous + 540) % 360) - 180;
      markers.rider.element.querySelector(".rider-heading").style.transform =
        `rotate(${model.heading}deg)`;
    };
    moving(false);
    if (riderLat != null && riderLng != null) {
      const raw = [riderLat, riderLng],
        sample = Date.parse(timestamp),
        fresh = sampleFresh;
      const match =
        progress != null && points
          ? { ...positionOnRoute(points, progress), progress }
          : projectOnRoute(points, raw);
      const target = match?.point || raw,
        targetProgress = match?.progress;
      if (!markers.rider) {
        markers.rider = new Pin("rider", target);
        model.progress = targetProgress;
      }
      const marker = markers.rider,
        from = marker.point,
        fromProgress = model.progress;
      if (!Number.isFinite(model.sample) || sample >= model.sample) {
        const distance = metres(from, target);
        const canAnimate =
          fresh &&
          model.fresh &&
          Date.now() - model.sample < 15000 &&
          distance > 0.2 &&
          distance < 500 &&
          !changedRoute &&
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const draw = (fraction) => {
          if (points && targetProgress != null && fromProgress != null) {
            model.progress =
              fromProgress + (targetProgress - fromProgress) * fraction;
            const position = positionOnRoute(points, model.progress);
            marker.move(position.point);
            heading(position.bearing);
            lines[2].setPath(position.travelled.map(latLng));
          } else {
            marker.move(
              from.map((value, i) => value + (target[i] - value) * fraction),
            );
            if (distance > 0.2) heading(travelBearing(from, target));
            model.progress = targetProgress;
          }
        };
        if (canAnimate) {
          const start = performance.now();
          moving(true);
          const animate = (time) => {
            const fraction = Math.min(1, (time - start) / 950);
            draw(fraction);
            if (fraction < 1) model.frame = requestAnimationFrame(animate);
            else moving(false);
          };
          model.frame = requestAnimationFrame(animate);
        } else {
          marker.move(target);
          model.progress = targetProgress;
          if (targetProgress != null && points) {
            const position = positionOnRoute(points, targetProgress);
            heading(position.bearing);
            lines[2].setPath(position.travelled.map(latLng));
          } else if (distance > 0.2) heading(travelBearing(from, target));
        }
        model.sample = sample;
        model.fresh = fresh;
      }
      marker.element.style.opacity = fresh ? "1" : ".55";
      marker.element.dataset.receivedLatitude = riderLat;
      marker.element.dataset.receivedLongitude = riderLng;
    } else if (markers.rider) {
      markers.rider.setMap(null);
      delete markers.rider;
      model.sample = null;
      model.fresh = false;
    }
    if (!model.fitted) {
      model.fit();
      model.fitted = true;
    }
  }, [
    state,
    kitchenLat,
    kitchenLng,
    homeLat,
    homeLng,
    riderLat,
    riderLng,
    timestamp,
    sampleFresh,
    points,
    progress,
  ]);

  return (
    <div
      ref={wrapper}
      className={`delivery-map-wrap google-delivery-map-wrap ${expanded ? "is-expanded" : ""}`}
      data-map-state={state}
      data-route-points={points?.length || 0}
      role={expanded ? "dialog" : undefined}
      aria-modal={expanded || undefined}
      aria-label={expanded ? "Expanded delivery map" : undefined}
    >
      <div className="delivery-map-toolbar">
        <span>{mapLabel}</span>
        <div>
          <button
            type="button"
            className="icon-button"
            aria-label="Recenter delivery map"
            onClick={() => engine.current?.fit()}
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
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <Minimize2 size={19} /> : <Maximize2 size={19} />}
          </button>
        </div>
      </div>
      <div
        ref={canvas}
        className="delivery-google-map"
        role="region"
        aria-label="Map of restaurant, delivery address and shared rider location"
        aria-busy={state === "loading"}
      />
      {state === "loading" && (
        <div className="google-delivery-loading">
          <LoadingScreen inline message="Opening your map…" />
        </div>
      )}
      {state === "error" && (
        <div className="google-delivery-loading" role="alert">
          The map couldn’t load. Your order updates are still available.
        </div>
      )}
      {expanded && state === "ready" && arrival && (
        <div className="delivery-map-arrival" role="status">
          <strong>{arrival.headline}</strong>
          <span>{arrival.caption}</span>
        </div>
      )}
    </div>
  );
}
