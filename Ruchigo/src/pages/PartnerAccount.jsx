import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Bike,
  LifeBuoy,
  LockKeyhole,
  Mail,
  Phone,
  Power,
  Settings,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { WorkspaceFrame, Metrics } from "../components/product/Workspace.jsx";
import { ErrorNotice } from "../components/product/UI.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useRemote } from "../lib/product.js";
import ProfilePhoto from "../components/common/ProfilePhoto.jsx";

export default function PartnerAccount() {
  const { user, role, token, updateProfile } = useAuth();
  const delivery = role === "delivery";
  const [busy, setBusy] = useState(false);
  const summary = useRemote(delivery ? "/orders/summary/" : null, token);
  const name =
    [user.first_name, user.last_name].filter(Boolean).join(" ") ||
    "Your account";
  const toggle = async () => {
    setBusy(true);
    try {
      await updateProfile({ is_available: !user.is_available });
      toast.success("Availability updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <WorkspaceFrame
      type={role}
      title="My profile"
      description="Your account details, sign-in settings and support, together in one place."
      action={
        <Link className="btn secondary" to="/settings">
          <Settings size={16} />
          Account settings
        </Link>
      }
    >
      <header className="profile-header partner-profile-header">
        <ProfilePhoto />
        <div className="profile-heading">
          <p>{delivery ? "DELIVERY PARTNER" : "PLATFORM ADMINISTRATOR"}</p>
          <h2>{name}</h2>
          <div className="profile-contact">
            <span>{user.email}</span>
            <span>
              Joined{" "}
              {new Date(user.created_at).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
        {delivery && (
          <button
            className={`btn ${user.is_available ? "dark" : "secondary"}`}
            disabled={busy}
            onClick={toggle}
          >
            <Power size={16} />
            {busy
              ? "Updating…"
              : user.is_available
                ? "You’re online"
                : "Go online"}
          </button>
        )}
      </header>
      {delivery && (
        <>
          <ErrorNotice error={summary.error} onRetry={summary.reload} />
          <Metrics
            entries={[
              [
                "Completed deliveries",
                summary.data
                  ? summary.data.by_status.find(
                      (row) => row.status === "delivered",
                    )?.count || 0
                  : "—",
              ],
              [
                "Active deliveries",
                summary.data
                  ? summary.data.by_status
                      .filter((row) =>
                        ["assigned", "out_for_delivery"].includes(row.status),
                      )
                      .reduce((sum, row) => sum + row.count, 0)
                  : "—",
              ],
              ["Account status", user.is_active ? "Active" : "Inactive"],
            ]}
          />
        </>
      )}
      <div className="partner-profile-grid">
        <section className="panel">
          <h2>Contact details</h2>
          <dl className="partner-details">
            <div>
              <dt>
                <Mail size={17} />
                Email
              </dt>
              <dd>
                {user.email}
                <small>
                  {user.email_verified
                    ? "Email verified"
                    : "Email not yet verified"}
                </small>
              </dd>
            </div>
            <div>
              <dt>
                <Phone size={17} />
                Phone
              </dt>
              <dd>{user.phone || "Not added"}</dd>
            </div>
          </dl>
          <Link className="text-link" to="/settings">
            Update details <ArrowRight size={15} />
          </Link>
        </section>
        <section className="panel">
          <h2>Account access</h2>
          <div className="partner-access">
            <LockKeyhole size={23} />
            <div>
              <h3>Password & sign-in</h3>
              <p>
                Update your password in account settings. Keep verification
                codes private.
              </p>
              <Link className="text-link" to="/settings">
                Manage security <ArrowRight size={15} />
              </Link>
            </div>
          </div>
          <div className="partner-access">
            <ShieldCheck size={23} />
            <div>
              <h3>Your privacy</h3>
              <p>
                See how account and {delivery ? "delivery" : "administrative"}{" "}
                activity is used.
              </p>
              <Link className="text-link" to="/privacy">
                Read privacy policy <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </div>
      <div className="workspace-quicklinks">
        <Link to={delivery ? "/delivery-orders" : "/admin-activity"}>
          {delivery ? <Bike size={22} /> : <ShieldCheck size={22} />}
          <div>
            <strong>
              {delivery
                ? "Ready for your next delivery?"
                : "Review account activity"}
            </strong>
            <span>
              {delivery
                ? "View requests and continue active deliveries."
                : "Open the recorded platform activity log."}
            </span>
          </div>
          <ArrowRight size={18} />
        </Link>
        <Link to="/support">
          <LifeBuoy size={22} />
          <div>
            <strong>Need help with your account?</strong>
            <span>Open a ticket and follow the conversation.</span>
          </div>
          <ArrowRight size={18} />
        </Link>
      </div>
    </WorkspaceFrame>
  );
}
