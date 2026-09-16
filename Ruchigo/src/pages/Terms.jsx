import { CheckCircle2 } from "lucide-react";

const points = [
  "Users must provide accurate account information during registration and login.",
  "Orders are subject to restaurant availability, delivery timing, and payment authorization.",
  "Platform usage should remain respectful, legal, and compliant with local commerce rules.",
  "Customers may cancel only while the order status and restaurant workflow permit cancellation.",
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Terms</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Platform terms of use.</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
          By using RuchiGo, you agree to these conditions for account access, ordering, payment, delivery, and acceptable platform use.
        </p>

        <div className="mt-8 space-y-4">
          {points.map((point) => (
            <div key={point} className="flex items-start gap-3 rounded-[20px] border border-orange-100 bg-orange-50 p-4">
              <CheckCircle2 className="mt-0.5 text-orange-500" size={18} />
              <p className="text-sm leading-6 text-gray-700">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
