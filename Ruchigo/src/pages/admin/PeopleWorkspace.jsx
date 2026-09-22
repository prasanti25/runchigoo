import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ShieldCheck, UserRound } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { useRemote } from "../../lib/product.js";
import {
  WorkspaceFrame,
  Metrics,
} from "../../components/product/Workspace.jsx";
import {
  EmptyState,
  ErrorNotice,
  Modal,
} from "../../components/product/UI.jsx";
import "../../components/product/Operations.css";

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

export default function PeopleWorkspace({ partnersOnly = false }) {
  const { token, user } = useAuth();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    is_active: "",
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
  const people = useRemote(`/users/?${params}`, token);
  const summaryParams = new URLSearchParams(params);
  summaryParams.delete("page");
  const summary = useRemote(`/users/summary/?${summaryParams}`, token);
  const canManageAdmins = summary.data?.can_manage_admins;
  const setFilter = (key, value) =>
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  function refresh() {
    people.reload();
    summary.reload();
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
      description="Find accounts, review access and manage your marketplace."
      action={
        !partnersOnly && (
          <button className="btn primary" onClick={() => edit(null)}>
            <Plus size={17} /> Add account
          </button>
        )
      }
    >
      <Metrics
        entries={[
          ["Matching accounts", summary.data?.total ?? "—"],
          ["Active", summary.data?.active ?? "—"],
          ["Inactive / awaiting approval", summary.data?.inactive ?? "—"],
          ["Account roles", summary.data?.by_role.length ?? "—"],
        ]}
      />
      <section className="panel people-workspace">
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
            <button className="btn secondary">Search</button>
          </form>
          <label>
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
          <label>
            Access
            <select
              aria-label="Filter account access"
              value={filters.is_active}
              onChange={(event) => setFilter("is_active", event.target.value)}
            >
              <option value="">All accounts</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </label>
        </div>
        <ErrorNotice error={people.error || summary.error} onRetry={refresh} />
        {people.loading && <p role="status">Loading accounts…</p>}
        {!people.loading && !people.error && !people.data?.results.length && (
          <EmptyState
            title="No accounts match"
            description="Try another name, role or access filter."
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
                  <th>Account</th>
                  <th>Role</th>
                  <th>Access</th>
                  <th>Joined</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {people.data.results.map((person) => {
                  const protectedAccount =
                    person.role === "admin" && !canManageAdmins;
                  return (
                    <tr key={person.id}>
                      <td>
                        <div className="people-identity">
                          <span className="people-avatar">
                            <UserRound size={20} />
                          </span>
                          <div>
                            <strong>
                              {`${person.first_name} ${person.last_name}`.trim() ||
                                "Unnamed account"}
                            </strong>
                            <small>{person.email}</small>
                            <small>
                              {person.phone || `Account #${person.id}`}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{roleLabel(person.role)}</td>
                      <td>
                        <span
                          className={`status-pill ${person.is_active ? "delivered" : "cancelled"}`}
                        >
                          {person.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        {new Date(person.created_at).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td>
                        <div className="people-actions">
                          <button
                            type="button"
                            className="btn secondary"
                            disabled={protectedAccount || partnersOnly}
                            onClick={() => edit(person)}
                          >
                            Edit details
                          </button>
                          <button
                            type="button"
                            className="text-link"
                            disabled={protectedAccount || person.id === user.id}
                            onClick={() => {
                              setDecision({
                                person,
                                action: person.is_active ? "block" : "unblock",
                              });
                              setDraft(blank);
                              setError("");
                            }}
                          >
                            {person.is_active
                              ? "Block access"
                              : "Restore access"}
                          </button>
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
            className="btn secondary"
            disabled={filters.page === 1 || people.loading}
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
          >
            Previous accounts
          </button>
          <span>Page {filters.page}</span>
          <button
            className="btn secondary"
            disabled={!people.data?.next || people.loading}
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
          >
            Next accounts
          </button>
        </div>
      </section>
      <p className="people-audit-note">
        <ShieldCheck size={17} /> Access changes are recorded in the{" "}
        <Link to="/admin-activity">activity log</Link>. Inactive does not
        establish KYC verification. Review new partners in their respective
        workspace.
      </p>
      {editing && (
        <Modal
          title={editing.id ? "Edit account" : "Add account"}
          onClose={() => !busy && setEditing(null)}
        >
          <form className="people-form" onSubmit={save}>
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
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving…" : "Save account"}
            </button>
          </form>
        </Modal>
      )}
      {decision && (
        <Modal
          title={
            decision.action === "block"
              ? "Block account access?"
              : "Restore account access?"
          }
          onClose={() => !busy && setDecision(null)}
        >
          <form className="people-form" onSubmit={changeAccess}>
            <p>{decision.person.email}</p>
            <p className="muted">
              {decision.action === "block"
                ? "This account will lose access. Active orders must be resolved first; their status will not be changed by this action."
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
                    : "Confirm restore"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
