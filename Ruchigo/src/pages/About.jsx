import { Link } from "react-router-dom";
import { HeartHandshake, ShieldCheck, Truck, UtensilsCrossed } from "lucide-react";

const highlights = [
  { icon: UtensilsCrossed, label: "Curated restaurants" },
  { icon: Truck, label: "Fast deliveries" },
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: HeartHandshake, label: "Customer-first support" },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">About RuchiGo</p>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Premium food delivery, designed for modern living.</h1>
          <p className="mt-4 text-base leading-7 text-gray-600">
            RuchiGo brings together restaurant discovery, smart ordering, and dependable delivery into one polished experience. We focus on speed, trust, and delight for every order.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {highlights.map(({ icon: Icon, label }) => (
            <div key={label} className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                <Icon size={20} />
              </div>
              <p className="mt-4 text-base font-semibold text-gray-900">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[28px] bg-gradient-to-r from-orange-500 to-red-500 p-[1px]">
          <div className="rounded-[27px] bg-white p-6">
            <h2 className="text-2xl font-bold text-gray-900">What makes us different</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
              <li>• Context-aware ordering flows that keep checkout simple and fast.</li>
              <li>• Responsive, role-specific dashboards for customers, restaurants, delivery partners, and admins.</li>
              <li>• Production-oriented architecture with reusable components and secure route handling.</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          Return to <Link className="font-semibold text-orange-500" to="/">home</Link> or explore the <Link className="font-semibold text-orange-500" to="/search">restaurant catalog</Link>.
        </div>
      </div>
    </main>
  );
}
