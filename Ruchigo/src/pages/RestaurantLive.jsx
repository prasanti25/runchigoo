import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Clock, MapPin, Search, Star } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { apiRequest } from "../lib/api.js";
import { fetchAllPages } from "../lib/collections.js";

export default function RestaurantLive() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest(`/restaurants/${id}/`),
      fetchAllPages(`/menu-items/?restaurant=${id}`),
    ]).then(([restaurantData, menuData]) => {
      if (!active) return;
      setRestaurant(restaurantData);
      setMenu(menuData);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  const categories = useMemo(() => ["All", ...new Set(menu.map((item) => item.category_name || "Menu"))], [menu]);
  const visibleMenu = useMemo(() => menu.filter((item) => {
    const matchesQuery = `${item.name} ${item.description}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === "All" || (item.category_name || "Menu") === category);
  }), [category, menu, query]);

  const add = async (item) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/restaurant/${id}` } } });
      return;
    }
    try {
      await addToCart(item);
      toast.success(`${item.name} added to cart.`);
    } catch (requestError) {
      toast.error(requestError.message);
    }
  };

  if (loading) return <><Navbar /><main className="min-h-screen bg-[#fffaf7] p-10 text-center">Loading restaurant…</main></>;
  if (error || !restaurant) return <><Navbar /><main className="min-h-screen bg-[#fffaf7] p-10 text-center"><p className="text-red-600">{error || "Restaurant not found."}</p><Link to="/search" className="mt-5 inline-flex rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white">Browse restaurants</Link></main></>;

  return <><Navbar /><main className="min-h-screen bg-[#fffaf7]"><section className="mx-auto max-w-7xl px-6 py-8"><div className="overflow-hidden rounded-[32px] bg-gradient-to-r from-orange-600 to-orange-400 text-white shadow-xl"><div className="grid items-center gap-8 p-8 lg:grid-cols-2"><div><p className="text-sm font-semibold uppercase tracking-widest text-orange-100">Open restaurant</p><h1 className="mt-3 text-4xl font-bold">{restaurant.name}</h1><p className="mt-4 text-orange-50">{restaurant.description || "Freshly prepared food"}</p><div className="mt-6 flex flex-wrap gap-3 text-sm"><span className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2"><Star size={17} />{restaurant.average_rating || "New"}</span><span className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2"><MapPin size={17} />{restaurant.city}</span></div><p className="mt-5 text-sm text-orange-50">{restaurant.address}</p></div><div className="h-72 overflow-hidden rounded-3xl bg-white/15"><img src={restaurant.image || "/favicon.svg"} alt={restaurant.name} className="h-full w-full object-cover" /></div></div></div><section className="py-10"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500">Menu</p><h2 className="mt-2 text-3xl font-bold">Choose your meal</h2></div><div className="flex items-center rounded-2xl border border-orange-100 bg-white px-4"><Search size={19} className="text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this menu" className="w-64 px-3 py-3 outline-none" /></div></div><div className="mt-6 flex flex-wrap gap-3">{categories.map((name) => <button key={name} onClick={() => setCategory(name)} className={`rounded-full px-4 py-2 text-sm font-semibold ${category === name ? "bg-orange-500 text-white" : "border border-orange-100 bg-white text-gray-600"}`}>{name}</button>)}</div><div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{visibleMenu.map((item) => <article key={item.id} className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm"><div className="h-48 bg-orange-50"><img src={item.image || "/favicon.svg"} alt={item.name} className="h-full w-full object-cover" /></div><div className="p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-sm font-semibold text-orange-500">{item.category_name || "Menu"}</p><h3 className="mt-1 text-xl font-bold">{item.name}</h3></div><span className="font-bold">₹{item.price}</span></div><p className="mt-3 line-clamp-2 text-sm text-gray-500">{item.description || "Freshly prepared."}</p><div className="mt-4 flex items-center gap-2 text-sm text-gray-500"><Clock size={16} />{item.preparation_minutes} minutes</div><button onClick={() => add(item)} className="mt-5 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white">Add to cart</button></div></article>)}</div>{!visibleMenu.length && <p className="mt-8 rounded-2xl bg-white p-6 text-gray-500">No matching menu items are available.</p>}</section></section></main></>;
}
