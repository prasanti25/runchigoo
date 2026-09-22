import { lazy, Suspense, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  Compass,
  Heart,
  HelpCircle,
  LocateFixed,
  LogOut,
  MapPin,
  Menu,
  Search,
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
import { ErrorNotice, Modal } from "./product/UI.jsx";
import LoadingScreen from "./common/LoadingScreen.jsx";
import { deliveryLocationFromAddress } from "../lib/addressLocation.js";
import BrandLogo from "./common/BrandLogo.jsx";
import AssistantIcon from "./common/AssistantIcon.jsx";
import UserAvatar from "./common/UserAvatar.jsx";
import NotificationBell from "./common/NotificationBell.jsx";
import { canOpenAdminRoute } from "../lib/adminAccess.js";

const AddressLocationPicker = lazy(
  () => import("./product/AddressLocationPicker.jsx"),
);
const AddressForm = lazy(() => import("./product/AddressForm.jsx"));

export default function Navbar() {
  const { user, role, token, isAuthenticated, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useDeliveryLocation();
  const navigate = useNavigate();
  const [locationOpen, setLocationOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [addressDraft, setAddressDraft] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [city, setCity] = useState("");
  const { data } = useRemote(locationOpen ? "/discovery/" : null);
  const savedAddresses = useRemote(
    locationOpen && token && role === "customer" ? "/addresses/" : null,
    token,
  );
  const count = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const partner = isAuthenticated && role !== "customer";
  const dashboard = partner ? `/${role}-dashboard` : "/profile";
  const selectCity = (name) => {
    saveDeliveryLocation({ city: name, label: name || "Explore all cities" });
    setLocationOpen(false);
  };
  const locate = () => {
    setLocationOpen(false);
    setPickerOpen(true);
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
            title={
              location.formatted_address ||
              location.label ||
              "Choose delivery location"
            }
            aria-label={`Delivery location: ${location.label || location.city || "Choose your location"}`}
            onClick={() => setLocationOpen(true)}
          >
            <MapPin size={17} />
            <span>
              <small>
                {location.city && !location.confirmed
                  ? "EXPLORING"
                  : "DELIVERING TO"}
              </small>
              <strong>
                {location.locality ||
                  location.label ||
                  location.city ||
                  "Choose your location"}
              </strong>
              {location.formatted_address && (
                <span className="location-address-detail">
                  {location.formatted_address}
                </span>
              )}
            </span>
            <ChevronDown size={14} />
          </button>
          <nav className="desktop-nav" aria-label="Main navigation">
            <NavLink to="/for-you">
              <AssistantIcon size={21} />
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
            ["/for-you", "For you", AssistantIcon],
            ["/orders", "Orders", ShoppingBag],
          ].map(([to, label, Icon]) => (
            <NavLink
              end={to === "/"}
              to={to}
              key={to}
              className={to === "/for-you" ? "mobile-feed-link" : undefined}
            >
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
                    "partner-accounts",
                    "orders",
                    "payments",
                    "offers",
                    "catalog",
                    "delivery-zones",
                    "order-policy",
                    "reports",
                    "reviews",
                    "activity",
                    "profile",
                    "access",
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
            ]
              .filter(
                (page) =>
                  role !== "admin" || canOpenAdminRoute(user, `/admin-${page}`),
              )
              .map((page) => (
                <option key={page} value={`/${role}-${page}`}>
                  {page.replaceAll("-", " ")}
                </option>
              ))}
            {(role !== "admin" || canOpenAdminRoute(user, "/support")) && (
              <option value="/support">Support</option>
            )}
          </select>
        </div>
      )}
      {locationOpen && (
        <Modal
          title="Where should we deliver?"
          onClose={() => setLocationOpen(false)}
        >
          <p className="muted">
            Set your doorstep location or choose a saved address.
          </p>
          <button className="btn secondary w-full mt-5" onClick={locate}>
            <LocateFixed size={18} />
            Use my current location
          </button>
          <p className="location-privacy-note">
            Allow device location to open the map and look up your address. Your
            pin is shared with our address-lookup service; nothing is saved
            until you confirm.
          </p>
          {role === "customer" && token && (
            <div className="location-saved-addresses">
              <div className="flex-row between">
                <p className="eyebrow">SAVED ADDRESSES</p>
                <button
                  className="text-link"
                  onClick={() => {
                    setLocationOpen(false);
                    setAddressDraft({});
                  }}
                >
                  Add new
                </button>
              </div>
              {savedAddresses.loading ? (
                <LoadingScreen inline message="Loading your addresses…" />
              ) : (
                <ErrorNotice
                  error={savedAddresses.error}
                  onRetry={savedAddresses.reload}
                />
              )}
              {(savedAddresses.data?.results || []).map((address) => (
                <button
                  className="location-saved-address"
                  key={address.id}
                  onClick={() => {
                    saveDeliveryLocation(deliveryLocationFromAddress(address));
                    setLocationOpen(false);
                  }}
                >
                  <MapPin size={19} />
                  <span>
                    <strong>{address.label}</strong>
                    <small>
                      {[address.line1, address.line2, address.city]
                        .filter(Boolean)
                        .join(", ")}
                    </small>
                  </span>
                  <ArrowRight size={16} />
                </button>
              ))}
              {savedAddresses.data?.count === 0 && (
                <p className="form-help">
                  Save your home or work address for quicker checkout.
                </p>
              )}
              {savedAddresses.data?.next && (
                <Link
                  className="text-link"
                  to="/addresses"
                  onClick={() => setLocationOpen(false)}
                >
                  Manage all saved addresses
                </Link>
              )}
            </div>
          )}
          <label className="field mt-5">
            <span>Browse restaurants by city</span>
            <input
              placeholder="Type a city…"
              value={city}
              onChange={(event) => setCity(event.target.value)}
            />
          </label>
          <p className="form-help">
            City selection is for browsing only. Delivery needs your full
            address and entrance pin.
          </p>
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
      {pickerOpen && (
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
            initial={location}
            onClose={() => setPickerOpen(false)}
            onManual={(next) => {
              setPickerOpen(false);
              setAddressDraft(next || {});
            }}
            onConfirm={(next) => {
              setPickerOpen(false);
              setAddressDraft(next);
            }}
          />
        </Suspense>
      )}
      {addressDraft && (
        <Suspense
          fallback={
            <Modal
              title="Add delivery details"
              onClose={() => setAddressDraft(null)}
            >
              <LoadingScreen inline message="Opening address details…" />
            </Modal>
          }
        >
          <AddressForm
            localOnly={!(role === "customer" && token)}
            prefill={addressDraft}
            onSaved={savedAddresses.reload}
            onClose={() => setAddressDraft(null)}
          />
        </Suspense>
      )}
    </>
  );
}
