import { Link, useLocation } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFooter from "../../components/auth/AuthFooter";

const PendingApproval = () => {
  const { state } = useLocation();
  const role =
    state?.role === "delivery"
      ? "Delivery partner"
      : state?.role === "restaurant"
        ? "Restaurant partner"
        : "Partner";
  return (
    <AuthLayout
      title="Registration Pending Approval"
      subtitle="Thanks for signing up. Your account is under review by our team."
    >
      <div className="space-y-8 py-8">
        <div className="rounded-3xl border border-orange-100 bg-orange-50 p-8 text-center shadow-sm">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg">
            <MailCheck size={32} />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Approval in progress
          </h2>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            Your {role.toLowerCase()} account is registered. An administrator
            needs to approve sign-in access before you can open your dashboard.
          </p>
          {state?.email && (
            <p className="mt-3 break-all text-sm font-semibold text-gray-800">
              {state.email}
            </p>
          )}
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">
            What happens next?
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>
              • We'll review your account details and activate it if everything
              looks good.
            </li>
            <li>
              • Keep your registration email and password; no new account is
              needed.
            </li>
            <li>
              • Once approved, sign in again to open your{" "}
              {state?.role === "delivery" ? "delivery" : "partner"} dashboard.
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link
            to="/login"
            state={{ email: state?.email, role: state?.role }}
            className="w-full rounded-2xl bg-orange-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Sign in after approval
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-gray-600 underline"
          >
            Need help with your application?
          </Link>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default PendingApproval;
