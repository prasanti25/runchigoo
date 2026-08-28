import { ShieldCheck } from "lucide-react";

const items = [
  "We only collect the minimum personal details needed to deliver your orders securely.",
  "Authentication and protected route checks help keep session access controlled.",
  "Order history, addresses, and profile data are stored locally in the demo frontend flow for a seamless experience.",
  "For production deployment, this frontend should be integrated with a secure backend privacy policy and data retention system.",
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Privacy</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Your data stays protected.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
          This frontend implements a secure-by-design customer experience while keeping complex privacy workflows ready for backend integration.
        </p>

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item} className="flex items-start gap-3 rounded-[20px] border border-orange-100 bg-orange-50 p-4">
              <ShieldCheck className="mt-0.5 text-orange-500" size={20} />
              <p className="text-sm leading-6 text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
