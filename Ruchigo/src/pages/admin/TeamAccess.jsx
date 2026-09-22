import { useState } from "react";
import toast from "react-hot-toast";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { apiRequest } from "../../lib/api.js";
import { useRemote } from "../../lib/product.js";
import { WorkspaceFrame } from "../../components/product/Workspace.jsx";
import { ErrorNotice, Modal } from "../../components/product/UI.jsx";
import "../../components/product/Operations.css";

export default function TeamAccess() {
  const { token } = useAuth();
  const remote = useRemote("/admin-access/", token);
  const [selected, setSelected] = useState(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/admin-access/${selected.id}/`, {
        token,
        method: "PUT",
        body: {
          full_access: selected.full_access,
          scopes: selected.full_access ? [] : selected.scopes,
          reason,
          expected_revision: selected.revision,
        },
      });
      setSelected(null);
      remote.reload();
      toast.success("Team permissions updated");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <WorkspaceFrame
      type="admin"
      title="Team access"
      description="Give each administrator only the workspaces their role needs."
    >
      <section className="panel">
        <ShieldCheck size={25} />
        <h2>Permissions apply at the API</h2>
        <p className="muted">
          Only superusers can delegate access. New administrators start without
          operational permissions. Existing administrators keep their previous
          access until reviewed. Changes affect subsequent API requests;
          navigation refreshes on the next session refresh.
        </p>
      </section>
      <ErrorNotice error={remote.error} onRetry={remote.reload} />
      {remote.loading && <p role="status">Loading administrators…</p>}
      <div className="access-grid">
        {remote.data?.administrators.map((person) => (
          <section className="panel" key={person.id}>
            <h3>{person.name || "Administrator"}</h3>
            <p className="muted">{person.email}</p>
            <span className="status-pill">
              {person.is_superuser
                ? "Superuser"
                : person.full_access
                  ? "Full operational access"
                  : `${person.scopes.length} workspaces`}
            </span>
            {person.review_required && (
              <p className="form-help">
                Existing access · permission review recommended
              </p>
            )}
            <ul className="access-scope-summary">
              {!person.full_access &&
                person.scopes.map((scope) => (
                  <li key={scope}>{remote.data.scopes[scope]}</li>
                ))}
            </ul>
            <button
              className="btn secondary"
              disabled={person.is_superuser}
              onClick={() => {
                setSelected({ ...person });
                setReason("");
                setError("");
              }}
            >
              Review permissions
            </button>
          </section>
        ))}
      </div>
      {selected && (
        <Modal
          title="Review administrator permissions"
          onClose={() => !busy && setSelected(null)}
        >
          <form className="people-form" onSubmit={save}>
            <p>{selected.email}</p>
            <label className="access-option">
              <input
                type="checkbox"
                checked={selected.full_access}
                onChange={(event) =>
                  setSelected({
                    ...selected,
                    full_access: event.target.checked,
                  })
                }
              />
              <span>
                <strong>Full operational access</strong>
                <small>
                  Includes financial decisions, account changes and policies.
                  Does not grant superuser access.
                </small>
              </span>
            </label>
            <div className="access-options">
              {Object.entries(remote.data.scopes).map(([scope, label]) => (
                <label key={scope} className="access-option">
                  <input
                    type="checkbox"
                    disabled={selected.full_access}
                    checked={
                      selected.full_access || selected.scopes.includes(scope)
                    }
                    onChange={(event) =>
                      setSelected({
                        ...selected,
                        scopes: event.target.checked
                          ? [...selected.scopes, scope]
                          : selected.scopes.filter((item) => item !== scope),
                      })
                    }
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
            <p className="form-help">
              Staff cancellation decisions require both Order operations and
              Finance. Support access alone cannot approve or submit refunds.
            </p>
            <label>
              Reason for access change
              <textarea
                required
                maxLength={500}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              />
            </label>
            <ErrorNotice error={error} />
            <button className="btn primary" disabled={busy}>
              {busy ? "Saving permissions…" : "Save permissions"}
            </button>
          </form>
        </Modal>
      )}
    </WorkspaceFrame>
  );
}
