import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Clock3, Edit3, Plus, Search, X } from "lucide-react";
import toast from "react-hot-toast";
import { WorkspaceFrame, Metrics } from "../components/product/Workspace.jsx";
import {
  ChoiceGroupEditor,
  OpeningHoursEditor,
} from "../components/product/MenuConfiguration.jsx";
import {
  EmptyState,
  ErrorNotice,
  FoodImage,
  Modal,
  VegMark,
} from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import OrderOperations from "../components/product/OrderOperations.jsx";
import {
  dateTime,
  money,
  orderNumber,
  statusLabel,
  useRemote,
} from "../lib/product.js";

const blankItem = {
  name: "",
  description: "",
  price: "",
  category: "",
  preparation_minutes: 20,
  image_url: "",
  is_vegetarian: true,
  is_available: true,
  is_bestseller: false,
  calories: "",
  tags_text: "",
  add_ons: [],
  option_groups: [],
  stock_quantity: "",
};
export function MenuWorkspace() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const menu = useRemote(
    `/menu-items/?search=${encodeURIComponent(query)}&page=${page}`,
    token,
  );
  const categories = useRemote("/categories/", token);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        ...form,
        category: form.category || null,
        calories: form.calories || null,
        stock_quantity:
          form.stock_quantity === "" || form.stock_quantity == null
            ? null
            : Number(form.stock_quantity),
        tags: form.tags_text
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };
      delete body.tags_text;
      delete body.image;
      delete body.restaurant_id;
      delete body.restaurant;
      delete body.restaurant_detail;
      await apiRequest(form.id ? `/menu-items/${form.id}/` : "/menu-items/", {
        token,
        method: form.id ? "PATCH" : "POST",
        body,
      });
      setForm(null);
      menu.reload();
      toast.success("Menu updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (item) => {
    try {
      await apiRequest(`/menu-items/${item.id}/`, {
        token,
        method: "PATCH",
        body: { is_available: !item.is_available },
      });
      menu.reload();
    } catch (err) {
      toast.error(err.message);
    }
  };
  return (
    <WorkspaceFrame
      type="restaurant"
      title="Your menu, your way."
      description="Manage dishes, prices, dietary details and what’s available today."
      action={
        <button
          className="btn primary"
          onClick={() => {
            setError("");
            setForm({ ...blankItem });
          }}
        >
          <Plus size={17} />
          Add dish
        </button>
      }
    >
      <div className="discovery-search">
        <Search size={18} />
        <input
          aria-label="Search your menu"
          placeholder="Search your dishes…"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setPage(1);
          }}
        />
      </div>
      <ErrorNotice error={menu.error} onRetry={menu.reload} />
      <div className="workspace-menu-grid">
        {menu.data?.results.map((item) => (
          <article className="food-card" key={item.id}>
            <div className="food-card-image">
              <FoodImage item={item} />
            </div>
            <div className="food-card-body">
              <div className="flex-row between">
                <VegMark veg={item.is_vegetarian} />
                <span className="tiny muted">{item.category_name}</span>
              </div>
              <h3>{item.name}</h3>
              <p className="muted">
                {money(item.price)} · {item.preparation_minutes} min
              </p>
              {item.stock_quantity != null && (
                <p className="stock-count">
                  {item.stock_quantity === 0
                    ? "Sold out"
                    : `${item.stock_quantity} portions in stock`}
                </p>
              )}
              <div className="flex-row between mt-5">
                <button
                  className={`status-pill ${item.is_available ? "" : "cancelled"}`}
                  onClick={() => toggle(item)}
                >
                  {item.is_available ? "Available" : "Unavailable"}
                </button>
                <button
                  className="text-link"
                  onClick={() => {
                    setError("");
                    setForm({
                      ...item,
                      tags_text: (item.tags || []).join(", "),
                      calories: item.calories || "",
                      category: item.category || "",
                    });
                  }}
                >
                  <Edit3 size={15} />
                  Edit
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!menu.loading && !menu.error && !menu.data?.results.length && (
        <EmptyState
          title="Bring your menu to life"
          description="Add your first dish with a price, photo and a little about what makes it special."
        />
      )}
      {menu.data?.count > 20 && (
        <div className="pagination">
          <button
            className="btn secondary"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            className="btn secondary"
            disabled={!menu.data.next}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
      {form && (
        <Modal
          title={form.id ? "Edit your dish" : "Add something delicious"}
          onClose={() => setForm(null)}
        >
          <form className="form-stack" onSubmit={save}>
            <label className="field">
              <span>Dish name</span>
              <input
                required
                maxLength={150}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Description</span>
              <textarea
                maxLength={2000}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <div className="form-grid">
              <label className="field">
                <span>Price (₹)</span>
                <input
                  required
                  type="number"
                  min="1"
                  max="9999999"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </label>
              <label className="field">
                <span>Category</span>
                <select
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  <option value="">Select category</option>
                  {categories.data?.results.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Preparation (minutes)</span>
                <input
                  required
                  type="number"
                  min="1"
                  max="180"
                  value={form.preparation_minutes}
                  onChange={(e) =>
                    setForm({ ...form, preparation_minutes: e.target.value })
                  }
                />
              </label>
              <label className="field">
                <span>Calories (optional)</span>
                <input
                  type="number"
                  min="0"
                  value={form.calories}
                  onChange={(e) =>
                    setForm({ ...form, calories: e.target.value })
                  }
                />
              </label>
            </div>
            <label className="field">
              <span>Photo URL</span>
              <input
                type="url"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                placeholder="https://…"
              />
            </label>
            <label className="field">
              <span>Available portions (optional)</span>
              <input
                type="number"
                min="0"
                max="1000000"
                value={form.stock_quantity ?? ""}
                onChange={(event) =>
                  setForm({ ...form, stock_quantity: event.target.value })
                }
                placeholder="Leave blank for untracked stock"
              />
              <small className="form-help">
                Checkout deducts portions across all sizes/configurations.
                Cancellation before preparation restores tracked portions.
                Prepared food is not restocked. Awaiting-payment orders also
                hold stock until resolved; automatic payment expiry is not yet
                enabled.
              </small>
            </label>
            <ChoiceGroupEditor
              groups={form.option_groups || []}
              options={form.add_ons || []}
              onChange={(option_groups, add_ons) =>
                setForm({ ...form, option_groups, add_ons })
              }
            />
            <label className="field">
              <span>Dietary tags (comma separated)</span>
              <input
                value={form.tags_text}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags_text: e.target.value,
                  })
                }
                placeholder="high protein, dairy free"
              />
            </label>
            <fieldset className="menu-addon-editor">
              <legend>Options & add-ons</legend>
              <p className="form-help">
                Set the sizes and extras you actually offer. Prices are added
                per dish; mark an extra unavailable when it runs out.
              </p>
              {(form.add_ons || []).map((addon, index) => (
                <div className="menu-addon-row" key={addon.id}>
                  {!!form.option_groups?.length && (
                    <label className="field addon-group-assignment">
                      <span>Choice group</span>
                      <select
                        value={addon.group_id || ""}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            add_ons: form.add_ons.map((row, i) =>
                              i === index
                                ? { ...row, group_id: event.target.value }
                                : row,
                            ),
                          })
                        }
                      >
                        <option value="">Optional extra</option>
                        {form.option_groups.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                  <label className="field">
                    <span>Extra name</span>
                    <input
                      required
                      maxLength={80}
                      value={addon.name}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          add_ons: form.add_ons.map((row, i) =>
                            i === index
                              ? { ...row, name: event.target.value }
                              : row,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    <span>Extra price (₹)</span>
                    <input
                      required
                      type="number"
                      min="0"
                      max="10000"
                      step="0.01"
                      value={addon.price}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          add_ons: form.add_ons.map((row, i) =>
                            i === index
                              ? { ...row, price: event.target.value }
                              : row,
                          ),
                        })
                      }
                    />
                  </label>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={addon.is_available}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          add_ons: form.add_ons.map((row, i) =>
                            i === index
                              ? { ...row, is_available: event.target.checked }
                              : row,
                          ),
                        })
                      }
                    />
                    Available
                  </label>
                  <button
                    type="button"
                    className="text-link"
                    onClick={() =>
                      setForm({
                        ...form,
                        add_ons: form.add_ons.filter((_, i) => i !== index),
                      })
                    }
                  >
                    Remove extra
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="btn secondary"
                disabled={(form.add_ons || []).length >= 12}
                onClick={() =>
                  setForm({
                    ...form,
                    add_ons: [
                      ...(form.add_ons || []),
                      {
                        id: crypto.randomUUID(),
                        name: "",
                        price: "0",
                        is_available: true,
                      },
                    ],
                  })
                }
              >
                <Plus size={15} />
                Add optional extra
              </button>
            </fieldset>
            <div className="flex-row">
              {[
                ["is_vegetarian", "Vegetarian"],
                ["is_available", "Available"],
                ["is_bestseller", "Bestseller"],
              ].map(([key, label]) => (
                <label className="check-label" key={key}>
                  <input
                    type="checkbox"
                    checked={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.checked })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Save dish"}
            </button>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}

export function KitchenOrders() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("pending");
  const { data, error, loading, reload } = useRemote(
    `/orders/?status=${status}&page=${page}`,
    token,
    5000,
  );
  const [busy, setBusy] = useState(null);
  const update = async (order, next) => {
    setBusy(order.id);
    try {
      await apiRequest(`/orders/${order.id}/status/`, {
        token,
        method: "POST",
        body: { status: next },
      });
      reload();
      toast.success("Order updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(null);
    }
  };
  const next = {
    pending: ["confirmed", "Accept order"],
    confirmed: ["preparing", "Start preparing"],
    preparing: ["ready", "Ready for pickup"],
  };
  return (
    <WorkspaceFrame
      type="restaurant"
      title="Good food in the making."
      description="Your live kitchen queue, refreshed every five seconds."
    >
      <div className="filter-bar">
        {[
          "pending",
          "confirmed",
          "preparing",
          "ready",
          "assigned",
          "out_for_delivery",
          "delivered",
          "cancelled",
        ].map((value) => (
          <button
            key={value}
            className={`filter-chip ${status === value ? "selected" : ""}`}
            onClick={() => {
              setStatus(value);
              setPage(1);
            }}
          >
            {statusLabel(value)}
          </button>
        ))}
      </div>
      <ErrorNotice error={error} onRetry={reload} />
      <div className="kitchen-grid">
        {data?.results.map((order) => (
          <article className="order-card" key={order.id}>
            <div className="flex-row between">
              <h3>#{orderNumber(order)}</h3>
              <span className="tiny muted">
                <Clock3 size={13} />
                {dateTime(order.created_at)}
              </span>
            </div>
            <p className="muted mt-3">
              {order.customer_detail?.first_name || "Customer"}
            </p>
            <div className="order-items-summary">
              {order.items.map((item) => (
                <p key={item.id}>
                  <strong>{item.quantity}×</strong> {item.name}
                  {item.add_ons?.length > 0 && (
                    <small className="order-addon-note">
                      Extras: {item.add_ons.map((row) => row.name).join(", ")}
                    </small>
                  )}
                </p>
              ))}
            </div>
            {order.notes && <p className="saving-line">{order.notes}</p>}
            <div className="flex-row between mt-5">
              <strong>{money(order.total)}</strong>
              <span className="status-pill">{statusLabel(order.status)}</span>
            </div>
            <div className="mt-5">
              <OrderOperations order={order} onUpdated={reload} />
            </div>
            {next[order.status] && !order.fulfillment_paused_at && (
              <div className="flex-row mt-5">
                <button
                  className="btn primary grow"
                  disabled={busy === order.id}
                  onClick={() => update(order, next[order.status][0])}
                >
                  <Check size={16} />
                  {next[order.status][1]}
                </button>
                {order.payment?.status !== "paid" && (
                  <button
                    className="btn danger"
                    aria-label="Reject order"
                    disabled={busy === order.id}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Cancel this order and notify the customer?",
                        )
                      )
                        update(order, "cancelled");
                    }}
                  >
                    <X size={17} />
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      {data && (data.next || data.previous) && (
        <div className="pagination">
          <button
            className="btn secondary"
            disabled={!data.previous}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>Page {page}</span>
          <button
            className="btn secondary"
            disabled={!data.next}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
      {!loading && !error && !data?.results.length && (
        <EmptyState
          title="Your kitchen is all caught up"
          description="Orders in this stage will appear here automatically."
        />
      )}
    </WorkspaceFrame>
  );
}

export function RestaurantProfile() {
  const { token, user } = useAuth();
  const { data, loading, error, reload } = useRemote("/restaurants/", token);
  const existing = data?.results[0];
  return (
    <WorkspaceFrame
      type="restaurant"
      title="Restaurant profile"
      description="Introduce your kitchen and keep your location and contact details current."
    >
      <ErrorNotice error={error} onRetry={reload} />
      {!loading && !error && (
        <ProfileEditor
          key={existing?.id || "new"}
          existing={existing}
          token={token}
          user={user}
          onSaved={reload}
        />
      )}
    </WorkspaceFrame>
  );
}
function ProfileEditor({ existing, token, user, onSaved }) {
  const [form, setForm] = useState(
    existing || {
      name: "",
      description: "",
      phone: user.phone || "",
      email: user.email,
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      is_open: true,
      opening_hours: [],
    },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = {
        ...form,
        latitude: form.latitude || null,
        longitude: form.longitude || null,
      };
      delete body.image;
      await apiRequest(
        existing ? `/restaurants/${existing.id}/` : "/restaurants/",
        { token, method: existing ? "PATCH" : "POST", body },
      );
      toast.success("Restaurant profile saved");
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="restaurant-profile-layout">
      <form
        className="panel form-stack"
        onSubmit={save}
        style={{ marginTop: 0 }}
      >
        <div>
          <h2>Business details</h2>
          <p className="form-help">
            Keep the information customers use to find and contact your kitchen
            up to date.
          </p>
        </div>
        <span className="status-pill">
          {existing?.is_approved
            ? "Approved restaurant"
            : "Profile approval required"}
        </span>
        {[
          ["name", "Restaurant name"],
          ["description", "Tell customers about your food"],
          ["address", "Street address"],
        ].map(([key, label]) => (
          <label className="field" key={key}>
            <span>{label}</span>
            {key === "description" ? (
              <textarea
                required
                maxLength={500}
                rows={3}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ) : (
              <input
                required
                maxLength={key === "name" ? 150 : 500}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            )}
          </label>
        ))}
        <h2>Location & contact</h2>
        <div className="form-grid">
          {[
            ["city", "City", "text"],
            ["phone", "Restaurant phone", "tel"],
            ["email", "Public email", "email"],
            ["latitude", "Latitude (optional)", "number"],
            ["longitude", "Longitude (optional)", "number"],
          ].map(([key, label, type]) => (
            <label className="field" key={key}>
              <span>{label}</span>
              <input
                type={type}
                step={type === "number" ? "any" : undefined}
                required={!["latitude", "longitude"].includes(key)}
                value={form[key] ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={form.is_open}
            onChange={(e) => setForm({ ...form, is_open: e.target.checked })}
          />
          Accepting orders
        </label>
        <OpeningHoursEditor
          value={form.opening_hours || []}
          onChange={(opening_hours) => setForm({ ...form, opening_hours })}
        />
        <ErrorNotice error={error} />
        <button className="btn primary" disabled={busy}>
          {busy ? "Saving…" : "Save restaurant profile"}
        </button>
      </form>
      <aside className="partner-side-card">
        <FoodImage
          restaurant
          item={{
            name: form.name || "Your restaurant",
            image: existing?.image,
          }}
        />
        <div>
          <p className="eyebrow">YOUR RESTAURANT</p>
          <h2>{form.name || "Introduce your kitchen"}</h2>
          <p>
            {form.description ||
              "Add a short introduction to help customers discover your food."}
          </p>
          <dl>
            <div>
              <dt>City</dt>
              <dd>{form.city || "Not added"}</dd>
            </div>
            <div>
              <dt>Orders</dt>
              <dd>{form.is_open ? "Accepting orders" : "Kitchen closed"}</dd>
            </div>
            <div>
              <dt>Profile access</dt>
              <dd>{existing?.is_approved ? "Approved" : "Pending approval"}</dd>
            </div>
          </dl>
          {existing?.is_approved && (
            <Link
              className="btn secondary w-full"
              to={`/restaurant/${existing.id}`}
            >
              View customer listing
            </Link>
          )}
          <Link className="text-link mt-4" to="/restaurant-menu">
            Manage menu & availability
          </Link>
          <p className="form-help">
            Changes are published when you save. Account approval does not
            certify licences or food safety.
          </p>
        </div>
      </aside>
    </div>
  );
}

export function RestaurantOverview() {
  const { token } = useAuth();
  const orders = useRemote("/orders/", token, 10000);
  const summary = useRemote("/orders/summary/", token, 10000);
  const count = (status) =>
    summary.data
      ? summary.data.by_status.find((row) => row.status === status)?.count || 0
      : "—";
  const items = orders.data?.results || [];
  return (
    <WorkspaceFrame
      type="restaurant"
      title="Kitchen overview"
      description="New orders, preparation and pickups at a glance. Totals cover your order history."
      action={
        <Link className="btn primary" to="/restaurant-orders">
          Open order queue
        </Link>
      }
    >
      <Metrics
        entries={[
          ["Total orders", summary.data?.total ?? "—"],
          ["New orders", count("pending")],
          ["Preparing", count("preparing")],
          ["Ready for pickup", count("ready")],
        ]}
      />
      <ErrorNotice
        error={orders.error || summary.error}
        onRetry={() => {
          orders.reload();
          summary.reload();
        }}
      />
      <div className="workspace-quicklinks">
        <Link to="/restaurant-orders">
          <div>
            <strong>
              {summary.data
                ? `${count("pending")} orders waiting for a response`
                : "Incoming orders"}
            </strong>
            <span>Accept new orders and update preparation status.</span>
          </div>
        </Link>
        <Link to="/restaurant-menu">
          <div>
            <strong>Keep your menu current</strong>
            <span>Update dishes, prices and availability.</span>
          </div>
        </Link>
      </div>
      <section className="panel mt-6">
        <h2>Recent orders</h2>
        {items.slice(0, 8).map((order) => (
          <div className="list-row" key={order.id}>
            <div className="grow">
              <h3>#{orderNumber(order)}</h3>
              <p className="muted">
                {order.items
                  .map((item) => `${item.quantity} × ${item.name}`)
                  .join(", ")}
              </p>
            </div>
            <span className={`status-pill ${order.status}`}>
              {statusLabel(order.status)}
            </span>
            <strong>{money(order.total)}</strong>
          </div>
        ))}
        {!items.length && (
          <p className="muted mt-5">Your next order will appear here.</p>
        )}
      </section>
    </WorkspaceFrame>
  );
}
