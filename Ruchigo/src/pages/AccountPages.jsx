import { useState } from "react";
import { couponTitle, couponBenefitTerms } from "../lib/couponLabels.js";
import LoadingScreen from "../components/common/LoadingScreen.jsx";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bell,
  Check,
  Heart,
  LifeBuoy,
  LogOut,
  MapPin,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import {
  EmptyState,
  ErrorNotice,
  FoodCard,
  Skeleton,
} from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import {
  dateTime,
  money,
  orderNumber,
  statusLabel,
  saveDeliveryLocation,
  useDeliveryLocation,
  useRemote,
} from "../lib/product.js";
import { AddressForm } from "./CheckoutPages.jsx";
import { WorkspaceFrame } from "../components/product/Workspace.jsx";
import { useInbox } from "../context/InboxContext.jsx";
import { notificationTarget } from "../lib/notifications.js";

function AccountFrame({
  eyebrow = "MADE FOR YOUR EVERYDAY",
  title,
  description,
  action,
  children,
}) {
  return (
    <>
      <Navbar />
      <main className="customer-main">
        <div className="container">
          <header className="page-heading account-heading">
            <div>
              <p className="eyebrow">{eyebrow}</p>
              <h1>{title}</h1>
              <p className="muted mt-3">{description}</p>
            </div>
            {action}
          </header>
          {children}
        </div>
      </main>
    </>
  );
}

function Pages({ data, page, onChange }) {
  if (!data || (!data.next && !data.previous)) return null;
  return (
    <div className="pagination">
      <button
        className="btn secondary"
        disabled={!data.previous}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span>Page {page}</span>
      <button
        className="btn secondary"
        disabled={!data.next}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
}

export function ProfilePage() {
  const { user, token, logout } = useAuth();
  const orders = useRemote("/orders/", token);
  const summary = useRemote("/orders/summary/", token);
  const spent =
    summary.data?.by_status.find((row) => row.status === "delivered")?.value ||
    0;
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") || "Food lover";
  const links = [
    [
      "/orders",
      "Your orders",
      "Track a meal or revisit a favourite.",
      ShoppingBag,
    ],
    [
      "/wishlist",
      "Saved dishes",
      "A little collection of things you love.",
      Heart,
    ],
    [
      "/addresses",
      "Delivery addresses",
      "Home, work, and everywhere in between.",
      MapPin,
    ],
    [
      "/notifications",
      "Your updates",
      "Order, payment and support notifications.",
      Bell,
    ],
    [
      "/settings",
      "Account settings",
      "Your profile and security preferences.",
      Settings,
    ],
    [
      "/support",
      "Here to help",
      "Get help with an order or your account.",
      LifeBuoy,
    ],
  ];
  return (
    <AccountFrame
      title={`Hello, ${user.first_name || "food lover"}.`}
      description="Your favourites, your details, your next delicious moment."
    >
      <div className="account-layout">
        <aside>
          <section className="account-identity panel">
            <span className="account-avatar">
              <User size={30} />
            </span>
            <h2>{name}</h2>
            <p className="muted">{user.email}</p>
            <p className="muted">
              {user.phone || "Add your phone in settings"}
            </p>
            <Link className="btn secondary mt-5" to="/settings">
              Edit profile
              <ArrowRight size={15} />
            </Link>
          </section>
          <div className="account-stats">
            <div>
              <strong>{summary.data?.total ?? "—"}</strong>
              <span>Orders placed</span>
            </div>
            <div>
              <strong>{summary.data ? money(spent) : "—"}</strong>
              <span>Delivered order value</span>
            </div>
          </div>
          <button className="btn danger w-full mt-5" onClick={() => logout()}>
            <LogOut size={16} />
            Sign out
          </button>
        </aside>
        <section>
          <div className="account-links">
            {links.map(([to, title, description, Icon]) => (
              <Link to={to} key={to}>
                <span>
                  <Icon size={21} />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <ArrowRight size={17} />
              </Link>
            ))}
          </div>
          <section className="panel">
            <div className="flex-row between">
              <h2>Recent orders</h2>
              <Link to="/orders" className="text-link">
                View all
                <ArrowRight size={14} />
              </Link>
            </div>
            <ErrorNotice
              error={orders.error || summary.error}
              onRetry={() => {
                orders.reload();
                summary.reload();
              }}
            />
            {orders.loading && (
              <LoadingScreen inline message="Loading your orders…" />
            )}
            {orders.data?.results.slice(0, 3).map((order) => (
              <Link
                className="account-order"
                key={order.id}
                to={`/tracking/${order.id}`}
              >
                <div>
                  <h3>{order.restaurant_detail?.name}</h3>
                  <p className="muted">
                    #{orderNumber(order)} · {dateTime(order.created_at)}
                  </p>
                </div>
                <span className={`status-pill ${order.status}`}>
                  {statusLabel(order.status)}
                </span>
                <strong>{money(order.total)}</strong>
              </Link>
            ))}
            {orders.data?.count === 0 && (
              <EmptyState
                title="Your first favourite is waiting"
                description="Discover a local kitchen and make it a meal."
                to="/search"
              />
            )}
          </section>
        </section>
      </div>
    </AccountFrame>
  );
}

export function WishlistPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const remote = useRemote(`/wishlist/?page=${page}`, token);
  const [busy, setBusy] = useState(null);
  const remove = async (entry) => {
    setBusy(entry.id);
    try {
      await apiRequest(`/wishlist/${entry.id}/`, { token, method: "DELETE" });
      if (remote.data.results.length === 1 && page > 1) setPage(page - 1);
      else remote.reload();
      toast.success("Removed from saved dishes");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <AccountFrame
      eyebrow="LOVE IT. SAVE IT. ORDER IT."
      title="The good-food shortlist."
      description="Your saved dishes, ready for the next craving."
    >
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {remote.loading ? (
        <Skeleton />
      ) : remote.data?.count ? (
        <>
          <div className="food-grid">
            {remote.data.results.map((entry) => (
              <div className="saved-dish" key={entry.id}>
                <FoodCard item={entry.menu_item_detail} />
                <button
                  className="saved-remove"
                  aria-label={`Remove ${entry.menu_item_detail.name} from saved dishes`}
                  disabled={busy === entry.id}
                  onClick={() => remove(entry)}
                >
                  <Heart size={17} fill="currentColor" />
                </button>
              </div>
            ))}
          </div>
          <Pages data={remote.data} page={page} onChange={setPage} />
        </>
      ) : (
        !remote.error && (
          <EmptyState
            title="Save something delicious"
            description="Open a dish and tap the heart. Your favourites will be right here."
            to="/search?view=dishes"
          />
        )
      )}
    </AccountFrame>
  );
}

export function AddressesPage() {
  const { token } = useAuth();
  const selectedLocation = useDeliveryLocation();
  const [page, setPage] = useState(1);
  const remote = useRemote(`/addresses/?page=${page}`, token);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState(null);
  const update = async (address, remove = false) => {
    if (remove && !window.confirm(`Delete your ${address.label} address?`))
      return;
    setBusy(address.id);
    try {
      await apiRequest(`/addresses/${address.id}/`, {
        token,
        method: remove ? "DELETE" : "PATCH",
        ...(remove ? {} : { body: { is_default: true } }),
      });
      if (remove && selectedLocation.address_id === address.id)
        saveDeliveryLocation({});
      remote.reload();
      toast.success(remove ? "Address removed" : "Default address updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };
  return (
    <AccountFrame
      title="Your happy places."
      description="Keep delivery details handy. Updates won’t change addresses on past orders."
      action={
        <button className="btn primary" onClick={() => setEditing({})}>
          <Plus size={16} />
          Add address
        </button>
      }
    >
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {remote.loading ? (
        <LoadingScreen inline message="Loading your addresses…" />
      ) : remote.data?.count ? (
        <>
          <div className="address-grid">
            {remote.data.results.map((address) => (
              <article className="address-card" key={address.id}>
                <div className="flex-row between">
                  <span className="account-avatar small">
                    <MapPin size={21} />
                  </span>
                  {address.is_default && (
                    <span className="status-pill">
                      <Check size={12} />
                      Default
                    </span>
                  )}
                </div>
                <h2>{address.label}</h2>
                <p className="muted">
                  {[
                    address.line1,
                    address.line2,
                    address.city,
                    address.state,
                    address.postal_code,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
                <div className="order-actions mt-5">
                  <button
                    className="btn secondary"
                    onClick={() => setEditing(address)}
                  >
                    Edit
                  </button>
                  {!address.is_default && (
                    <button
                      className="btn secondary"
                      disabled={busy === address.id}
                      onClick={() => update(address)}
                    >
                      Make default
                    </button>
                  )}
                  <button
                    className="icon-button"
                    aria-label={`Delete ${address.label} address`}
                    disabled={busy === address.id}
                    onClick={() => update(address, true)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
          </div>
          <Pages data={remote.data} page={page} onChange={setPage} />
        </>
      ) : (
        !remote.error && (
          <EmptyState
            title="Where should we bring your food?"
            description="Add your first delivery address using the button above."
          />
        )
      )}
      {editing && (
        <AddressForm
          initial={editing.id ? editing : undefined}
          onClose={() => setEditing(null)}
          onSaved={remote.reload}
        />
      )}
    </AccountFrame>
  );
}

export function NotificationsPage() {
  const { token, role } = useAuth();
  const { unreadCount, refreshUnread, error: summaryError } = useInbox();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [busy, setBusy] = useState(null);
  const remote = useRemote(
    `/notifications/?page=${page}${filter}`,
    token,
    15000,
  );
  const mark = async (notification) => {
    setBusy(notification.id);
    try {
      await apiRequest(`/notifications/${notification.id}/`, {
        token,
        method: "PATCH",
        body: { is_read: true },
      });
      refreshUnread();
      if (
        filter === "&is_read=false" &&
        remote.data.results.length === 1 &&
        page > 1
      )
        setPage(1);
      remote.reload();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };
  const markAll = async () => {
    setBusy("all");
    try {
      await apiRequest("/notifications/mark-all-read/", {
        token,
        method: "PATCH",
      });
      refreshUnread();
      setPage(1);
      remote.reload();
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(null);
    }
  };
  const Frame = role === "customer" ? AccountFrame : WorkspaceFrame;
  return (
    <Frame
      type={role}
      title="Notifications"
      description="Your order, payment and support updates, all in one place."
      action={
        <button
          className="btn secondary"
          disabled={busy !== null || unreadCount === 0}
          onClick={markAll}
        >
          <Check size={16} />
          {busy === "all" ? "Marking as read…" : "Mark all read"}
        </button>
      }
    >
      <p className="inbox-summary">
        {summaryError
          ? "Unread count unavailable. Retry below."
          : unreadCount == null
            ? "Checking for unread updates…"
            : unreadCount === 0
              ? "You’re up to date. No unread notifications."
              : `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`}
      </p>
      <div className="filter-bar">
        {[
          ["", "All updates"],
          ["&is_read=false", "Unread"],
          ["&kind=order", "Orders"],
          ["&kind=payment", "Payments"],
          ["&kind=support", "Support"],
          ["&kind=account", "Account"],
          ["&kind=delivery", "Deliveries"],
          ["&kind=review", "Reviews"],
        ].map(([value, label]) => (
          <button
            className={`filter-chip ${filter === value ? "selected" : ""}`}
            aria-pressed={filter === value}
            key={label}
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <ErrorNotice
        error={remote.error || summaryError}
        onRetry={() => {
          remote.reload();
          refreshUnread();
        }}
      />
      {remote.loading ? (
        <LoadingScreen inline message="Loading updates…" />
      ) : remote.data?.count ? (
        <>
          <div className="notification-list">
            {remote.data.results.map((notification) => (
              <article
                key={notification.id}
                className={notification.is_read ? "" : "unread"}
              >
                <span className="account-avatar small">
                  <Bell size={20} />
                </span>
                <div>
                  <h3>{notification.title}</h3>
                  <p className="muted">{notification.message}</p>
                  <small>{dateTime(notification.created_at)}</small>
                  {notificationTarget(notification, role) && (
                    <div className="notification-actions">
                      <Link
                        className="text-link"
                        to={notificationTarget(notification, role)}
                      >
                        View update <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
                {!notification.is_read && (
                  <button
                    className="text-link"
                    disabled={busy !== null}
                    onClick={() => mark(notification)}
                  >
                    Mark read
                  </button>
                )}
              </article>
            ))}
          </div>
          <Pages data={remote.data} page={page} onChange={setPage} />
        </>
      ) : (
        !remote.error && (
          <EmptyState
            title="You’re all caught up"
            description="New updates will appear here automatically."
          />
        )
      )}
    </Frame>
  );
}

export function OffersPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const remote = useRemote(`/offers/?page=${page}`);
  const coupons = useRemote(`/coupons/available/?page=${couponPage}`, token);
  const copy = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      toast.success("Coupon code copied");
    } catch {
      toast.error(`Copy this code at checkout: ${code}`);
    }
  };
  return (
    <AccountFrame
      eyebrow="A LITTLE EXTRA TO LOVE"
      title="Good food. Better deals."
      description="Current offers from RuchiGo and participating kitchens. Check each offer’s terms before ordering."
    >
      <section className="mb-9" aria-label="Coupon codes">
        <h2 className="workspace-section-title">
          A little saving on your next meal.
        </h2>
        <ErrorNotice error={coupons.error} onRetry={coupons.reload} />
        {coupons.loading ? (
          <Skeleton count={3} />
        ) : (
          <div className="offer-grid">
            {coupons.data?.results.map((coupon) => (
              <article className="panel coupon-card" key={coupon.id}>
                <span className="eyebrow">
                  <Tag size={15} /> {coupon.restaurant_name || "ACROSS RUCHIGO"}
                </span>
                <h2 className="mt-4">{couponTitle(coupon)}</h2>
                <p className="muted mt-3">{coupon.description}</p>
                <p className="form-help">{couponBenefitTerms(coupon)}</p>
                {coupon.campaign_label && (
                  <p className="eyebrow">{coupon.campaign_label}</p>
                )}
                <p className="form-help">
                  Min. order {money(coupon.min_order_amount)}
                  {coupon.max_discount
                    ? ` · Save up to ${money(coupon.max_discount)}`
                    : ""}
                </p>
                {(coupon.first_order_only || coupon.per_user_limit) && (
                  <p className="form-help">
                    {[
                      coupon.first_order_only ? "First order only" : "",
                      coupon.per_user_limit
                        ? `${coupon.per_user_limit} use(s) per customer`
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                <p className="form-help">
                  Valid until {dateTime(coupon.ends_at)}. Eligibility checked at
                  checkout.
                </p>
                <button
                  className="coupon-code mt-4"
                  onClick={() => copy(coupon.code)}
                  aria-label={`Copy coupon ${coupon.code}`}
                >
                  <strong>{coupon.code}</strong>
                  <span>Copy code</span>
                </button>
              </article>
            ))}
          </div>
        )}
        {!coupons.loading && !coupons.error && !coupons.data?.count && (
          <p className="muted">
            No available coupon codes right now. Check back for the next offer.
          </p>
        )}
        <Pages data={coupons.data} page={couponPage} onChange={setCouponPage} />
      </section>
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {remote.loading ? (
        <Skeleton count={3} />
      ) : remote.data?.count ? (
        <>
          <div className="offer-grid">
            {remote.data.results.map((offer) => (
              <article className="offer-card" key={offer.id}>
                <Tag size={28} />
                <span className="eyebrow">
                  {offer.restaurant ? "KITCHEN SPECIAL" : "RUCHIGO SPECIAL"}
                </span>
                <h2>{offer.title}</h2>
                <p className="muted">{offer.description}</p>
                <small>Valid until {dateTime(offer.ends_at)}</small>
                {offer.coupon_code && (
                  <button
                    className="coupon-code"
                    onClick={() => copy(offer.coupon_code)}
                    aria-label={`Copy coupon ${offer.coupon_code}`}
                  >
                    Use {offer.coupon_code} · Copy code
                  </button>
                )}
                <Link
                  to={
                    offer.restaurant
                      ? `/restaurant/${offer.restaurant}`
                      : "/search"
                  }
                  className="text-link"
                >
                  Explore the menu
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
          <Pages data={remote.data} page={page} onChange={setPage} />
        </>
      ) : (
        !remote.error && (
          <EmptyState
            title="Fresh offers are on the way"
            description="No active offers right now. You can still explore meals for every budget."
            to="/search?budget=250"
            action="Meals under ₹250"
          />
        )
      )}
    </AccountFrame>
  );
}
