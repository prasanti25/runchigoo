import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Compass,
  Heart,
  Globe2,
  HelpCircle,
  LocateFixed,
  LogOut,
  MapPin,
  Menu,
  Search,
  Sparkles,
  ShoppingBag,
  Tag,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import {
  saveDeliveryLocation,
  useDeliveryLocation,
  useRemote,
} from "../lib/product.js";
import { Modal } from "./product/UI.jsx";
import BrandLogo from "./common/BrandLogo.jsx";
import UserAvatar from "./common/UserAvatar.jsx";
import NotificationBell from "./common/NotificationBell.jsx";
import { apiRequest } from "../lib/api.js";

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useDeliveryLocation();
  const navigate = useNavigate();
  const [locationOpen, setLocationOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [city, setCity] = useState("");
  const [geoMessage, setGeoMessage] = useState("");
  const [locating, setLocating] = useState(false);
  const [networkBusy, setNetworkBusy] = useState(false);
  const [networkLocation, setNetworkLocation] = useState(null);
  const [networkError, setNetworkError] = useState("");
  const { data } = useRemote(locationOpen ? "/discovery/" : null);
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const partner = isAuthenticated && role !== "customer";
  const dashboard = partner ? `/${role}-dashboard` : "/profile";
  const selectCity = (name) => {
    saveDeliveryLocation({ city: name, label: name || "Explore all cities" });
    setLocationOpen(false);
  };
  const locateNetwork = async () => {
    setNetworkBusy(true);
    setNetworkError("");
    setNetworkLocation(null);
    try {
      setNetworkLocation(await apiRequest("/location/approximate/"));
    } catch (error) {
      setNetworkError(error.message);
    } finally {
      setNetworkBusy(false);
    }
  };
  const locate = () => {
    if (!navigator.geolocation) {
      setGeoMessage(
        "Your browser doesn’t support location. Choose a city below.",
      );
      return;
    }
    setLocating(true);
    setGeoMessage("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveDeliveryLocation({
          ...location,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoMessage(
          "Location saved. Choose your delivery city below to see available restaurants.",
        );
        setLocating(false);
      },
      () => {
        setGeoMessage(
          "Location permission wasn’t granted. You can choose your city below.",
        );
        setLocating(false);
      },
      { timeout: 10000, maximumAge: 300000 },
    );
  };
  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="brand" aria-label="RuchiGo home">
            <BrandLogo />
          </Link>
          <button
            className="location-trigger"
            onClick={() => setLocationOpen(true)}
          >
            <MapPin size={17} />
            <span>
              <small>DELIVERING TO</small>
              <strong>{location.city || "Choose your city"}</strong>
            </span>
            <ChevronDown size={14} />
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/for-you">
              <Sparkles size={18} />
              For you
            </NavLink>
            <NavLink to="/search">
              <Search size={18} />
              Explore
            </NavLink>
            <NavLink to="/offers">
              <Tag size={18} />
              Offers
            </NavLink>
            <NavLink to="/support">
              <HelpCircle size={18} />
              Help
            </NavLink>
          </nav>
          <div className="header-actions">
            <NotificationBell />
            {!partner && (
              <Link
                to="/cart"
                className="header-cart"
                aria-label={`Cart, ${count} items`}
              >
                <ShoppingBag size={20} />
                <span className="desktop-label">Cart</span>
                {count > 0 && <b>{count}</b>}
              </Link>
            )}
            <button
              className="account-button"
              aria-label="Open account menu"
              aria-expanded={accountOpen}
              onClick={() => setAccountOpen(!accountOpen)}
            >
              {isAuthenticated ? (
                <UserAvatar user={user} className="nav-avatar" />
              ) : (
                <User size={20} />
              )}
              <span className="desktop-label">
                {isAuthenticated ? user?.first_name || "Account" : "Sign in"}
              </span>
              <ChevronDown size={13} />
            </button>
          </div>
        </div>
      </header>
      {accountOpen && (
        <>
          <button
            className="menu-scrim"
            aria-label="Close account menu"
            onClick={() => setAccountOpen(false)}
          />
          <div className="account-menu">
            {isAuthenticated ? (
              <>
                <p className="eyebrow">{user?.email}</p>
                {[
                  [
                    dashboard,
                    partner ? "Your dashboard" : "Your profile",
                    User,
                  ],
                  [
                    partner ? "/settings" : "/orders",
                    partner ? "Settings" : "Your orders",
                    ShoppingBag,
                  ],
                  ["/notifications", "Notifications", Bell],
                  ...(!partner
                    ? [
                        ["/wishlist", "Saved dishes", Heart],
                        ["/addresses", "Delivery addresses", MapPin],
                      ]
                    : []),
                ].map(([to, label, Icon]) => (
                  <Link key={to} to={to} onClick={() => setAccountOpen(false)}>
                    <Icon size={17} />
                    {label}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setAccountOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <h3>Good food awaits.</h3>
                <p className="muted">
                  Sign in to order and save your favourites.
                </p>
                <Link
                  className="btn primary"
                  to="/login"
                  onClick={() => setAccountOpen(false)}
                >
                  Sign in
                  <ArrowRight size={17} />
                </Link>
                <Link to="/register" onClick={() => setAccountOpen(false)}>
                  Create an account
                </Link>
              </>
            )}
          </div>
        </>
      )}
      {!partner && (
        <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
          {[
            ["/", "Home", Compass],
            ["/search", "Explore", Search],
            ["/for-you", "For you", Sparkles],
            ["/orders", "Orders", ShoppingBag],
          ].map(([to, label, Icon]) => (
            <NavLink end={to === "/"} to={to} key={to}>
              <Icon size={21} />
              <span>{label}</span>
            </NavLink>
          ))}
          <button onClick={() => setAccountOpen(!accountOpen)}>
            <User size={21} />
            <span>Account</span>
          </button>
        </nav>
      )}
      {partner && (
        <div className="partner-mobile-bar">
          <Menu size={18} />
          <select
            aria-label="Partner navigation"
            value=""
            onChange={(event) => navigate(event.target.value)}
          >
            <option value="">Navigate workspace</option>
            {[
              "dashboard",
              ...(role === "admin"
                ? [
                    "users",
                    "restaurants",
                    "delivery-partners",
                    "orders",
                    "payments",
                    "offers",
                    "reports",
                    "reviews",
                    "activity",
                    "profile",
                  ]
                : role === "restaurant"
                  ? [
                      "menu",
                      "orders",
                      "earnings",
                      "analytics",
                      "profile",
                      "offers",
                    ]
                  : ["orders", "navigation", "earnings", "profile"]),
            ].map((page) => (
              <option key={page} value={`/${role}-${page}`}>
                {page.replaceAll("-", " ")}
              </option>
            ))}
            <option value="/support">Support</option>
          </select>
        </div>
      )}
      {locationOpen && (
        <Modal
          title="Where’s your next meal?"
          onClose={() => setLocationOpen(false)}
        >
          <p className="muted">
            Choose a city to discover restaurants serving your area.
          </p>
          <button
            className="btn secondary w-full mt-5"
            onClick={locate}
            disabled={locating || networkBusy}
          >
            <LocateFixed size={18} />
            {locating ? "Finding your location…" : "Use my current location"}
          </button>
          <button
            className="location-network-button"
            onClick={locateNetwork}
            disabled={networkBusy || locating}
          >
            <Globe2 size={18} />
            <span>
              {networkBusy
                ? "Estimating your city…"
                : "Use approximate network location"}
            </span>
            <ArrowRight size={16} />
          </button>
          <p className="location-privacy-note">
            Your network can help suggest a city. It may not be exact,
            especially when using a VPN.{" "}
            <Link to="/privacy#location">How location is used</Link>
          </p>
          {networkError && (
            <p className="error-notice" role="alert">
              {networkError}
            </p>
          )}
          {networkLocation && (
            <div className="network-location-result" role="status">
              <span className="eyebrow">SUGGESTED CITY</span>
              <strong>
                {networkLocation.city}
                {networkLocation.region &&
                networkLocation.region.toLowerCase() !==
                  networkLocation.city.toLowerCase()
                  ? `, ${networkLocation.region}`
                  : ""}
              </strong>
              <p>This is an approximate location. Please confirm your city.</p>
              {networkLocation.service_city ? (
                <button
                  className="btn primary"
                  onClick={() => selectCity(networkLocation.service_city)}
                >
                  Use {networkLocation.service_city}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <p>
                  No open RuchiGo restaurants are currently listed in this city.
                  Choose an available city below to explore.
                </p>
              )}
            </div>
          )}
          {geoMessage && (
            <p className="form-help" role="status">
              {geoMessage}
            </p>
          )}
          <label className="field mt-5">
            <span>Search available cities</span>
            <input
              placeholder="Type a city…"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </label>
          <div className="city-list">
            {(data?.cities || [])
              .filter((name) => name.toLowerCase().includes(city.toLowerCase()))
              .map((name) => (
                <button key={name} onClick={() => selectCity(name)}>
                  <MapPin size={18} />
                  {name}
                  <ArrowRight size={17} />
                </button>
              ))}
            {data && !data.cities.length && (
              <p className="muted">
                Restaurants will appear here as they become available.
              </p>
            )}
            <button onClick={() => selectCity("")}>
              <Compass size={18} />
              Explore all cities
              <ArrowRight size={17} />
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}
