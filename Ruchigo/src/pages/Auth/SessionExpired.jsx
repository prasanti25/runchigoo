import { Link } from "react-router-dom";
import AuthLayout from "../../components/auth/AuthLayout.jsx";

export default function SessionExpired() {
  return <AuthLayout title="Session expired" subtitle="For your security, please sign in again."><Link to="/login" className="flex justify-center rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white">Go to login</Link></AuthLayout>;
}
