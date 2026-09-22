import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Clock3,
  MapPin,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import LiveDeliveryMap from "../components/product/LiveDeliveryMap.jsx";
import { apiRequest } from "../lib/api.js";
import {
  deliveryDemoFrame,
  demoDuration,
  demoStages,
} from "../lib/deliveryDemo.js";
import "./DeliveryDemo.css";

export default function DeliveryDemo() {
  const [run, setRun] = useState(0);
  const [clock, setClock] = useState({ elapsed: 0, now: 0 });
  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!run) return;
    let elapsed = 0;
    const timer = window.setInterval(() => {
      // Keep all stages visible if the user leaves the tab; never jump to a
      // completed delivery while they are away. Cleanup also handles StrictMode.
      if (document.hidden) return;
      elapsed = Math.min(demoDuration, elapsed + 1);
      setClock({ elapsed, now: Date.now() });
      if (elapsed === demoDuration) window.clearInterval(timer);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [run]);
  const start = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const data =
        journey ||
        (await apiRequest("/location/demo-route/", {
          signal: AbortSignal.timeout(20000),
        }));
      setJourney(data);
      setClock({ elapsed: 0, now: Date.now() });
      setRun((value) => value + 1);
    } catch {
      setError("The preview route couldn’t load. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const frame = deliveryDemoFrame(clock.elapsed, clock.now, journey);
  const active = demoStages[frame.stage];
  const complete = clock.elapsed === demoDuration;
  return (
    <>
      <Navbar />
      <main className="customer-main delivery-demo-page">
        <div className="container">
          <div className="demo-topline">
            <Link to="/" className="text-link">
              <ArrowLeft size={16} /> Back to RuchiGo
            </Link>
            <span className="demo-badge">
              <ShieldCheck size={14} /> Demo · simulated delivery
            </span>
          </div>
          <header className="demo-heading">
            <div aria-live="polite" aria-atomic="true">
              <p className="eyebrow">
                {run ? "YOUR DELIVERY JOURNEY" : "TAKE A TEST DELIVERY"}
              </p>
              <h1>
                {run ? active.title : "From the kitchen. To your doorstep."}
              </h1>
              <p>
                {run
                  ? active.detail
                  : "See the whole journey in 50 seconds. No order, login or rider assignment needed."}
              </p>
            </div>
            {run > 0 && (
              <button className="btn secondary" onClick={start}>
                <RotateCcw size={16} /> Restart demo
              </button>
            )}
          </header>
          <div
            className="demo-layout"
            data-demo-status={run ? active.status : "idle"}
          >
            <div className="demo-primary">
              {run ? (
                <>
                  <LiveDeliveryMap
                    key={run}
                    order={frame.order}
                    initiallyEnabled
                    route={{ points: frame.route, progress: frame.progress }}
                    mapLabel="Demo · simulated delivery"
                    statusTitle={frame.statusTitle}
                    arrival={{
                      headline: complete
                        ? "Delivered"
                        : frame.remainingSeconds < 60
                          ? "Arriving in less than a minute"
                          : `Arriving in about ${frame.etaMinutes} mins`,
                      caption:
                        frame.leg === "pickup" && frame.pickupMinutes > 0
                          ? `Partner reaching kitchen in about ${frame.pickupMinutes} min · accelerated demo estimate`
                          : "Route + pickup estimate · accelerated demo · no live traffic",
                    }}
                  />
                  <div
                    className={`demo-journey-note ${complete ? "complete" : ""}`}
                  >
                    {complete ? <Check size={22} /> : <Clock3 size={22} />}
                    <div>
                      <strong>
                        {complete
                          ? "That’s the complete delivery journey."
                          : `Demo finishes in ${demoDuration - clock.elapsed} seconds`}
                      </strong>
                      <p>
                        {complete
                          ? "You can replay it anytime. Your orders, payments and reviews are untouched."
                          : "Kitchen updates, pickup and rider movement happen automatically."}
                      </p>
                    </div>
                  </div>
                  <p className="demo-route-credit">
                    Example road journey in New Delhi:{" "}
                    {(journey.pickup.distance_metres / 1000).toFixed(2)} km to
                    the kitchen, then{" "}
                    {(journey.delivery.distance_metres / 1000).toFixed(2)} km to
                    the doorstep. Accelerated simulation using road estimates,
                    not a live rider. No live traffic included.
                  </p>
                </>
              ) : (
                <section className="demo-intro">
                  <div className="demo-intro-art" aria-hidden="true">
                    <img
                      src="/tracking/ruchigo-rider.svg"
                      alt=""
                      width="190"
                      height="163"
                    />
                  </div>
                  <h2>Your delivery, end to end.</h2>
                  <p>
                    Kitchen updates. A road-following scooter. Your meal
                    arriving at the door. Watch it all happen here.
                  </p>
                  <button
                    type="button"
                    className="btn dark"
                    onClick={start}
                    disabled={loading}
                  >
                    {loading ? "Preparing your route…" : "Watch delivery"}{" "}
                    <ArrowRight size={17} />
                  </button>
                  {error && <p role="alert">{error}</p>}
                  <small>
                    Starting loads third-party map tiles. No device location is
                    requested. <Link to="/privacy#location">Map privacy</Link>
                  </small>
                </section>
              )}
              <section className="demo-meal">
                <img
                  src="/food/biryani.webp"
                  width="76"
                  height="76"
                  alt="Biryani in the sample meal"
                />
                <div>
                  <p className="eyebrow">SAMPLE MEAL</p>
                  <h2>A good-food kind of delivery.</h2>
                  <p>1 × Biryani · RuchiGo demo kitchen</p>
                </div>
                <ChefHat size={22} />
              </section>
            </div>
            <aside className="demo-sidebar">
              <section className="demo-timeline-card">
                <div className="demo-card-title">
                  <h2>Every step, in sight.</h2>
                  <span>50 sec preview</span>
                </div>
                <ol className="demo-timeline" aria-label="Demo delivery stages">
                  {demoStages.map((entry, index) => (
                    <li
                      key={entry.status}
                      className={run && index <= frame.stage ? "done" : ""}
                      aria-current={
                        run && index === frame.stage ? "step" : undefined
                      }
                    >
                      <span className="demo-step-dot">
                        {run && index <= frame.stage ? (
                          <Check size={13} />
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div>
                        <strong>{entry.label}</strong>
                        {run > 0 && index === frame.stage && (
                          <small>{complete ? "All done" : "Now"}</small>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
              <section className="demo-destination">
                <MapPin size={20} />
                <div>
                  <strong>A sample doorstep, not your address</strong>
                  <p>
                    The demo uses example locations in New Delhi. Your real
                    order needs kitchen updates and a partner sharing GPS.
                  </p>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
