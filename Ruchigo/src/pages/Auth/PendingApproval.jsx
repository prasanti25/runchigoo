import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthFooter from "../../components/auth/AuthFooter";

const PendingApproval = () => {
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
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Approval in progress</h2>
          <p className="mt-4 text-sm leading-6 text-gray-600">
            We have received your application. A member of our admin team will review your account and notify you once it is approved.
          </p>
        </div>

        <div className="rounded-3xl border border-orange-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">What happens next?</h3>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>• We'll review your account details and activate it if everything looks good.</li>
            <li>• Restaurant and delivery accounts may take up to 24 hours for approval.</li>
            <li>• You can try logging in again once your account has been approved.</li>
          </ul>
        </div>

        <div className="flex flex-col items-center gap-4">
          <Link to="/login" className="w-full rounded-2xl bg-orange-500 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-orange-600">
            Back to Login
          </Link>
          <p className="text-sm text-gray-500">If you already have an account, you can log in with your existing credentials.</p>
        </div>
      </div>

      <AuthFooter />
    </AuthLayout>
  );
};

export default PendingApproval;
