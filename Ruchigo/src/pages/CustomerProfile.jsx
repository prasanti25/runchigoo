import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  ChevronRight,
  FileText,
  Heart,
  Home,
  LifeBuoy,
  LogOut,
  MapPin,
  Pencil,
  RotateCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Tag,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import ProfilePhoto from "../components/common/ProfilePhoto.jsx";
import {
  EmptyState,
  ErrorNotice,
  FoodImage,
  Modal,
} from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { apiRequest } from "../lib/api.js";
import { dateTime, money, statusLabel, useRemote } from "../lib/product.js";

const groups = [
  [
    "FOOD & ORDERS",
    [
      ["/profile", "Overview", User],
      ["/orders", "Your orders", ShoppingBag],
      ["/wishlist", "Saved dishes", Heart],
      ["/offers", "Offers & coupons", Tag],
    ],
  ],
  [
    "YOUR ACCOUNT",
    [
      ["/addresses", "Saved addresses", MapPin],
      ["/notifications", "Notifications", Bell],
      ["/settings", "Account settings", Settings],
    ],
  ],
  [
    "HELP & INFORMATION",
    [
      ["/support", "Help & support", LifeBuoy],
      ["/privacy", "Privacy policy", ShieldCheck],
      ["/terms", "Terms of use", FileText],
    ],
  ],
];

export default function CustomerProfile() {
  const { user, token, logout } = useAuth();
  const { loadCart } = useCart();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(null);
  const summary = useRemote("/orders/summary/", token);
  const orders = useRemote("/orders/", token);
  const addresses = useRemote("/addresses/", token);
  const saved = useRemote("/wishlist/", token);
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "Your account";
  const address =
    addresses.data?.results.find((entry) => entry.is_default) ||
    addresses.data?.results[0];
  const reorder = async (order) => {
    setBusy(order.id);
    try {
      await apiRequest(`/orders/${order.id}/reorder/`, {
        token,
        method: "POST",
      });
      await loadCart();
      navigate("/cart");
      toast.success("Added to your cart at current menu prices");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <>
      <Navbar />
      <main className="profile-page">
        <div className="container">
          <div className="profile-breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <span>My account</span>
          </div>
          <header className="profile-header">
            <ProfilePhoto />
            <div className="profile-heading">
              <p>MY ACCOUNT</p>
              <h1>{name}</h1>
              <div className="profile-contact">
                <span>{user.email}</span>
                <span>{user.phone || "Add a phone number"}</span>
              </div>
            </div>
            <button className="btn secondary" onClick={() => setEditing(true)}>
              <Pencil size={15} />
              Edit profile
            </button>
          </header>
          <div className="profile-layout">
            <aside className="profile-sidebar" aria-label="Account navigation">
              {groups.map(([title, links]) => (
                <div className="profile-nav-group" key={title}>
                  <p>{title}</p>
                  {links.map(([to, label, Icon]) => (
                    <Link
                      to={to}
                      key={to}
                      className={to === "/profile" ? "active" : ""}
                      aria-current={to === "/profile" ? "page" : undefined}
                    >
                      <Icon size={18} strokeWidth={1.7} />
                      <span>{label}</span>
                      <ChevronRight size={14} />
                    </Link>
                  ))}
                </div>
              ))}
              <button className="profile-signout" onClick={() => logout()}>
                <LogOut size={17} />
                Sign out
              </button>
            </aside>
            <div className="profile-body">
              <section
                className="profile-shortcuts"
                aria-label="Account shortcuts"
              >
                {[
                  ["/orders", ShoppingBag, summary.data?.total, "Orders"],
                  ["/wishlist", Heart, saved.data?.count, "Saved dishes"],
                  ["/addresses", MapPin, addresses.data?.count, "Addresses"],
                ].map(([to, Icon, count, label]) => (
                  <Link to={to} key={to}>
                    <Icon size={21} strokeWidth={1.6} />
                    <div>
                      <strong>{count ?? "—"}</strong>
                      <span>{label}</span>
                    </div>
                    <ChevronRight size={15} />
                  </Link>
                ))}
              </section>
              <ErrorNotice
                error={
                  summary.error ||
                  orders.error ||
                  addresses.error ||
                  saved.error
                }
                onRetry={() => {
                  summary.reload();
                  orders.reload();
                  addresses.reload();
                  saved.reload();
                }}
              />
              <section className="profile-section">
                <div className="profile-section-title">
                  <h2>Recent orders</h2>
                  <Link to="/orders">
                    View all <ArrowRight size={14} />
                  </Link>
                </div>
                {orders.loading && (
                  <p className="muted p-6" role="status">
                    Loading your orders…
                  </p>
                )}
                {orders.data?.results.slice(0, 2).map((order) => (
                  <article className="profile-order" key={order.id}>
                    <div className="profile-order-top">
                      <FoodImage
                        item={{
                          name:
                            order.items[0]?.name ||
                            order.restaurant_detail?.name,
                          image: order.restaurant_detail?.image,
                        }}
                      />
                      <div>
                        <h3>{order.restaurant_detail?.name}</h3>
                        <p>
                          {order.restaurant_detail?.city} ·{" "}
                          {dateTime(order.created_at)}
                        </p>
                        <span className={`status-pill ${order.status}`}>
                          {statusLabel(order.status)}
                        </span>
                      </div>
                      <strong>{money(order.total)}</strong>
                    </div>
                    <p className="profile-order-items">
                      {order.items
                        .map((item) => `${item.quantity} × ${item.name}`)
                        .join(", ")}
                    </p>
                    <div className="profile-order-actions">
                      <Link
                        className="btn secondary"
                        to={`/tracking/${order.id}`}
                      >
                        {["delivered", "cancelled"].includes(order.status)
                          ? "View order"
                          : "Track order"}
                        <ChevronRight size={14} />
                      </Link>
                      {order.status === "delivered" && (
                        <button
                          className="btn primary"
                          disabled={busy === order.id}
                          onClick={() => reorder(order)}
                        >
                          <RotateCcw size={14} />
                          {busy === order.id ? "Adding…" : "Order again"}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
                {orders.data?.count === 0 && (
                  <EmptyState
                    title="Your first order starts here"
                    description="Explore local restaurants and find something you’ll love."
                    to="/search"
                    action="Explore restaurants"
                  />
                )}
              </section>
              <div className="profile-lower-grid">
                <section className="profile-section">
                  <div className="profile-section-title">
                    <h2>Delivery address</h2>
                    <Link to="/addresses">
                      Manage <ChevronRight size={14} />
                    </Link>
                  </div>
                  <div className="profile-address">
                    <Home size={22} strokeWidth={1.5} />
                    <div>
                      <h3>
                        {address
                          ? address.label || "Saved address"
                          : "Where should we deliver?"}
                      </h3>
                      <p>
                        {address
                          ? [
                              address.line1,
                              address.line2,
                              address.city,
                              address.postal_code,
                            ]
                              .filter(Boolean)
                              .join(", ")
                          : "Save home, work or another place for your next order."}
                      </p>
                      {address?.is_default && <span>DEFAULT ADDRESS</span>}
                      {!address && (
                        <Link className="text-link mt-3" to="/addresses">
                          Add an address
                        </Link>
                      )}
                    </div>
                  </div>
                </section>
                <section className="profile-help-card">
                  <LifeBuoy size={24} strokeWidth={1.5} />
                  <h2>A little help, right here.</h2>
                  <p>
                    Order issues or account questions? Keep the conversation in
                    one place.
                  </p>
                  <Link to="/support">
                    Get help <ArrowRight size={15} />
                  </Link>
                </section>
              </div>
              <nav
                className="profile-mobile-links"
                aria-label="More account options"
              >
                {groups
                  .slice(1)
                  .flatMap(([, links]) => links)
                  .map(([to, label, Icon]) => (
                    <Link key={to} to={to}>
                      <Icon size={19} />
                      <span>{label}</span>
                      <ChevronRight size={16} />
                    </Link>
                  ))}
                <button onClick={() => logout()}>
                  <LogOut size={19} />
                  <span>Sign out</span>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </main>
      {editing && <EditProfile onClose={() => setEditing(false)} />}
    </>
  );
}

function EditProfile({ onClose }) {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    phone: user.phone || "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form
        className="form-stack"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            await updateProfile(form);
            toast.success("Profile updated");
            onClose();
          } catch (err) {
            setError(err.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {[
          ["first_name", "First name", "given-name"],
          ["last_name", "Last name", "family-name"],
          ["phone", "Phone number", "tel"],
        ].map(([key, label, autocomplete]) => (
          <label className="field" key={key}>
            <span>{label}</span>
            <input
              type={key === "phone" ? "tel" : "text"}
              autoComplete={autocomplete}
              maxLength={key === "phone" ? 20 : 150}
              value={form[key]}
              onChange={(event) =>
                setForm({ ...form, [key]: event.target.value })
              }
            />
          </label>
        ))}
        <p className="form-help">
          To change your email or password, visit{" "}
          <Link className="text-link" to="/settings">
            Account settings
          </Link>
          .
        </p>
        <ErrorNotice error={error} />
        <button className="btn primary" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </Modal>
  );
}
