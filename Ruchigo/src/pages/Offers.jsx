import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BadgePercent, Clock3 } from "lucide-react";
import { fetchAllPages } from "../lib/collections.js";

export default function OffersPage() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAllPages("/offers/")
      .then(setOffers)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return <main className="min-h-screen bg-[#fff8f5] px-4 py-10 text-gray-900 sm:px-6 lg:px-8"><div className="mx-auto max-w-5xl rounded-[32px] border border-orange-100 bg-white p-6 shadow-sm sm:p-8 lg:p-10"><p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-500">Offers</p><h1 className="mt-3 text-4xl font-black sm:text-5xl">Available RuchiGo offers</h1><p className="mt-3 text-gray-600">Only currently active offers are shown here.</p>{loading && <p className="mt-8 text-gray-500">Loading offers…</p>}{error && <p className="mt-8 rounded-2xl bg-red-50 p-5 text-red-700">{error}</p>}<div className="mt-8 grid gap-4 md:grid-cols-3">{offers.map((offer) => <article key={offer.id} className="rounded-[24px] border border-orange-100 bg-orange-50 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm"><BadgePercent size={20} /></div><h2 className="mt-4 text-xl font-bold">{offer.title}</h2><p className="mt-2 text-sm leading-6 text-gray-600">{offer.description || "See checkout for applicable terms."}</p><p className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-orange-600"><Clock3 size={15} />Ends {new Date(offer.ends_at).toLocaleString()}</p></article>)}</div>{!loading && !error && !offers.length && <p className="mt-8 rounded-2xl bg-orange-50 p-6 text-gray-600">There are no active offers right now.</p>}<div className="mt-8 text-sm text-gray-600">Browse <Link to="/search" className="font-semibold text-orange-500">available restaurants and dishes</Link>.</div></div></main>;
}
