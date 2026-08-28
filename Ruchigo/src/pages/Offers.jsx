import { Link } from "react-router-dom";
import { BadgePercent, Clock3, Truck } from "lucide-react";

const offers = [
  { title: "First order offer", tag: "Flat 50% off", description: "Applies on your very first checkout above ₹199." },
  { title: "Free delivery", tag: "Weekend special", description: "Enjoy free delivery across participating restaurants on weekends." },
  { title: "Combo saver", tag: "Biryani + dessert", description: "Save up to ₹80 on curated meal bundles every evening." },
];

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Offers</p>
        <h1 className="mt-3 text-4xl font-black sm:text-5xl">Valuable deals that keep every order better.</h1>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {offers.map((offer) => (
            <div key={offer.title} className="rounded-[24px] border border-orange-100 bg-orange-50 p-5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm">
                <BadgePercent size={20} />
              </div>
              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-orange-500">{offer.tag}</p>
              <h2 className="mt-2 text-xl font-bold text-gray-900">{offer.title}</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{offer.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-orange-600"><Clock3 size={16} /> Limited time availability</div>
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-2 text-orange-600"><Truck size={16} /> Free delivery partners</div>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          Explore the <Link to="/search" className="font-semibold text-orange-500">restaurant list</Link> to activate these offers.
        </div>
      </div>
    </main>
  );
}
