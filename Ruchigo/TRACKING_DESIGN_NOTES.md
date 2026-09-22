# Tracking and desktop experience — 22 September 2026

## 23 September update — Google delivery map

Current address and rider maps use the configured Google Maps JavaScript key.
The separate server key handles Geocoding and Routes API; only the restricted
browser key is public. Owned live GPS reads run independently every second;
fresh owned road routes refresh every 30 seconds, targeting the kitchen before
pickup and the saved order-address snapshot after pickup. Routes use DRIVE
without live traffic, so travel estimates are not exact arrival guarantees.
The original scooter is drawn with Google OverlayView at a centre anchor and
rotated to road bearing. Close GPS points may match the road within 25m; large,
off-route, stale or missing updates are not fabricated. Stale age is now 15s.

The labelled, read-only `/demo/delivery` is intentionally available in production
at the user's request. Two freshly requested Google road legs between public
example pins drive its accelerated 50-second replay. It never calls real order
endpoints or requests device GPS. Google map branding remains visible; fullscreen
keeps its ETA, recenter and native zoom/pinch controls. The app does not store
Google route responses in its database/cache or provide historical rider traces.
See README and VERIFICATION_REPORT for current configuration and test evidence.

The remainder of this file records the **22 September OSM implementation** and
its then-current release state; it is not a description of the Google upgrade.

The supplied Zomato screenshots are interaction references, not assets to copy or a request to turn the desktop website into a phone layout. RuchiGo retains its supplied brand logo. Food photography is drawn from the existing menu catalog; no invented prices, reviews, offers or route positions are added.

## Research used

- [Leaflet reference](https://leafletjs.com/reference.html): `divIcon` for the custom SVG scooter/rider, `Marker.setLatLng` for location changes, `invalidateSize` for responsive layout, and `tileerror` for unavailable map tiles. Leaflet is lazy-loaded on tracking routes.
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/): HTTPS tiles, visible attribution, browser caching, an origin Referer, no bulk/offline downloads or cache-busting. The service is best-effort with **no SLA**. Commercial launch should provision capacity/terms with a suitable map provider.
- [MDN watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition): location access requires permission and HTTPS (localhost is allowed); the watch is cleared on teardown. A browser tab is not a reliable background delivery-tracking service.

## Actual behavior

- An original, small vector scooter/rider carries a RuchiGo delivery bag. It is an in-map marker, not an emoji, borrowed brand asset or raster logo replacement.
- The courier sends both coordinates during an assigned/out-for-delivery order; only the assigned courier can update them. The server records `location_updated_at`, independently of pickup/status timestamps. Empty updates cannot make an old position look fresh. Old records start without an asserted GPS timestamp.
- Customers poll their own order every 10 seconds. The map retains its instance and user zoom. Nearby fresh GPS samples interpolate for 1.2 seconds; stale samples, large jumps/reconnects and reduced-motion users snap to received coordinates. There is **no simulated journey, predicted route, road snapping or fake traffic ETA**. Missing address/restaurant coordinates are not invented.
- Location freshness expires after 60 seconds. A coordinate is still the last shared point, not evidence that the rider remains there. Stopping sharing stops new samples; stored coordinates are not erased by that action.
- Map loading is opt-in. Tile providers receive IP/origin/map-area requests; order records are not sent to them. Required attribution stays visible. Failed tiles/configuration leave the order timeline usable.
- A desktop-first feed places meal cards beside the chat composer; smaller viewports stack them. Hero/feed carousels auto-advance every 3.5 seconds with a 400ms transition, stop on keyboard interaction and hover, and respect reduced motion/offscreen tabs. The visible interface has only small navigation dots — **no play/pause or round arrow toolbar**. Login/register use a matching four-photo crossfade at 3.5 seconds, without remounting or clearing the form.
- Reviews are offered on delivered-order details, history and a dismissible home reminder. Rating is explicitly chosen (no preset five stars); optional feedback is saved and editable. Test reviews are uniquely marked and removed by exact record ID.
- Help & Support receives an explicit owned order ID. Its RuchiGo assistant shows typing while a request is pending, not a fabricated human agent or activity timer. Gemini can classify unfamiliar English/Hinglish support topics; factual replies and action links remain constrained. Refunds, cancellations and payment actions are never claimed as completed by chat. Staff tickets are a distinct, explicit handoff.

## Configuration and deployment

Apply migrations **0012–0014** before running this local increment on another database. The previously deployed release used migrations through 0011; no deployment is performed by this work.

`GET /api/v1/location/map-config/` reads backend `MAP_TILE_URL`, `MAP_ATTRIBUTION`, `MAP_ATTRIBUTION_URL`, and `MAP_PROVIDER`. Defaults are standard OpenStreetMap raster tiles. These four values are intentionally public; only a provider's origin-restricted **public browser** token may appear in its tile URL. Never use the server-only Gemini/IPinfo credentials as map keys. Server configuration can change the tile provider without rebuilding the frontend.

Before launch: contracted map capacity, real-device GPS/permission testing, operational dispatch, accurate merchant/address pins, production database concurrency, background tracking strategy, support staffing, payment/refund reconciliation and the broader release blockers in `PRODUCT_STATUS.md` still need work.

## Local delivery replay and map controls

`/demo/delivery` is a development-only, explicitly labelled simulation. One click
starts a 50-second lifecycle without login, order creation or manual dispatch.
The route and page are excluded from production output. Timers pause in hidden
tabs, clean up on navigation and stop after completion. Restart resets all stages.
An accelerated **demo** arrival estimate is not a real traffic ETA. Real tracking
still abstains from historical ETA when there is insufficient evidence.

The sample route is actual road geometry returned by OSRM using OpenStreetMap,
from Inner Circle to Hailey Road, New Delhi (1.5641 km). It was retrieved once on
22 September 2026 and bundled in the development module; it contains no customer
coordinates and does not repeatedly call the public routing service. The rider
interpolates through route vertices rather than cutting straight across turns.
An original top-down SVG is anchored at its centre on the road, rotates toward
the segment bearing and animates tyre treads only while moving. The existing
RuchiGo brand logo is unchanged. No routing geometry is invented for real orders.

The revised replay adds a separate acceptance-to-kitchen leg: 1,801.4 metres /
213.9 routing seconds, followed by the original 1,564.1 metres / 176.3 seconds
to the doorstep. The rider starts away from the restaurant at acceptance,
approaches it while cooking continues, stops to collect, confirms pickup, and
only then switches to the delivery leg. The two geometries meet at the same
kitchen coordinate, avoiding teleporting between legs. Ten planned service
seconds run per preview second. Estimated minutes account for remaining route
duration, preparation (overlapping the approach), collection and departure;
they are not an arbitrary countdown, live traffic or a delivery guarantee.
This does not implement automated dispatch or concurrent kitchen/dispatch
workflow changes in real orders; it is an explicitly isolated demonstration.

Shared map controls support expansion to the viewport, drag, two-finger pinch,
zoom buttons, recentering, Escape, focus containment/restoration and reduced
motion. The same Leaflet instance, zoom and geographic centre survive expansion;
background content is inert until collapse. Provider attribution remains visible.
Unpinned pending orders show a compact kitchen-confirmation state, not a large
empty “Waiting for a location” map.

The muted base-map styling and blue route are visual improvements to
**OpenStreetMap**. Google Maps is not integrated by these changes; it requires
its licensed JavaScript renderer, billing-enabled project and browser/API
restrictions. Server-only Gemini/IPinfo credentials must never be repurposed.
