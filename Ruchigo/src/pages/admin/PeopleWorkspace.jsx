import { useEffect, useId, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Bike,
  Check,
  ChevronDown,
  LockKeyhole,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCw,
  Search,
  ShieldCheck,
  Store,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { useRemote } from "../../lib/product.js";
import { WorkspaceFrame } from "../../components/product/Workspace.jsx";
import UserAvatar from "../../components/common/UserAvatar.jsx";
import LoadingScreen from "../../components/common/LoadingScreen.jsx";
import { canOpenAdminRoute } from "../../lib/adminAccess.js";
import {
  accountAccessAction,
  accountAccessLabel,
} from "../../lib/accountAccess.js";
import {
  EmptyState,
  ErrorNotice,
  Modal,
} from "../../components/product/UI.jsx";
import "../../components/product/Operations.css";
import "./PeopleWorkspace.css";

const roles = ["customer", "restaurant", "delivery", "admin"];
const roleLabel = (role) =>
  ({
    customer: "Customer",
    restaurant: "Restaurant partner",
    delivery: "Delivery partner",
    admin: "Administrator",
  })[role];
const blank = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "customer",
  password: "",
  reason: "",
};
const roleIcons = {
  customer: Users,
  restaurant: Store,
  delivery: Bike,
  admin: ShieldCheck,
};
const shortRole = {
  customer: "Customer",
  restaurant: "Restaurant",
  delivery: "Delivery",
  admin: "Admin",
};
const personName = (person) =>
  `${person.first_name || ""} ${person.last_name || ""}`.trim() || person.email;

function AccessActions({ person, disabled, onSelect }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div className="people-access-actions" ref={root}>
      <button
        ref={trigger}
        type="button"
        className="people-icon-button"
        aria-label={`More actions for ${person.email}`}
        aria-expanded={open}
        aria-controls={id}
        disabled={disabled}
        onClick={() => setOpen(!open)}
      >
        <MoreHorizontal size={19} />
      </button>
      {open && (
        <div id={id} className="people-action-popover">
          <small>ACCOUNT ACCESS</small>
          <button
            type="button"
            className={person.is_active ? "is-destructive" : ""}
            onClick={() => {
              setOpen(false);
              onSelect();
            }}
          >
            {person.is_active ? <Ban size={16} /> : <UserCheck size={16} />}
            {person.is_active
              ? "Block access"
              : person.access_status === "pending"
                ? "Approve account"
                : "Restore access"}
          </button>
          <p>Changes require a reason and confirmation.</p>
        </div>
      )}
    </div>
  );
}

export default function PeopleWorkspace({ partnersOnly = false }) {
  const { token, user } = useAuth();
  const [urlParams] = useSearchParams();
  const initialSearch = urlParams.get("search") || "";
  const [search, setSearch] = useState(initialSearch);
  const [filters, setFilters] = useState({
    search: initialSearch,
    role: roles.includes(urlParams.get("role")) ? urlParams.get("role") : "",
    is_active: "",
    access_status:
      urlParams.get("access_status") === "pending" ? "pending" : "",
    page: 1,
  });
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState(null);
  const params = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value !== ""),
  );
  if (partnersOnly) params.set("partner_only", "true");
  const people = useRemote(`/users/?${params}`, token, 20000);
  const summaryParams = new URLSearchParams(params);
  summaryParams.delete("page");
  const summary = useRemote(`/users/summary/?${summaryParams}`, token, 20000);
  const canManageAdmins = summary.data?.can_manage_admins;
  const hasFilters = Boolean(
    filters.search ||
    filters.role ||
    filters.is_active ||
    filters.access_status,
  );
  const availableRoles = roles.filter(
    (role) => !partnersOnly || ["restaurant", "delivery"].includes(role),
  );
  const partnerCount = summary.data?.by_role
    .filter((row) => ["restaurant", "delivery"].includes(row.role))
    .reduce((total, row) => total + row.count, 0);
  function clearFilters() {
    setSearch("");
    setFilters({
      search: "",
      role: "",
      is_active: "",
      access_status: "",
      page: 1,
    });
  }
  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  function refresh() {
    people.reload();
    summary.reload();
  }
  function review(person) {
    setDecision({ person, action: accountAccessAction(person) });
    setDraft(blank);
    setError("");
  }
  function edit(person) {
    setEditing(person || {});
    setDraft(
      person
        ? {
            ...blank,
            first_name: person.first_name,
            last_name: person.last_name,
            email: person.email,
            phone: person.phone,
            role: person.role,
          }
        : blank,
    );
    setError("");
  }
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { password, ...body } = draft;
      if (!editing.id) body.password = password;
      await apiRequest(editing.id ? `/users/${editing.id}/` : "/users/", {
        token,
        method: editing.id ? "PATCH" : "POST",
        body,
      });
      toast.success(editing.id ? "Account details updated" : "Account created");
      setEditing(null);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function changeAccess(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/users/${decision.person.id}/${decision.action}/`, {
        token,
        method: "POST",
        body: { reason: draft.reason },
      });
      toast.success(
        decision.action === "block"
          ? "Account blocked"
          : decision.action === "approve"
            ? "Account approved. They can now sign in."
            : "Account access restored",
      );
      setDecision(null);
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceFrame
      type="admin"
      title={partnersOnly ? "Partner account access" : "People"}
      description={
        partnersOnly
          ? "Review restaurant and delivery partner sign-in access."
          : "Customers, partners and your team. All in one place."
      }
      action={
        !partnersOnly && (
          <button className="btn primary" onClick={() => edit(null)}>
            <Plus size={17} /> Add account
          </button>
        )
      }
    >
      <div className="people-stat-grid" aria-label="Account summary">
        {[
          [
            "Matching accounts",
            summary.data?.total,
            "In your current view",
            Users,
            "all",
          ],
          [
            "Active access",
            summary.data?.active,
            "Accounts that can sign in",
            UserCheck,
            "active",
          ],
          [
            "Inactive access",
            summary.data?.inactive,
            "Paused or awaiting approval",
            LockKeyhole,
            "inactive",
          ],
          [
            "Partner accounts",
            partnerCount,
            "Restaurants & delivery",
            Store,
            "partners",
          ],
        ].map(([label, value, detail, Icon, tone]) => (
          <article className={`people-stat ${tone}`} key={label}>
            <div>
              <span className="people-stat-icon">
                <Icon size={19} />
              </span>
              <p>{label}</p>
            </div>
            <strong>
              {value == null ? "—" : value.toLocaleString("en-IN")}
            </strong>
            <small>{detail}</small>
          </article>
        ))}
      </div>
      {summary.data?.pending > 0 && (
        <aside className="people-pending-notice">
          <UserCheck size={21} aria-hidden="true" />
          <div>
            <strong>
              {summary.data.pending}{" "}
              {summary.data.pending === 1 ? "partner is" : "partners are"}{" "}
              waiting for approval
            </strong>
            <p>
              Review their name, email and role, then approve account access.
              They sign in with the password they registered.
            </p>
          </div>
          <button
            type="button"
            className="btn secondary"
            onClick={() =>
              setFilters((current) => ({
                ...current,
                is_active: "",
                access_status: "pending",
                page: 1,
              }))
            }
          >
            Review pending <ArrowRight size={15} />
          </button>
        </aside>
      )}
      <section
        className="panel people-workspace people-directory"
        aria-label="Account directory"
      >
        <header className="people-directory-heading">
          <div>
            <h2>
              Account directory <span>{people.data?.count ?? "—"}</span>
            </h2>
            <p>Review details and keep the right people connected.</p>
          </div>
          <button
            type="button"
            className="people-icon-button"
            aria-label="Refresh accounts"
            disabled={people.loading || summary.loading}
            onClick={refresh}
          >
            <RotateCw size={17} />
          </button>
        </header>
        <div
          className="people-role-tabs"
          role="group"
          aria-label="Account role shortcuts"
        >
          <button
            type="button"
            aria-pressed={!filters.role}
            onClick={() => setFilter("role", "")}
          >
            All accounts
          </button>
          {availableRoles.map((role) => {
            const Icon = roleIcons[role];
            return (
              <button
                key={role}
                type="button"
                aria-pressed={filters.role === role}
                onClick={() => setFilter("role", role)}
              >
                <Icon size={15} />
                {role === "customer"
                  ? "Customers"
                  : role === "admin"
                    ? "Admins"
                    : `${shortRole[role]} partners`}
              </button>
            );
          })}
        </div>
        <div className="people-toolbar">
          <form
            className="people-search"
            onSubmit={(event) => {
              event.preventDefault();
              setFilter("search", search.trim());
            }}
          >
            <Search size={18} />
            <input
              aria-label="Search accounts"
              placeholder="Search name, email or phone"
              value={search}
              maxLength={150}
              onChange={(event) => setSearch(event.target.value)}
            />
            {search && (
              <button
                type="button"
                className="people-search-clear"
                aria-label="Clear search"
                onClick={() => {
                  setSearch("");
                  setFilter("search", "");
                }}
              >
                <X size={16} />
              </button>
            )}
            <button className="people-search-submit">
              Search <ArrowRight size={14} />
            </button>
          </form>
          <label className="people-mobile-role">
            Role
            <select
              aria-label="Filter account role"
              value={filters.role}
              onChange={(event) => setFilter("role", event.target.value)}
            >
              <option value="">All roles</option>
              {roles
                .filter(
                  (role) =>
                    !partnersOnly || ["restaurant", "delivery"].includes(role),
                )
                .map((role) => (
                  <option key={role} value={role}>
                    {roleLabel(role)}
                  </option>
                ))}
            </select>
          </label>
          <label className="people-access-filter">
            <span>Account access</span>
            <div>
              <select
                aria-label="Filter account access"
                value={filters.access_status || filters.is_active}
                onChange={(event) => {
                  const value = event.target.value;
                  setFilters((current) => ({
                    ...current,
                    page: 1,
                    is_active: ["true", "false"].includes(value) ? value : "",
                    access_status: ["pending", "blocked"].includes(value)
                      ? value
                      : "",
                  }));
                }}
              >
                <option value="">Any access</option>
                <option value="true">Active</option>
                <option value="pending">Pending approval</option>
                <option value="blocked">Blocked</option>
                <option value="false">Inactive</option>
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </label>
        </div>
        {hasFilters && (
          <div className="people-filter-summary">
            <span>
              Filtered view{filters.search ? ` · “${filters.search}”` : ""}
              {filters.role ? ` · ${roleLabel(filters.role)}` : ""}
              {filters.is_active
                ? ` · ${filters.is_active === "true" ? "Active" : "Inactive"}`
                : ""}
              {filters.access_status
                ? ` · ${filters.access_status === "pending" ? "Pending approval" : "Blocked"}`
                : ""}
            </span>
            <button type="button" onClick={clearFilters}>
              <X size={13} />
              Clear filters
            </button>
          </div>
        )}
        <ErrorNotice error={people.error || summary.error} onRetry={refresh} />
        {people.loading && <LoadingScreen inline message="Loading accounts…" />}
        {!people.loading && !people.error && !people.data?.results.length && (
          <EmptyState
            title="No accounts match"
            description="Try another name, role or access filter."
            onRetry={hasFilters ? clearFilters : undefined}
          />
        )}
        <div className="people-table-wrap">
          {!!people.data?.results.length && (
            <table className="people-table">
              <caption>
                {people.data.count} matching accounts. Page {filters.page}.
              </caption>
              <thead>
                <tr>
                  <th>Person</th>
                  <th>Role</th>
                  <th>Account access</th>
                  <th>Joined</th>
                  <th>
                    <span className="sr-only">Manage</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {people.data.results.map((person) => {
                  const protectedAccount =
                    person.role === "admin" && !canManageAdmins;
                  return (
                    <tr key={person.id}>
                      <td className="people-person-cell">
                        <div className="people-identity">
                          <UserAvatar
                            user={person}
                            className={`people-avatar role-${person.role}`}
                          />
                          <div>
                            <strong title={personName(person)}>
                              {personName(person)}
                              {person.id === user.id && (
                                <span className="people-you">You</span>
                              )}
                            </strong>
                            <small title={person.email}>{person.email}</small>
                            {person.phone && (
                              <small className="people-phone">
                                {person.phone}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="people-role-cell">
                        <span
                          className={`people-role-badge role-${person.role}`}
                        >
                          {(() => {
                            const Icon = roleIcons[person.role] || Users;
                            return <Icon size={14} />;
                          })()}
                          {shortRole[person.role] || person.role}
                        </span>
                      </td>
                      <td className="people-status-cell">
                        <span
                          className={`people-access-badge ${person.is_active ? "is-active" : person.access_status === "pending" ? "is-inactive" : "is-blocked"}`}
                        >
                          <i aria-hidden="true" />
                          {accountAccessLabel(person)}
                        </span>
                      </td>
                      <td className="people-joined-cell" data-label="Joined">
                        {new Date(person.created_at).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="people-manage-cell">
                        <div className="people-actions">
                          {person.access_status === "pending" &&
                            !person.is_active && (
                              <button
                                type="button"
                                className="people-approve-button"
                                disabled={busy || protectedAccount}
                                onClick={() => review(person)}
                              >
                                <UserCheck size={14} /> Approve
                              </button>
                            )}
                          {!partnersOnly && (
                            <button
                              type="button"
                              className="people-edit-button"
                              aria-label="Edit details"
                              disabled={protectedAccount}
                              onClick={() => edit(person)}
                            >
                              <Pencil size={14} />
                              Edit
                            </button>
                          )}
                          <AccessActions
                            person={person}
                            disabled={protectedAccount || person.id === user.id}
                            onSelect={() => review(person)}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <div className="people-pagination">
          <button
            className="people-page-button"
            aria-label="Previous accounts"
            disabled={filters.page === 1 || people.loading}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            <ArrowLeft size={15} />
            <span>Previous</span>
          </button>
          <span>
            Page <strong>{filters.page}</strong>
            {people.data && (
              <> · {people.data.count.toLocaleString("en-IN")} accounts</>
            )}
          </span>
          <button
            className="people-page-button"
            aria-label="Next accounts"
            disabled={!people.data?.next || people.loading}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            <span>Next</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </section>
      <aside className="people-access-note">
        <ShieldCheck size={20} />
        <div>
          <strong>Account access, handled with care.</strong>
          <p>
            Changes are logged. Account access is separate from identity
            verification and restaurant approval.
          </p>
        </div>
        {canOpenAdminRoute(user, "/admin-activity") && (
          <Link to="/admin-activity">
            View activity
            <ArrowRight size={14} />
          </Link>
        )}
      </aside>
      {editing && (
        <Modal
          title={editing.id ? "Edit account" : "Add account"}
          onClose={() => !busy && setEditing(null)}
        >
          <form className="people-form people-edit-form" onSubmit={save}>
            <div className="people-form-intro">
              <span>
                <Users size={20} />
              </span>
              <div>
                <strong>
                  {editing.id
                    ? personName(editing)
                    : "A new member of your marketplace"}
                </strong>
                <p>
                  {editing.id
                    ? `Account #${editing.id} · Update contact details or account role.`
                    : "Add their details and choose the right account role."}
                </p>
              </div>
            </div>
            <div className="people-form-grid">
              {[
                ["first_name", "First name", "text"],
                ["last_name", "Last name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone", "tel"],
              ].map(([key, label, type]) => (
                <label key={key}>
                  {label}
                  <input
                    type={type}
                    required={key === "email"}
                    maxLength={key === "phone" ? 20 : 150}
                    autoComplete="off"
                    value={draft[key]}
                    onChange={(event) =>
                      setDraft({ ...draft, [key]: event.target.value })
                    }
                  />
                </label>
              ))}
            </div>
            <label>
              Account role
              <select
                value={draft.role}
                onChange={(event) =>
                  setDraft({ ...draft, role: event.target.value })
                }
              >
                {roles
                  .filter(
                    (role) =>
                      role !== "admin" ||
                      canManageAdmins ||
                      draft.role === "admin",
                  )
                  .map((role) => (
                    <option key={role} value={role}>
                      {roleLabel(role)}
                    </option>
                  ))}
              </select>
            </label>
            {!editing.id && (
              <label>
                Initial password
                <input
                  type="password"
                  required
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={draft.password}
                  onChange={(event) =>
                    setDraft({ ...draft, password: event.target.value })
                  }
                />
              </label>
            )}
            <label>
              Reason for this change
              <textarea
                required
                maxLength={500}
                value={draft.reason}
                onChange={(event) =>
                  setDraft({ ...draft, reason: event.target.value })
                }
                placeholder="Context for the activity log"
              />
            </label>
            <p className="muted">
              Accounts with marketplace history cannot be reassigned to another
              role. Administrator access requires a superuser.
            </p>
            <ErrorNotice error={error} />
            <div className="people-form-footer">
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button className="btn primary" disabled={busy}>
                {busy ? "Saving…" : "Save account"}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {decision && (
        <Modal
          title={
            decision.action === "block"
              ? "Block account access?"
              : decision.action === "approve"
                ? "Approve partner account?"
                : "Restore account access?"
          }
          onClose={() => !busy && setDecision(null)}
        >
          <form
            className="people-form people-edit-form"
            onSubmit={changeAccess}
          >
            <div
              className={`people-form-intro ${decision.action === "block" ? "is-warning" : ""}`}
            >
              <span>
                {decision.action === "block" ? (
                  <Ban size={20} />
                ) : (
                  <Check size={20} />
                )}
              </span>
              <div>
                <strong>{personName(decision.person)}</strong>
                <p>
                  {decision.person.email} · {roleLabel(decision.person.role)}
                </p>
                {decision.person.phone && <p>{decision.person.phone}</p>}
              </div>
            </div>
            <p className="muted">
              {decision.action === "block"
                ? "This account will lose access. Active orders must be resolved first; their status will not be changed by this action."
                : decision.action === "approve"
                  ? `This ${roleLabel(decision.person.role).toLowerCase()} can sign in with their existing registration password after approval. ${decision.person.role === "delivery" ? "They start offline and choose when to go online." : "Their restaurant listing still requires a separate review before going live."} This approves sign-in access, not KYC verification.`
                  : "This account will be able to sign in again. This does not verify identity or approve a restaurant listing."}
            </p>
            <label>
              Reason
              <textarea
                required
                maxLength={500}
                value={draft.reason}
                onChange={(event) =>
                  setDraft({ ...draft, reason: event.target.value })
                }
              />
            </label>
            <ErrorNotice error={error} />
            <div className="people-actions">
              <button
                type="button"
                className="btn secondary"
                disabled={busy}
                onClick={() => setDecision(null)}
              >
                Keep unchanged
              </button>
              <button className="btn primary" disabled={busy}>
                {busy
                  ? "Saving…"
                  : decision.action === "block"
                    ? "Confirm block"
                    : decision.action === "approve"
                      ? "Approve account"
                      : "Confirm restore"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
