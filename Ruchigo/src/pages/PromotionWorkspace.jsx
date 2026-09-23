import { useState } from "react";
import { Edit3, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { WorkspaceFrame } from "../components/product/Workspace.jsx";
import { EmptyState, ErrorNotice, Modal } from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "../lib/api.js";
import { dateTime, money, useRemote } from "../lib/product.js";
import { hasAdminScope } from "../lib/adminAccess.js";
import { couponTitle, couponBenefitTerms } from "../lib/couponLabels.js";

export default function PromotionWorkspace({ initialTab = "offers" }) {
  const { token, role, user } = useAuth();
  const admin = role === "admin";
  const [tab, setTab] = useState(initialTab);
  const [restaurantSearch, setRestaurantSearch] = useState("");
  const [page, setPage] = useState(1);
  const remote = useRemote(`/${tab}/?page=${page}`, token);
  const restaurants = useRemote(
    admin && tab !== "categories"
      ? `/restaurants/lookup/?search=${encodeURIComponent(restaurantSearch)}`
      : null,
    token,
  );
  const [form, setForm] = useState(null);
  const [dishSearch, setDishSearch] = useState("");
  const menu = useRemote(
    form &&
      tab === "coupons" &&
      form.benefit_type === "bogo" &&
      (!admin || form.restaurant)
      ? `/menu-items/lookup/?search=${encodeURIComponent(dishSearch)}${form.restaurant ? `&restaurant=${form.restaurant}` : ""}`
      : null,
    token,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const open = (item) => {
    setError("");
    setForm(
      item
        ? { ...item }
        : tab === "categories"
          ? { name: "", slug: "", is_active: true }
          : tab === "coupons"
            ? {
                code: "",
                description: "",
                discount_percent: "",
                discount_amount: "",
                min_order_amount: 0,
                starts_at: "",
                ends_at: "",
                usage_limit: "",
                restaurant: "",
                first_order_only: false,
                per_user_limit: "",
                max_discount: "",
                is_active: true,
                benefit_type: "food",
                campaign_type: "standard",
                campaign_label: "",
                bogo_item: "",
                max_free_items: 1,
              }
            : {
                title: "",
                description: "",
                restaurant: "",
                starts_at: "",
                ends_at: "",
                is_active: true,
                coupon_code: "",
              },
    );
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = { ...form };
      if (tab === "coupons") {
        [
          "discount_percent",
          "discount_amount",
          "usage_limit",
          "restaurant",
          "per_user_limit",
          "max_discount",
          "bogo_item",
        ].forEach((key) => {
          body[key] = body[key] || null;
        });
        if (!admin) delete body.restaurant;
        if (body.benefit_type !== "food") {
          body.discount_amount = null;
          body.discount_percent = null;
          body.max_discount = null;
        }
        if (body.benefit_type !== "bogo") body.bogo_item = null;
      }
      if (tab === "offers") {
        body.coupon_code = body.coupon_code?.trim().toUpperCase() || null;
        if (!admin) delete body.restaurant;
        else body.restaurant = body.restaurant || null;
      }
      if (tab !== "categories") {
        body.starts_at = new Date(body.starts_at).toISOString();
        body.ends_at = new Date(body.ends_at).toISOString();
      }
      const key =
        tab === "coupons"
          ? form.code
          : tab === "categories"
            ? form.slug
            : form.id;
      await apiRequest(
        form.id ? `/${tab}/${encodeURIComponent(key)}/` : `/${tab}/`,
        { token, method: form.id ? "PATCH" : "POST", body },
      );
      setForm(null);
      remote.reload();
      toast.success("Saved successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const dateValue = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  };
  return (
    <WorkspaceFrame
      type={role}
      title={
        admin
          ? tab === "categories"
            ? "Food categories"
            : "Give people a reason to return."
          : "Make your next offer count."
      }
      description={
        admin
          ? "Manage current offers, discount codes and food categories."
          : "Manage your restaurant’s offers and redeemable coupon codes."
      }
      action={
        <button className="btn primary" onClick={() => open()}>
          <Plus size={17} />
          Create{" "}
          {tab === "categories"
            ? "category"
            : tab === "coupons"
              ? "coupon"
              : "offer"}
        </button>
      }
    >
      {(admin || role === "restaurant") && (
        <div className="segmented mb-6" style={{ width: "fit-content" }}>
          {(admin ? ["offers", "coupons", "categories"] : ["offers", "coupons"])
            .filter(
              (key) =>
                !admin ||
                hasAdminScope(
                  user,
                  key === "categories" ? "catalog" : "promotions",
                ),
            )
            .map((key) => (
              <button
                key={key}
                className={tab === key ? "active" : ""}
                onClick={() => {
                  setTab(key);
                  setPage(1);
                }}
              >
                {key[0].toUpperCase() + key.slice(1)}
              </button>
            ))}
        </div>
      )}
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      <div className="kitchen-grid">
        {remote.data?.results.map((item) => (
          <article key={item.id} className="panel">
            <div className="flex-row between">
              <h2>{item.title || item.code || item.name}</h2>
              <span
                className={`status-pill ${item.is_active ? "" : "cancelled"}`}
              >
                {item.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="muted mt-4">{item.description}</p>
            {tab === "coupons" && (
              <p className="muted mt-3">
                {couponTitle(item)} · Min {money(item.min_order_amount)} · Used{" "}
                {item.usage_count} times
              </p>
            )}
            {tab === "coupons" && (
              <p className="form-help">{couponBenefitTerms(item)}</p>
            )}
            {item.campaign_label && (
              <p className="eyebrow mt-3">{item.campaign_label}</p>
            )}
            {item.coupon_code && (
              <p className="saving-line">Redeem with {item.coupon_code}</p>
            )}
            {item.ends_at && (
              <p className="form-help">Ends {dateTime(item.ends_at)}</p>
            )}
            <button className="text-link mt-5" onClick={() => open(item)}>
              <Edit3 size={14} />
              Edit
            </button>
          </article>
        ))}
      </div>
      {!remote.loading && !remote.error && !remote.data?.results.length && (
        <EmptyState
          title={`No ${tab} yet`}
          description="Create one using the button above."
        />
      )}
      {remote.data?.count > 20 && (
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
            disabled={!remote.data.next}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
      {form && (
        <Modal
          title={`${form.id ? "Edit" : "Create"} ${tab === "categories" ? "category" : tab.slice(0, -1)}`}
          onClose={() => setForm(null)}
        >
          <form className="form-stack" onSubmit={save}>
            {tab === "categories" ? (
              <>
                <label className="field">
                  <span>Category name</span>
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                        ...(!form.id
                          ? {
                              slug: e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/^-|-$/g, ""),
                            }
                          : {}),
                      })
                    }
                  />
                </label>
                <label className="field">
                  <span>Slug</span>
                  <input
                    required
                    disabled={Boolean(form.id)}
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    pattern="[a-z0-9-]+"
                  />
                </label>
              </>
            ) : (
              <>
                <label className="field">
                  <span>
                    {tab === "coupons" ? "Coupon code" : "Offer title"}
                  </span>
                  <input
                    required
                    disabled={tab === "coupons" && Boolean(form.id)}
                    value={form.code ?? form.title}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [tab === "coupons" ? "code" : "title"]:
                          tab === "coupons"
                            ? e.target.value.toUpperCase().replace(/\s/g, "")
                            : e.target.value,
                      })
                    }
                    maxLength={tab === "coupons" ? 40 : 150}
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea
                    value={form.description}
                    maxLength={255}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                  />
                </label>
                {["offers", "coupons"].includes(tab) && admin && (
                  <>
                    <label className="field">
                      <span>Find a restaurant</span>
                      <input
                        type="search"
                        placeholder="Search restaurant name or city"
                        value={restaurantSearch}
                        maxLength={100}
                        onChange={(event) =>
                          setRestaurantSearch(event.target.value)
                        }
                      />
                    </label>
                    <label className="field">
                      <span>Restaurant</span>
                      <select
                        value={form.restaurant || ""}
                        onChange={(e) =>
                          setForm({ ...form, restaurant: e.target.value })
                        }
                      >
                        <option value="">Platform-wide offer</option>
                        {form.restaurant &&
                          !restaurants.data?.results.some(
                            (row) => Number(row.id) === Number(form.restaurant),
                          ) && (
                            <option value={form.restaurant}>
                              Selected restaurant #{form.restaurant}
                            </option>
                          )}
                        {restaurants.data?.results.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <ErrorNotice
                      error={restaurants.error}
                      onRetry={restaurants.reload}
                    />
                  </>
                )}
                {tab === "coupons" && (
                  <>
                    <div className="form-grid">
                      <label className="field">
                        <span>Benefit</span>
                        <select
                          aria-label="Benefit"
                          value={form.benefit_type || "food"}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              benefit_type: event.target.value,
                              discount_amount: "",
                              discount_percent: "",
                              max_discount: "",
                              bogo_item: "",
                            })
                          }
                        >
                          <option value="food">Meal discount</option>
                          <option value="bogo">Buy one, get one</option>
                          {admin && (
                            <option value="free_delivery">Free delivery</option>
                          )}
                        </select>
                      </label>
                      <label className="field">
                        <span>Campaign</span>
                        <select
                          aria-label="Campaign"
                          value={form.campaign_type || "standard"}
                          onChange={(event) =>
                            setForm({
                              ...form,
                              campaign_type: event.target.value,
                              first_order_only:
                                event.target.value === "new_customer" ||
                                form.first_order_only,
                            })
                          }
                        >
                          <option value="standard">Everyday offer</option>
                          <option value="festival">Festival campaign</option>
                          <option value="new_customer">
                            First-order campaign
                          </option>
                        </select>
                      </label>
                    </div>
                    <label className="field">
                      <span>Campaign name (optional)</span>
                      <input
                        maxLength={80}
                        value={form.campaign_label || ""}
                        placeholder="e.g. Weekend specials"
                        onChange={(event) =>
                          setForm({
                            ...form,
                            campaign_label: event.target.value,
                          })
                        }
                      />
                    </label>
                    {form.benefit_type === "bogo" && (
                      <>
                        <label className="field">
                          <span>Find the offer dish</span>
                          <input
                            type="search"
                            value={dishSearch}
                            onChange={(event) =>
                              setDishSearch(event.target.value)
                            }
                            placeholder="Search your menu"
                          />
                        </label>
                        <label className="field">
                          <span>BOGO dish</span>
                          <select
                            aria-label="BOGO dish"
                            required
                            value={form.bogo_item || ""}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                bogo_item: event.target.value,
                              })
                            }
                          >
                            <option value="">Choose a dish</option>
                            {form.bogo_item &&
                              !menu.data?.results.some(
                                (row) =>
                                  Number(row.id) === Number(form.bogo_item),
                              ) && (
                                <option value={form.bogo_item}>
                                  {form.bogo_item_name || "Selected dish"}
                                </option>
                              )}
                            {menu.data?.results.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} · {money(item.price)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <ErrorNotice error={menu.error} onRetry={menu.reload} />
                        <label className="field">
                          <span>Maximum free base portions per order</span>
                          <input
                            type="number"
                            min={1}
                            max={20}
                            required
                            value={form.max_free_items || 1}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                max_free_items: event.target.value,
                              })
                            }
                          />
                        </label>
                        <p className="form-help">
                          Customers add both portions. Each pair earns one free
                          base portion. Extras and upgrades remain paid; all
                          portions count against inventory.
                        </p>
                      </>
                    )}
                    {form.benefit_type === "free_delivery" && (
                      <p className="form-help">
                        Platform-funded delivery fee waiver. Food and tips stay
                        payable. Confirm the approved campaign budget before
                        activation.
                      </p>
                    )}
                  </>
                )}
                {tab === "offers" && (
                  <label className="field">
                    <span>Redeemable coupon code (optional)</span>
                    <input
                      value={form.coupon_code || ""}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          coupon_code: event.target.value.toUpperCase(),
                        })
                      }
                      maxLength={40}
                      placeholder="Link an existing coupon"
                    />
                    <small className="form-help">
                      Use a coupon from this restaurant. Offer dates must fit
                      its validity. Without a code, this is an informational
                      banner.
                    </small>
                  </label>
                )}
                {tab === "coupons" && (
                  <div className="form-grid">
                    {[
                      ["discount_percent", "Percentage off", 100],
                      ["discount_amount", "Fixed amount off (₹)", 99999],
                      ["min_order_amount", "Minimum order (₹)", 99999],
                      ["usage_limit", "Usage limit (optional)", 999999],
                      [
                        "per_user_limit",
                        "Uses per customer (optional)",
                        999999,
                      ],
                      ["max_discount", "Maximum saving (₹, optional)", 99999],
                    ]
                      .filter(
                        ([key]) =>
                          (form.benefit_type || "food") === "food" ||
                          ![
                            "discount_percent",
                            "discount_amount",
                            "max_discount",
                          ].includes(key),
                      )
                      .map(([key, label, max]) => (
                        <label className="field" key={key}>
                          <span>{label}</span>
                          <input
                            type="number"
                            min="0"
                            max={max}
                            step={key.endsWith("limit") ? 1 : "0.01"}
                            value={form[key] ?? ""}
                            onChange={(e) =>
                              setForm({ ...form, [key]: e.target.value })
                            }
                          />
                        </label>
                      ))}
                  </div>
                )}
                {tab === "coupons" && (
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={form.first_order_only}
                      disabled={form.campaign_type === "new_customer"}
                      onChange={(e) =>
                        setForm({ ...form, first_order_only: e.target.checked })
                      }
                    />
                    First order only
                  </label>
                )}
                <div className="form-grid">
                  {[
                    ["starts_at", "Starts"],
                    ["ends_at", "Ends"],
                  ].map(([key, label]) => (
                    <label className="field" key={key}>
                      <span>{label}</span>
                      <input
                        type="datetime-local"
                        required
                        value={dateValue(form[key])}
                        onChange={(e) =>
                          setForm({ ...form, [key]: e.target.value })
                        }
                      />
                    </label>
                  ))}
                </div>
              </>
            )}
            <label className="check-label">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
              />
              Active
            </label>
            <ErrorNotice error={error} />
            <button disabled={busy} className="btn primary">
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
